export interface Incident {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  summary?: string;
  timestamp: string;
}