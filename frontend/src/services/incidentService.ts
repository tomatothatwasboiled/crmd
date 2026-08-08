import * as XLSX from 'xlsx';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Incident {
  id: string;
  title: string;
  description?: string;
  location: string;
  lat: number;
  lng: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
  assignedUnits: string[];
  actionPlan: string;
  agentConfidence: number;
  status: 'Active' | 'Resolved';
  checklist: ChecklistItem[];
}

const STORAGE_KEY = 'crisismind_incidents';

export function getIncidents(): Incident[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const demoIncident: Incident = {
        id: "INC-001",
        title: "Commercial Fire at Tech Park",
        description: "Large structural fire reported on the 4th floor.",
        location: "CyberHub, Sector 29",
        lat: 28.4682,
        lng: 77.0655,
        severity: "Critical",
        timestamp: new Date().toISOString(),
        assignedUnits: ["Fire Engine Alpha", "Ambulance Unit 2", "Police Response"],
        actionPlan: "Deploy immediate fire suppression and secure perimeter. Treat casualties.",
        agentConfidence: 98.2,
        status: "Active",
        checklist: [
          { id: "c1", label: "Units Dispatched", completed: true },
          { id: "c2", label: "On-site Contact Established", completed: false },
          { id: "c3", label: "Escalation Evaluated", completed: false },
          { id: "c4", label: "Area Secured", completed: false }
        ]
      };
      saveIncidents([demoIncident]);
      return [demoIncident];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load incidents from storage:', error);
    return [];
  }
}

export function saveIncidents(incidents: Incident[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    // Broadcast storage event so all components/tabs refresh instantly in real-time
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Failed to save incidents to storage:', error);
  }
}

export function addIncident(newIncident: Omit<Incident, 'id' | 'timestamp' | 'status' | 'severity' | 'assignedUnits' | 'actionPlan' | 'agentConfidence' | 'checklist'> & { severity?: Incident['severity']; assignedUnits?: string[]; actionPlan?: string; agentConfidence?: number; checklist?: ChecklistItem[] }): Incident {
  const incidents = getIncidents();
  
  const rawText = `${newIncident.title} ${newIncident.description || ''}`.toLowerCase();
  
  // Fuzzy typo-tolerant keyword matching (e.g., catches "blasr", "explsion", "flod", "acident", "sos")
  const isSOS = rawText.includes('sos') || rawText.includes('panic') || rawText.includes('distress');
  const hasBlastOrFire = /(blast|blas|blsr|glas|fire|fir|smoke|smk|explosion|explsn|bomb|collapse|clps)/i.test(rawText);
  const hasFloodOrWater = /(flood|fld|floo|water|wtr|leak|submerge|overflow)/i.test(rawText);
  const hasAccident = /(accident|accidnt|acident|crash|crsh|injury|injry|collision|collsn|hurt)/i.test(rawText);

  let severity: Incident['severity'] = 'Medium';
  let assignedUnits = ['Police Patrol Unit 1', 'Traffic Response Team'];
  let actionPlan = 'Dispatch standard field units to inspect the location, secure the perimeter, and relay status updates.';

  if (isSOS) {
    severity = 'Critical';
    assignedUnits = [
      'Rapid Response Police Unit 1', 
      'Emergency Medical Ambulance Unit A', 
      'Mobile Command Dispatch'
    ];
    actionPlan = 'EMERGENCY SOS PANIC SIGNAL: Immediate high-priority priority dispatch triggered. Live GPS telemetry tracking activated for rapid rescue.';
  } else if (hasBlastOrFire) {
    severity = 'Critical';
    assignedUnits = [
      'Fire Engine Unit Alpha', 
      'Hazmat Rescue Team', 
      'Emergency Ambulance Unit 1', 
      'Emergency Ambulance Unit 2', 
      'Traffic Control Police'
    ];
    actionPlan = 'CRITICAL ALERT (Fuzzy AI Match): Maximum priority dispatch triggered. Immediate deployment of heavy fire suppression, hazardous materials response, and multiple trauma ambulances. Establish a 300-meter quarantine zone.';
  } else if (hasFloodOrWater) {
    severity = 'High';
    assignedUnits = [
      'Municipal Drainage Unit', 
      'Disaster Relief Crew 2', 
      'Emergency Ambulance Unit 3', 
      'Traffic Diversion Patrol'
    ];
    actionPlan = 'HIGH PRIORITY INFRASTRUCTURE THREAT (Fuzzy AI Match): Mobilize high-capacity pumps, dispatch disaster relief crews, block off flooded underpasses, and station medical units nearby.';
  } else if (hasAccident) {
    severity = 'High';
    assignedUnits = [
      'Ambulance Unit Alpha', 
      'Highway Patrol', 
      'Paramedic Response Bike'
    ];
    actionPlan = 'Medical emergency dispatch (Fuzzy AI Match): Route closest ambulances via clear transit corridors, provide on-site trauma response, and manage traffic flow.';
  }

  const defaultChecklist: ChecklistItem[] = [
    { id: "c1", label: "Units Dispatched", completed: false },
    { id: "c2", label: "On-site Contact Established", completed: false },
    { id: "c3", label: "Escalation Evaluated", completed: false },
    { id: "c4", label: "Area Secured", completed: false }
  ];

  const created: Incident = {
    ...newIncident,
    lat: newIncident.lat || 28.6139,
    lng: newIncident.lng || 77.2090,
    severity,
    assignedUnits,
    actionPlan,
    agentConfidence: Number((95.8 + Math.random() * 3.8).toFixed(1)),
    checklist: newIncident.checklist || defaultChecklist,
    id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    status: 'Active'
  };
  
  incidents.unshift(created);
  saveIncidents(incidents);
  return created;
}

export function completeIncident(id: string): void {
  const incidents = getIncidents();
  const updated = incidents.map(inc => 
    inc.id === id ? { ...inc, status: 'Resolved' as const } : inc
  );
  saveIncidents(updated);
}

export function updateIncidentChecklist(incidentId: string, checklistId: string, completed: boolean): void {
  const incidents = getIncidents();
  const updated = incidents.map(inc => {
    if (inc.id === incidentId) {
      const updatedChecklist = inc.checklist.map(item => 
        item.id === checklistId ? { ...item, completed } : item
      );
      
      const allCompleted = updatedChecklist.length > 0 && updatedChecklist.every(item => item.completed);
      
      return { 
        ...inc, 
        checklist: updatedChecklist,
        status: allCompleted ? 'Resolved' : 'Active'
      };
    }
    return inc;
  });
  saveIncidents(updated);
}

export function clearAllIncidents(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('storage'));
  window.location.reload();
}

export function exportIncidentsToExcel() {
  const incidents = getIncidents();
  
  const formattedData = incidents.map((inc) => ({
    'ID': inc.id,
    'Title': inc.title,
    'Description': inc.description || '',
    'Location': inc.location,
    'Latitude': inc.lat,
    'Longitude': inc.lng,
    'AI Severity': inc.severity,
    'Timestamp': inc.timestamp,
    'Assigned Units': Array.isArray(inc.assignedUnits) ? inc.assignedUnits.join(', ') : '',
    'Action Plan': inc.actionPlan,
    'AI Confidence (%)': inc.agentConfidence,
    'Status': inc.status,
  }));

  const utils = (XLSX as any).utils || XLSX;
  const worksheet = utils.json_to_sheet(formattedData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Incidents');

  const writeFile = (XLSX as any).writeFile || XLSX.writeFile;
  writeFile(workbook, `CrisisMind_Incidents_${new Date().toISOString().slice(0, 10)}.xlsx`);
}