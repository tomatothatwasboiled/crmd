import React from 'react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

export const IncidentFeed: React.FC = () => {
  const incidents = [
    { id: 1, title: 'Flash Flood Warning', location: 'Central District', time: '10 mins ago', severity: 'High' },
    { id: 2, title: 'Power Substation Outage', location: 'North Sector', time: '25 mins ago', severity: 'Medium' },
    { id: 3, title: 'Traffic Gridlock & Rescue Operations', location: 'Highway 101', time: '1 hour ago', severity: 'High' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Active Incident Log</h2>
      {incidents.map((inc) => (
        <div key={inc.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-1" />
            <div>
              <h3 className="font-semibold text-slate-100">{inc.title}</h3>
              <div className="flex gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {inc.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {inc.time}</span>
              </div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            {inc.severity}
          </span>
        </div>
      ))}
    </div>
  );
};