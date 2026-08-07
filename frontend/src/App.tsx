import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { 
  Activity, AlertTriangle, ShieldCheck, Truck, Navigation, 
  Radio, Clock, MapPin, Bot, CheckCircle2, Cpu, ArrowLeft, PlusCircle, Loader2, Siren, LifeBuoy, Sparkles
} from 'lucide-react';
import { IncidentDashboardControls } from './components/IncidentDashboardControls';
import { IncidentMap } from './components/IncidentMap';
import { SOSApp } from './components/SOSApp';
import { DispatchedUnitsView } from './components/DispatchedUnitsView';
import { 
  Incident, 
  getIncidents, 
  addIncident, 
  completeIncident,
  clearAllIncidents 
} from './services/incidentService';
import API from './services/api';
import { processEmergencyWithPhi3 } from './services/triageService';

// Geocoding function
async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number }> {
  const cleanLocation = locationName.trim();
  if (!cleanLocation) return { lat: 28.6139, lng: 77.2090 };

  const searchCandidates = [
    cleanLocation,
    `${cleanLocation}, Delhi`,
    `${cleanLocation}, India`,
    cleanLocation.replace(/[^a-zA-Z0-9 ]/g, ''),
  ];

  for (const query of searchCandidates) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3&dedupe=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'CrisisMindAI-App/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      }
    } catch (err) {
      console.error(`Error geocoding location candidate "${query}":`, err);
    }
  }

  return { lat: 28.6139, lng: 77.2090 };
}

// Incident Feed Component
const IncidentFeed: React.FC<{ 
  incidents: Incident[]; 
  onComplete: (id: string) => void; 
}> = ({ incidents, onComplete }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Active Incident Log</h2>
        <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
          {incidents.length} Total Records
        </span>
      </div>

      {incidents.map((inc) => (
        <div
          key={inc.id}
          className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-500/50 transition group"
        >
          <Link to={`/feed/${inc.id}`} className="flex items-start gap-3 flex-1">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition">{inc.title}</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  inc.status === 'Resolved' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {inc.status}
                </span>
              </div>

              {inc.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{inc.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-1.5">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-400" /> {inc.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {Array.isArray(inc.assignedUnits) && inc.assignedUnits.map((unit, idx) => (
                  <span key={idx} className="text-[11px] bg-slate-950 text-emerald-400 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-emerald-400" /> {unit}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          <div className="flex flex-col md:items-end gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
              inc.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              inc.severity === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              AI Severity: {inc.severity}
            </span>

            {inc.status !== 'Resolved' && (
              <button
                onClick={() => onComplete(inc.id)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Incident Detail Component
const IncidentDetail: React.FC<{ 
  incidents: Incident[]; 
  onComplete: (id: string) => void; 
}> = ({ incidents, onComplete }) => {
  const { id } = useParams<{ id: string }>();
  const incident = incidents.find((i) => i.id === id);

  if (!incident) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono bg-slate-900 border border-slate-800 rounded-xl">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        Incident ID #{id} not found in database registry.
        <div className="mt-4">
          <Link to="/feed" className="text-sm text-indigo-400 underline">Return to Feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link 
        to="/feed" 
        className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Incident Feed
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>INCIDENT_ID: #{incident.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(incident.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">{incident.title}</h1>
            <p className="flex items-center gap-1 text-sm text-slate-400 mt-1">
              <MapPin className="w-4 h-4 text-rose-400" /> {incident.location} ({incident.lat.toFixed(4)}, {incident.lng.toFixed(4)})
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              incident.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              incident.severity === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              AI Evaluated Severity: {incident.severity}
            </span>

            {incident.status !== 'Resolved' ? (
              <button
                onClick={() => onComplete(incident.id)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Resolved
              </button>
            ) : (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Incident Resolved
              </span>
            )}
          </div>
        </div>

        {incident.description && (
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Report Description</h4>
            <p className="text-sm text-slate-200">{incident.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="text-xs text-slate-400">Autonomous Criticality Engine</p>
              <p className="text-sm font-semibold text-slate-200">Phi-3 Mini Local Agent</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-400">AI Triage Status</p>
              <p className="text-sm font-semibold text-emerald-400">Active & Connected</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Siren className="w-4 h-4 text-indigo-400" /> AI Auto-Dispatched Response Units
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.isArray(incident.assignedUnits) && incident.assignedUnits.map((unit, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-3">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">{unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-amber-400" /> Autonomous Emergency Protocol
          </h3>
          <p className="text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg leading-relaxed font-mono">
            {incident.actionPlan}
          </p>
        </div>
      </div>
    </div>
  );
};

// Agent Monitor Component
const AgentMonitor: React.FC = () => {
  const agents = [
    { name: 'Phi-3 Mini Triage Engine', status: 'Ollama Active Listening', load: '64%', desc: 'Parses incoming alerts locally and assesses threat levels via Ollama' },
    { name: 'Dispatch Coordinator AI', status: 'Routing Ambulances & Fire Trucks', load: '78%', desc: 'Deploys appropriate units based on evaluated criticality' },
    { name: 'Geospatial Intelligence Agent', status: 'Fuzzy Location Resolution Active', load: '52%', desc: 'Resolves exact geographic coordinates even from misspelled input' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Autonomous AI Agents Status</h2>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-mono">
          3 Agents Operational
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Bot className="w-6 h-6 text-indigo-400" />
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-100">{agent.name}</h3>
              <p className="text-xs text-emerald-400 font-mono mt-1">{agent.status}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{agent.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> Core Load</span>
              <span className="font-mono text-slate-300 font-bold">{agent.load}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Home Dashboard Component
interface HomeDashboardProps {
  incidents: Incident[];
  onAddIncident: (newInc: Parameters<typeof addIncident>[0]) => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ incidents, onAddIncident }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !locationName) return;

    setIsProcessing(true);
    
    try {
      const coords = await geocodeLocation(locationName);
      const userInputText = `${title}. ${description}`;
      const aiAnalysis = await processEmergencyWithPhi3(userInputText);

      const newIncidentData = {
        id: `INC-${Math.floor(100 + Math.random() * 900)}`,
        title: aiAnalysis.title || title,
        severity: aiAnalysis.severity || 'High',
        description: aiAnalysis.description || description,
        protocol: aiAnalysis.protocol || 'Standard deployment protocol.',
        location: locationName,
        lat: coords.lat,
        lng: coords.lng,
        status: 'Active' as const,
        timestamp: new Date().toISOString(),
        assignedUnits: aiAnalysis.unitsToDispatch?.map((u: any) => u.name) || ['Response Unit 1'],
        actionPlan: aiAnalysis.protocol
      };

      await API.saveIncidentToSQL(newIncidentData);
      onAddIncident(newIncidentData);

      setTitle('');
      setDescription('');
      setLocationName('');
    } catch (error) {
      console.error('Failed to process and save emergency report:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');

  const activeDispatchedUnits = activeIncidents.reduce((acc, curr) => {
    return acc + (Array.isArray(curr.assignedUnits) ? curr.assignedUnits.length : 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          to="/feed" 
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition"
        >
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Incidents</p>
            <h3 className="text-2xl font-bold mt-1">{activeIncidents.length} Active</h3>
          </div>
        </Link>

        <Link 
          to="/monitor" 
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition"
        >
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">AI Decision Engine</p>
            <h3 className="text-2xl font-bold mt-1 text-indigo-400">Phi-3 Local Triage</h3>
          </div>
        </Link>

        <Link 
          to="/units" 
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition"
        >
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Dispatched Vehicles</p>
            <h3 className="text-2xl font-bold mt-1">
              {activeDispatchedUnits} Units
            </h3>
          </div>
        </Link>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h2 className="text-lg font-semibold">Emergency Intake Form</h2>
          </div>
          
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>Phi-3 AI & SQL Persistence active.</span>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Incident Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Explosion in commercial area / Smoke detected"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Detailed Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details (e.g. multiple people injured, fire spreading...)"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Location Name (Supports Typos)</label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Connaught Place, Hauz Khas, London"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button 
            type="submit"
            disabled={isProcessing}
            className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Running Phi-3 Triage & Saving to SQL...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" /> Submit Report to AI
              </>
            )}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold">Live Incident Map</h2>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
            Autonomous AI Grid
          </span>
        </div>

        <IncidentMap incidents={incidents} />
      </div>
    </div>
  );
};

// Main Application Component
export default function App() {
  const location = useLocation();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const loadIncidents = () => {
    setIncidents(getIncidents());
  };

  useEffect(() => {
    const initialIncidents = getIncidents();
    if (initialIncidents.length > 0) {
      setIncidents(initialIncidents);
    } else {
      setIncidents([]);
    }
  }, []);

  const handleAddIncident = (newInc: Parameters<typeof addIncident>[0]) => {
    addIncident(newInc);
    loadIncidents();
  };

  const handleCompleteIncident = (id: string) => {
    completeIncident(id);
    loadIncidents();
  };

  const handleResetData = () => {
    clearAllIncidents();
    setIncidents([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <IncidentDashboardControls />

      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <Activity className="w-7 h-7 text-red-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
            CrisisMind AI
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex gap-2 bg-slate-800/60 p-1 rounded-lg border border-slate-700/50">
            <Link
              to="/"
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                location.pathname === '/' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/feed"
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                location.pathname.startsWith('/feed') ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Incident Feed ({incidents.length})
            </Link>
            <Link
              to="/monitor"
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                location.pathname === '/monitor' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agent Monitor
            </Link>
            <Link
              to="/units"
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                location.pathname === '/units' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ground Units
            </Link>
            <Link
              to="/sos"
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                location.pathname === '/sos' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SOS Beacon
            </Link>
          </nav>

          <button
            onClick={handleResetData}
            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg transition"
          >
            Clear All Data & Reset
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Routes>
          <Route 
            path="/" 
            element={<HomeDashboard incidents={incidents} onAddIncident={handleAddIncident} />} 
          />
          <Route 
            path="/feed" 
            element={<IncidentFeed incidents={incidents} onComplete={handleCompleteIncident} />} 
          />
          <Route 
            path="/feed/:id" 
            element={<IncidentDetail incidents={incidents} onComplete={handleCompleteIncident} />} 
          />
          <Route 
            path="/monitor" 
            element={<AgentMonitor />} 
          />
          <Route 
            path="/units" 
            element={<DispatchedUnitsView incidents={incidents} />} 
          />
          <Route 
            path="/sos" 
            element={<SOSApp />} 
          />
        </Routes>
      </main>
    </div>
  );
}