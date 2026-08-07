import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, MapPin } from 'lucide-react';
import { Incident } from '../services/incidentService';

interface DispatchedUnitsViewProps {
  incidents: Incident[];
}

export const DispatchedUnitsView: React.FC<DispatchedUnitsViewProps> = ({ incidents }) => {
  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');
  
  // Flatten all assigned units across active incidents with their context
  const dispatchedUnitsList = activeIncidents.flatMap((inc) => 
    (Array.isArray(inc.assignedUnits) ? inc.assignedUnits : []).map((unit) => ({
      unitName: unit,
      incidentTitle: inc.title,
      incidentId: inc.id,
      location: inc.location,
      severity: inc.severity,
      timestamp: inc.timestamp,
    }))
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
          {dispatchedUnitsList.length} Units Deployed On Ground
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Truck className="w-6 h-6 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold text-slate-100">Active Ground Units Registry</h1>
            <p className="text-xs text-slate-400">Real-time listing of all emergency services deployed to active incidents</p>
          </div>
        </div>

        {dispatchedUnitsList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-mono bg-slate-950 border border-slate-800 rounded-lg">
            No active units currently deployed on the ground.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {dispatchedUnitsList.map((item, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <Truck className="w-4 h-4" /> {item.unitName}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      item.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      item.severity === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {item.severity} Incident
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dispatched to: <Link to={`/feed/${item.incidentId}`} className="text-indigo-400 hover:underline">{item.incidentTitle}</Link>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" /> {item.location}
                  </p>
                </div>

                <Link
                  to={`/feed/${item.incidentId}`}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition self-start sm:self-center"
                >
                  View Incident
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};