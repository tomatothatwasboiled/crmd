import React from 'react';
import { exportIncidentsToExcel, exportIncidentsToCSV } from '../services/incidentService';

export function IncidentDashboardControls() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border-b border-slate-800 text-white">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Crisis Management Dashboard</h1>
        <p className="text-sm text-slate-400">Manage, review, and export active emergency incidents.</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Export to CSV Button */}
        <button
          onClick={exportIncidentsToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <span>📄 Export CSV</span>
        </button>

        {/* Export to Excel Button */}
        <button
          onClick={exportIncidentsToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <span>📥 Export Excel</span>
        </button>
      </div>
    </div>
  );
}