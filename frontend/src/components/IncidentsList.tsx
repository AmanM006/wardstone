'use client';

import React from 'react';
import { ForensicIncidentReport } from '@/types';
import { ShieldAlert, Eye, Volume2 } from 'lucide-react';

interface IncidentsListProps {
  incidents: ForensicIncidentReport[];
  onSelectIncident: (inc: ForensicIncidentReport) => void;
}

export const IncidentsList: React.FC<IncidentsListProps> = ({
  incidents,
  onSelectIncident
}) => {
  const handlePlayAudio = (inc: ForensicIncidentReport, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Alert: Wardstone Circuit Breaker quarantined mandate from ${inc.agent_name}. Attempted spend: ${inc.attempted_amount_usdc} USDC. Risk score: ${inc.risk_score} out of 100.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-bold text-white">Active Incident Postmortems (Gemini 3.5)</h2>
        </div>
        <span className="px-2 py-0.5 text-xs font-mono bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
          {incidents.length} Quarantined
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 max-h-[360px] overflow-y-auto divide-y divide-slate-800">
        {incidents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No active incidents. Fleet is operating within normal baseline bounds.
          </div>
        ) : (
          incidents.map((inc) => (
            <div
              key={inc.incident_id}
              onClick={() => onSelectIncident(inc)}
              className="pt-3 first:pt-0 flex flex-col gap-2 cursor-pointer group hover:bg-slate-800/30 p-2 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>{inc.agent_name}</span>
                  <span className="px-1.5 py-0.2 text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800/60 rounded">
                    Risk: {inc.risk_score}/100
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handlePlayAudio(inc, e)}
                    title="Play Cloud TTS Audio Alarm"
                    className="p-1 text-slate-400 hover:text-sky-400 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="View Blast-Radius Topology Map"
                    className="p-1 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-white">
                    ${Number(inc.attempted_amount_usdc).toFixed(2)} USDC
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[11px] font-semibold text-sky-400 mb-1">Executive Summary</div>
                <p className="leading-relaxed">{inc.anomaly_summary}</p>
                
                {inc.root_cause_explanation && (
                  <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-800/60 pt-1.5">
                    <span className="font-semibold text-slate-300">Root Cause Breakdown: </span>
                    {inc.root_cause_explanation}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-900/40 px-2.5 py-1.5 rounded flex items-start gap-1.5">
                <span className="font-bold">Remediation:</span>
                <span>{inc.recommended_remediation}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
