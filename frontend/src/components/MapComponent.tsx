import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';

// Flexible types to allow any central Incident or Resource structure
export interface Incident {
  id: string | number;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  title?: string;
  name?: string;
  description?: string;
  [key: string]: any; // Handles any additional fields from src/types
}

export interface Resource {
  id: string | number;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  title?: string;
  name?: string;
  [key: string]: any; // Handles any additional fields from src/types
}

interface MapComponentProps {
  incidents: Incident[];
  resources: Resource[];
}

export const MapComponent: React.FC<MapComponentProps> = ({ incidents, resources }) => {
  return (
    <MapContainer 
      center={[0, 0]} 
      zoom={13} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Map incidents: checks latitude/longitude or fallback lat/lng */}
      {incidents?.map((inc) => {
        const lat = inc.latitude ?? inc.lat;
        const lng = inc.longitude ?? inc.lng;
        const displayTitle = inc.title || inc.name || 'Incident';

        return lat != null && lng != null ? (
          <Marker key={inc.id} position={[lat, lng]}>
            <Popup>{displayTitle}</Popup>
          </Marker>
        ) : null;
      })}

      {/* Map resources: checks latitude/longitude or fallback lat/lng */}
      {resources?.map((res) => {
        const lat = res.latitude ?? res.lat;
        const lng = res.longitude ?? res.lng;
        const displayTitle = res.title || res.name || 'Resource';

        return lat != null && lng != null ? (
          <Marker key={res.id} position={[lat, lng]}>
            <Popup>{displayTitle}</Popup>
          </Marker>
        ) : null;
      })}
    </MapContainer>
  );
};

export default MapComponent;