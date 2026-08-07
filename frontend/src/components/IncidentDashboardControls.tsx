import React from 'react';
import { clearAllIncidents, exportIncidentsToExcel } from '../services/incidentService';

export function IncidentDashboardControls() {
  const handleClearClick = () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to clear all incident history? This action cannot be undone.'
    );
    if (confirmDelete) {
      clearAllIncidents();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border-b border-slate-800 text-white">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Crisis Management Dashboard</h1>
        <p className="text-sm text-slate-400">Manage, review, and export active emergency incidents.</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Export to Excel Button */}
        <button
          onClick={exportIncidentsToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <span>📥 Export Excel</span>
        </button>

        {/* Clear History Button */}
        <button
          onClick={handleClearClick}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <span>🗑️ Clear History</span>
        </button>
      </div>
    </div>
  );
}