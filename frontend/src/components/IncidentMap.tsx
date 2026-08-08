import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Incident } from '../services/incidentService';

// Fix Leaflet default marker configuration for TypeScript
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const createServiceIcon = (type: 'police' | 'ambulance' | 'fire' | 'hazmat') => {
  const symbols = {
    police: '🛡️',
    ambulance: '🚑',
    fire: '🚒',
    hazmat: '☣️',
  };

  return L.divIcon({
    className: 'custom-service-icon',
    html: `<div style="background-color: ${
      type === 'police' ? '#2563eb' : type === 'ambulance' ? '#059669' : type === 'hazmat' ? '#d97706' : '#dc2626'
    }; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); font-size: 13px;">
      ${symbols[type]}
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const incidentIcon = L.divIcon({
  className: 'custom-incident-icon',
  html: `<div style="background-color: #f59e0b; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); font-size: 16px;">
    ⚠️
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface IncidentMapProps {
  incidents: Incident[];
}

interface Node {
  id: string;
  lat: number;
  lng: number;
  neighbors: { node: string; weight: number }[];
}

function findRoadPath(start: [number, number], end: [number, number]): [number, number][] {
  const nodes: Record<string, Node> = {};
  const steps = 6;
  const latStep = (end[0] - start[0]) / steps;
  const lngStep = (end[1] - start[1]) / steps;

  for (let r = 0; r <= steps; r++) {
    for (let c = 0; c <= steps; c++) {
      const id = `${r}-${c}`;
      const jitterLat = (r > 0 && r < steps && c > 0 && c < steps) ? (Math.sin(r * c) * 0.001) : 0;
      const jitterLng = (r > 0 && r < steps && c > 0 && c < steps) ? (Math.cos(r * c) * 0.001) : 0;
      
      nodes[id] = {
        id,
        lat: start[0] + r * latStep + jitterLat,
        lng: start[1] + c * lngStep + jitterLng,
        neighbors: [],
      };
    }
  }

  for (let r = 0; r <= steps; r++) {
    for (let c = 0; c <= steps; c++) {
      const currentId = `${r}-${c}`;
      const curr = nodes[currentId];

      const potentialNeighbors = [
        r < steps ? `${r + 1}-${c}` : null,
        r > 0 ? `${r - 1}-${c}` : null,
        c < steps ? `${r}-${c + 1}` : null,
        c > 0 ? `${r}-${c - 1}` : null,
      ];

      potentialNeighbors.forEach((nId) => {
        if (nId && nodes[nId]) {
          const nNode = nodes[nId];
          const dist = Math.hypot(nNode.lat - curr.lat, nNode.lng - curr.lng);
          curr.neighbors.push({ node: nId, weight: dist });
        }
      });
    }
  }

  const startId = `0-0`;
  const endId = `${steps}-${steps}`;

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  Object.keys(nodes).forEach((id) => {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  });

  distances[startId] = 0;

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let shortestDist = Infinity;

    unvisited.forEach((id) => {
      if (distances[id] < shortestDist) {
        shortestDist = distances[id];
        currentId = id;
      }
    });

    if (currentId === null || currentId === endId) break;
    unvisited.delete(currentId);

    const currentNode = nodes[currentId];
    currentNode.neighbors.forEach(({ node: neighborId, weight }) => {
      if (unvisited.has(neighborId)) {
        const alt = distances[currentId!] + weight;
        if (alt < distances[neighborId]) {
          distances[neighborId] = alt;
          previous[neighborId] = currentId;
        }
      }
    });
  }

  const path: [number, number][] = [];
  let curr: string | null = endId;
  while (curr !== null) {
    path.unshift([nodes[curr].lat, nodes[curr].lng]);
    curr = previous[curr];
  }

  return path.length > 1 ? path : [start, end];
}

export const IncidentMap: React.FC<IncidentMapProps> = ({ incidents }) => {
  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');
  
  const mapCenter: [number, number] = activeIncidents.length > 0 
    ? [activeIncidents[0].lat, activeIncidents[0].lng] 
    : incidents.length > 0 
      ? [incidents[0].lat, incidents[0].lng] 
      : [28.6139, 77.2090];

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.01;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeIncidents[0]?.id]);

  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer 
        key={`${mapCenter[0]}-${mapCenter[1]}`}
        center={mapCenter} 
        zoom={14} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', backgroundColor: '#020617' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
        />

        {activeIncidents.map((incident: Incident) => {
          const units = [
            { id: `u1-${incident.id}`, name: 'Fire Engine Unit Alpha', type: 'fire' as const, startOffset: [0.01, 0.002] as [number, number] },
            { id: `u2-${incident.id}`, name: 'Hazmat Rescue Team', type: 'hazmat' as const, startOffset: [-0.009, 0.008] as [number, number] },
            { id: `u3-${incident.id}`, name: 'Emergency Ambulance Unit 1', type: 'ambulance' as const, startOffset: [-0.007, -0.009] as [number, number] },
            { id: `u4-${incident.id}`, name: 'Emergency Ambulance Unit 2', type: 'ambulance' as const, startOffset: [0.006, -0.010] as [number, number] },
            { id: `u5-${incident.id}`, name: 'Traffic Control Police', type: 'police' as const, startOffset: [-0.011, -0.002] as [number, number] },
          ];

          return (
            <React.Fragment key={`dijkstra-incident-${incident.id}`}>
              <Marker position={[incident.lat, incident.lng]} icon={incidentIcon} />

              {units.map((unit) => {
                const startPos: [number, number] = [
                  incident.lat + unit.startOffset[0],
                  incident.lng + unit.startOffset[1],
                ];
                const endPos: [number, number] = [incident.lat, incident.lng];

                const roadPath = findRoadPath(startPos, endPos);

                const totalSegments = roadPath.length - 1;
                const scaledProgress = progress * totalSegments;
                const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
                const segmentProgress = scaledProgress - segmentIndex;

                const currSegmentStart = roadPath[segmentIndex];
                const currSegmentEnd = roadPath[segmentIndex + 1] || currSegmentStart;

                const currentLat = currSegmentStart[0] + (currSegmentEnd[0] - currSegmentStart[0]) * segmentProgress;
                const currentLng = currSegmentStart[1] + (currSegmentEnd[1] - currSegmentStart[1]) * segmentProgress;

                return (
                  <React.Fragment key={unit.id}>
                    <Marker position={startPos} icon={createServiceIcon(unit.type)} />

                    <Polyline 
                      positions={roadPath} 
                      pathOptions={{ 
                        color: unit.type === 'fire' ? '#dc2626' : unit.type === 'hazmat' ? '#d97706' : unit.type === 'ambulance' ? '#059669' : '#2563eb', 
                        weight: 3, 
                        dashArray: '5, 5', 
                        opacity: 0.7 
                      }} 
                    />

                    <Marker position={[currentLat, currentLng]} icon={createServiceIcon(unit.type)} />
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/95 backdrop-blur border border-slate-800 p-2.5 rounded-lg text-xs flex items-center gap-3 text-slate-300 shadow-xl">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Police</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Ambulance</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Fire</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span> Hazmat</span>
      </div>
    </div>
  );
};