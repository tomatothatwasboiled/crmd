import React from 'react';
import { Bot, CheckCircle2, Cpu } from 'lucide-react';

export const AgentMonitor: React.FC = () => {
  const agents = [
    { name: 'Triage Agent #1', status: 'Active Analysis', load: '42%' },
    { name: 'Dispatch Coordinator AI', status: 'Standby', load: '12%' },
    { name: 'Geospatial Intelligence Agent', status: 'Processing Mapping Data', load: '78%' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Autonomous AI Agents Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <Bot className="w-6 h-6 text-indigo-400" />
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-100">{agent.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{agent.status}</p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> Workload</span>
              <span className="font-mono text-slate-300">{agent.load}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};