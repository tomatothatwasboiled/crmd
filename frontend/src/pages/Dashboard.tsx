import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Truck, Activity, Navigation, Radio } from 'lucide-react';
import { IncidentFeed } from './IncidentFeed';
import { AgentMonitor } from './AgentMonitor';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feed' | 'monitor'>('dashboard');
  const [inputMessage, setInputMessage] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7 text-red-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
            CrisisMind AI
          </h1>
        </div>

        <nav className="flex gap-2 bg-slate-800/60 p-1 rounded-lg border border-slate-700/50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'feed' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Incident Feed
          </button>
          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'monitor' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agent Monitor
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* TAB 1: MAIN DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Active Incidents</p>
                  <h3 className="text-2xl font-bold mt-1">3 Active</h3>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg"><ShieldCheck className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">AI Confidence Avg.</p>
                  <h3 className="text-2xl font-bold mt-1">94.2%</h3>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Truck className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Available Units</p>
                  <h3 className="text-2xl font-bold mt-1">12 Dispatched</h3>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold">Emergency Intake Feed</h2>
                </div>
                <p className="text-sm text-slate-400 mb-4">Paste raw emergency dispatches or citizen reporting messages below.</p>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Flash flood reported near Central Avenue. Multiple vehicles stranded..."
                  className="w-full h-36 p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <button className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition shadow-lg shadow-indigo-600/20">
                Run Agent Assessment Workflows
              </button>
            </div>

            <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold">Live Incident Map</h2>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                  Live Stream Active
                </span>
              </div>
              <div className="flex-1 min-h-[300px] bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <p className="text-slate-500 text-sm z-10 font-mono">Interactive Tactical Map Grid</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INCIDENT FEED PAGE */}
        {activeTab === 'feed' && <IncidentFeed />}

        {/* TAB 3: AGENT MONITOR PAGE */}
        {activeTab === 'monitor' && <AgentMonitor />}
      </main>
    </div>
  );
};