const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL) || 'http://localhost:8000';

export const fetchCrisisData = async () => {
  const response = await fetch(`${API_BASE_URL}/api/crisis`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export const saveIncidentToSQL = async (incidentData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incidentData),
  });
  if (!response.ok) {
    throw new Error('Failed to save incident');
  }
  return response.json();
};

export const fetchIncidentsFromSQL = async () => {
  const response = await fetch(`${API_BASE_URL}/api/incidents`);
  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }
  return response.json();
};

const API = {
  fetchCrisisData,
  saveIncidentToSQL,
  fetchIncidentsFromSQL,
};

export default API;