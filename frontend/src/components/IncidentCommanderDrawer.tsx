'use client';

import React, { useState } from 'react';
import { ForensicIncidentReport } from '@/types';
import { ShieldAlert, Volume2, CheckCircle2, MessageSquare, Send, X, Network, Flame, Lock } from 'lucide-react';

interface IncidentCommanderDrawerProps {
  incident: ForensicIncidentReport | null;
  onClose: () => void;
  onOpenTopology: (inc: ForensicIncidentReport) => void;
}

export const IncidentCommanderDrawer: React.FC<IncidentCommanderDrawerProps> = ({
  incident,
  onClose,
  onOpenTopology
}) => {
  const [comments, setComments] = useState<string[]>([
    'Automated Circuit Breaker intervened in 3.8ms. Zero funds were transferred on Base Sepolia.',
    'Gemini 3.5 Flash completed root-cause analysis and flagged runaway recursive loop.'
  ]);
  const [newComment, setNewComment] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  if (!incident) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, newComment.trim()]);
    setNewComment('');
  };

  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Alert: Wardstone Circuit Breaker has quarantined an anomalous payment mandate from agent ${incident.agent_name}. Attempted spend: ${incident.attempted_amount_usdc} USDC. Risk score: ${incident.risk_score} out of 100. On-chain settlement halted.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-700 shadow-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header (Datadog style) */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-bold">#{incident.incident_id}</span>
              <span>&bull;</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans font-semibold">
                Fleet: {incident.agent_name}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-white leading-snug">
            {incident.anomaly_summary}
          </h2>

          {/* Status Metas */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 uppercase text-[10px] block font-semibold">Status</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40 inline-flex items-center gap-1">
                <Flame className="w-3 h-3" />
                TRIGGERED
              </span>
            </div>

            <div>
              <span className="text-slate-500 uppercase text-[10px] block font-semibold">Urgency</span>
              <span className="text-rose-400 font-mono font-bold">HIGH ({incident.risk_score}/100)</span>
            </div>

            <div>
              <span className="text-slate-500 uppercase text-[10px] block font-semibold">Attempted Spend</span>
              <span className="text-white font-mono font-bold">${incident.attempted_amount_usdc} USDC</span>
            </div>

            <div>
              <span className="text-slate-500 uppercase text-[10px] block font-semibold">Settlement Rail</span>
              <span className="text-slate-300 font-mono">Base Sepolia (Blocked)</span>
            </div>
          </div>
        </div>

        {/* Action Bar (Datadog style Next Steps) */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAcknowledged(!acknowledged)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                acknowledged
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {acknowledged ? 'Acknowledged' : 'Acknowledge Incident'}
            </button>

            <button
              onClick={() => onOpenTopology(incident)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-lg transition flex items-center gap-1.5"
            >
              <Network className="w-3.5 h-3.5" />
              View Blast-Radius Map
            </button>
          </div>

          <button
            onClick={handlePlayAudio}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg transition flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Play Cloud TTS Dispatch
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
          {/* Causal Postmortem Description */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Gemini 3.5 Causal Root-Cause Postmortem
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 space-y-3 leading-relaxed">
              <p>{incident.root_cause_explanation}</p>
              
              <div className="border-t border-slate-800 pt-3">
                <div className="font-semibold text-white mb-1">Affected Agent Components:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(incident.affected_components || []).map((comp, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-700 rounded font-mono text-[11px]">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Remediation */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
            <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
              <Lock className="w-4 h-4" />
              <span>Recommended Fleet Controller Action:</span>
            </div>
            <p className="text-xs leading-relaxed">{incident.recommended_remediation}</p>
          </div>

          {/* Interactive Incident Timeline (Datadog style) */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Incident Response Timeline & Notes</span>
            </div>

            {/* Comments Stream */}
            <div className="space-y-2.5">
              {comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    FC
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-white">AI Agent Fleet Controller</span>
                      <span>Just now</span>
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5">{c}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add mitigation note or action comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                Comment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
