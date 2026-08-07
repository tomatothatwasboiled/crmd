export interface Incident {
  id: number;
  description: string;
  location: string;
  disaster_type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  verified: boolean;
  confidence_score: number;
  assigned_resources: string[];
  created_at: string;
}

export interface ResourceUnit {
  id: number;
  name: string;
  resource_type: string;
  status: string;
  latitude: number;
  longitude: number;
}