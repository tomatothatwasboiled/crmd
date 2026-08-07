import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ShieldCheck, MapPin, Clock, Bot } from 'lucide-react';

// TypeScript type for your report
interface IncidentReport {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  summary: string;
  recommendedAction: string;
  aiConfidence: number;
}

export const IncidentDetail: React.FC = () => {
  // 1. Grab the report ID directly from the URL route parameter (/feed/:id)
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Simulate fetching or auto-generating report data based on the URL ID
    setLoading(true);
    
    // In production, this would be: fetch(`/api/incidents/${id}`)
    setTimeout(() => {
      setReport({
        id: id || 'UNKNOWN',
        title: `Auto-Generated Assessment #${id}`,
        location: 'Zone 4 - Central Grid, Sector B',
        timestamp: new Date().toLocaleTimeString(),
        severity: 'Critical',
        summary: `AI Agent Assessment for incident query ref ${id}. Emergency dispatch systems indicate elevated structural risk and localized flooding.`,
        recommendedAction: 'Deploy 2 Rescue Squads and issue automated localized alert notifications via SMS.',
        aiConfidence: 96.8,
      });
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Auto-generating report template for ID #{id}...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Back Navigation */}
      <Link 
        to="/feed" 
        className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Incident Feed
      </Link>

      {/* Main Report Card Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>REPORT_ID: {report?.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {report?.timestamp}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">{report?.title}</h1>
            <p className="flex items-center gap-1 text-sm text-slate-400 mt-1">
              <MapPin className="w-4 h-4 text-rose-400" /> {report?.location}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            {report?.severity} Severity
          </span>
        </div>

        {/* AI Confidence & Agent Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="text-xs text-slate-400">Agent Assessment Engine</p>
              <p className="text-sm font-semibold text-slate-200">CrisisMind Autonomous Agent v2.4</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-400">AI Confidence Score</p>
              <p className="text-sm font-semibold text-emerald-400">{report?.aiConfidence}% Match Score</p>
            </div>
          </div>
        </div>

        {/* Dynamic Report Content Body */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Incident Summary & Context
            </h3>
            <p className="text-sm text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800/50 leading-relaxed">
              {report?.summary}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> AI Actionable Directive
            </h3>
            <p className="text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg leading-relaxed font-mono">
              {report?.recommendedAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};