'use client';

import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { AP2PaymentMandate, ForensicIncidentReport } from '@/types';
import { overrideIncident } from '@/lib/api';
import { playCloudTTS } from '../lib/tts';
import { CheckCircle2, Volume2, Network, Flame, Send, MessageSquare, ExternalLink, ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react';

interface DatadogIncidentPanelProps {
  mandates: AP2PaymentMandate[];
  incidents: ForensicIncidentReport[];
  selectedMandate: AP2PaymentMandate | null;
  onSelectMandate: (m: AP2PaymentMandate) => void;
  onOpenTopology: (inc: ForensicIncidentReport) => void;
}

export const DatadogIncidentPanel: React.FC<DatadogIncidentPanelProps> = ({
  mandates,
  incidents,
  selectedMandate,
  onSelectMandate,
  onOpenTopology
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [comments, setComments] = useState<string[]>([
    'Automated Circuit Breaker intervened pre-settlement in 3.8ms. Zero tokens were transferred on Base Sepolia.',
    'Gemini 3.5 Flash generated causal postmortem: runaway recursive scraping loop detected.'
  ]);
  const [newComment, setNewComment] = useState('');

  // Initialize Lenis smooth scroll on the right detail panel
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollContainerRef.current,
      content: scrollContainerRef.current.firstElementChild as HTMLElement,
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [selectedMandate]);

  // Find matching incident if held
  const matchingIncident = incidents.find(
    (inc) => inc.mandate_id === selectedMandate?.mandate_id
  ) || incidents[0] || null;

  const raw: any = selectedMandate?.raw_payload || selectedMandate;
  const dec: any = selectedMandate?.governance_decision || {};
  const risk: any = selectedMandate?.risk_analysis || {};
  const isHeld = selectedMandate?.status === 'HELD' || dec.status === 'HELD' || (risk.risk_score || 0) >= 60;
  const amount = Number(selectedMandate?.total_amount_usdc || raw?.total_amount_usdc || 0);

  const handlePlayAudio = () => {
    if (matchingIncident) {
      const text = `Alert: Wardstone Circuit Breaker has quarantined an anomalous payment mandate from agent ${matchingIncident.agent_name}. Attempted spend: ${matchingIncident.attempted_amount_usdc} USDC. Risk score: ${matchingIncident.risk_score} out of 100. Base Sepolia settlement halted.`;
      playCloudTTS(text);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, newComment.trim()]);
    setNewComment('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 h-full overflow-hidden border-t border-[#1a1a1a]">
      {/* Central Stream Table (5 cols on lg) */}
      <div className="lg:col-span-5 border-r border-[#1a1a1a] bg-[#050505] flex flex-col h-full overflow-hidden">
        {/* Table Subheader */}
        <div className="p-3 border-b border-[#1a1a1a] bg-[#080808] flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">Active ({mandates.length})</span>
            <span className="text-zinc-500">Triggered ({incidents.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              id="simThreshold" 
              placeholder="Threshold (e.g. 50)" 
              className="px-2 py-1 bg-[#111] text-white text-xs border border-zinc-700 rounded w-32"
            />
            <button onClick={async () => {
              const val = (document.getElementById('simThreshold') as HTMLInputElement).value;
              if(!val) return;
              const res = await fetch('/api/v1/simulate-policy', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({new_threshold: parseFloat(val)})
              });
              const data = await res.json();
              alert(`Simulation against historical mandates:\n${data.flipped_mandates_count} mandates would flip status.\n${data.flips.map((f: any) => `Mandate ${f.mandate_id}: ${f.old_status} -> ${f.new_status}`).join('\n')}`);
            }} className="px-2 py-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-zinc-300 rounded border border-zinc-700 transition flex items-center gap-1">
              Simulate Policy
            </button>
            <a href="/api/v1/export-compliance" download className="px-2 py-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-zinc-300 rounded border border-zinc-700 transition flex items-center gap-1">
              <span>Export CSV</span>
            </a>
            <span className="font-mono text-[11px]">Base Sepolia x402</span>
          </div>
        </div>

        {/* Mandate Rows (Scrollable within column) */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#151515]">
          {mandates.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No mandates ingested yet. Use the simulation triggers above.
            </div>
          ) : (
            mandates.map((m, idx) => {
              const r: any = m.raw_payload || m;
              const d: any = m.governance_decision || {};
              const rk: any = m.risk_analysis || {};
              const amt = Number(m.total_amount_usdc || r.total_amount_usdc || 0);
              const score = Number(rk.risk_score || 0);
              const held = m.status === 'HELD' || d.status === 'HELD' || score >= 60;
              const isSelected = (m.mandate_id || r.mandate_id) === (selectedMandate?.mandate_id || raw?.mandate_id);

              return (
                <div
                  key={m.mandate_id || r.mandate_id || `mandate-${idx}`}
                  onClick={() => onSelectMandate(m)}
                  className={`p-3 cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[#111111] border-l-2 border-sky-500'
                      : 'hover:bg-[#0a0a0a]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white truncate max-w-[240px]">
                      {m.buyer_agent?.agent_name || r.buyer_agent?.agent_name || 'Autonomous Agent'}
                    </span>
                    <span className="font-mono font-bold text-white">${amt.toFixed(2)} USDC</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        held
                          ? 'bg-[#330808] text-rose-400 border border-rose-900/60'
                          : 'bg-[#082818] text-emerald-400 border border-emerald-900/60'
                      }`}
                    >
                      {held ? 'HIGH' : 'LOW'}
                    </span>
                    <span className="text-zinc-500 font-mono">
                      Service: <span className="text-zinc-300">ap2-x402-rail</span>
                    </span>
                    <span className="text-zinc-600">&bull;</span>
                    <span className="text-zinc-500 font-mono">
                      {score > 0 ? `Risk: ${score.toFixed(1)}/100` : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Detail Panel: Datadog Incident Commander with Lenis Smooth Scroll (7 cols) */}
      <div
        ref={scrollContainerRef}
        className="lg:col-span-7 bg-[#080808] h-full overflow-y-auto flex flex-col"
      >
        <div className="p-6 space-y-6">
          {/* Header Metadata (Datadog style) */}
          <div className="space-y-3 pb-4 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-sky-400 font-bold">
                  #{selectedMandate?.mandate_id || raw?.mandate_id || 'MANDATE-001'}
                </span>
                <span>&bull;</span>
                <span className="text-zinc-300">
                  Fleet: <span className="text-white font-sans font-semibold">{selectedMandate?.buyer_agent?.agent_name || raw?.buyer_agent?.agent_name || 'Fleet Operator'}</span>
                </span>
              </div>
              <span className="text-sky-400 hover:underline cursor-pointer">
                View Policy Rulebook &rarr;
              </span>
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
              {isHeld
                ? `Anomalous spend mandate quarantined: attempted ${amount.toFixed(2)} USDC from ${selectedMandate?.buyer_agent?.agent_name || 'Agent'}`
                : `Payment mandate approved & settled on Base Sepolia: ${amount.toFixed(2)} USDC`}
            </h2>

            {/* Metas Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Status</span>
                <span
                  className={`mt-1 px-2 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1 border ${
                    isHeld
                      ? 'bg-[#330808] text-rose-400 border-rose-900/60'
                      : 'bg-[#082818] text-emerald-400 border-emerald-900/60'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  {isHeld ? 'TRIGGERED' : 'SETTLED'}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Urgency</span>
                <span className={`mt-1 font-mono font-bold block ${isHeld ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isHeld ? 'HIGH' : 'LOW'} ({(risk.risk_score || 0).toFixed(1)}/100)
                </span>
              </div>

              <div>
                <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Triggered</span>
                <span className="mt-1 text-zinc-300 block font-mono">Just now</span>
              </div>

              <div>
                <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Responder</span>
                <span className="mt-1 text-sky-400 block font-medium">Circuit Breaker</span>
              </div>

              <div>
                <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Settlement Rail</span>
                <span className="mt-1 text-zinc-300 block font-mono">
                  {dec.tx_hash ? 'Base Sepolia' : 'Blocked (0 USDC)'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar (Datadog style Next Steps) */}
          <div className="p-3.5 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAcknowledged(!acknowledged)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition shadow ${
                  acknowledged
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0066cc] hover:bg-[#0052a3] text-white'
                }`}
              >
                {acknowledged ? '✓ Acknowledged' : 'Acknowledge'}
              </button>

              {matchingIncident && (
                <button
                  onClick={() => onOpenTopology(matchingIncident)}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#161616] hover:bg-[#202020] text-zinc-300 border border-[#2a2a2a] rounded-lg transition flex items-center gap-1.5"
                >
                  <Network className="w-3.5 h-3.5 text-sky-400" />
                  <span>Blast Map</span>
                </button>
              )}
            </div>

            {matchingIncident && (
              <button
                onClick={handlePlayAudio}
                className="px-3 py-1.5 text-xs font-semibold bg-[#161616] hover:bg-[#202020] text-amber-300 border border-amber-900/40 rounded-lg transition flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Play TTS Voice Alert</span>
              </button>
            )}
          </div>

          {/* Description Section (Gemini 3.5 Postmortem) */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Description & Causal Root Cause
            </div>
            <div className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl p-4 text-xs text-zinc-300 space-y-3 leading-relaxed">
              <p className="text-white font-medium">
                {matchingIncident?.root_cause_explanation ||
                  `Mandate verified within normal parameters. Agent baseline hourly velocity is $${risk.baseline_hourly_velocity || 15}/hr. No anomaly detected.`}
              </p>

              <div className="border-t border-[#1a1a1a] pt-3 text-[11px] space-y-1 text-zinc-400">
                <div><strong>Mandate ID:</strong> <span className="font-mono text-zinc-300">{selectedMandate?.mandate_id || raw?.mandate_id}</span></div>
                <div><strong>Destination Wallet:</strong> <span className="font-mono text-zinc-300">{selectedMandate?.destination_wallet || raw?.destination_wallet || '0x28054904C99b7FE4c000F9F570b7f83C76f1F43E'}</span></div>
                {dec.tx_hash && (
                  <div>
                    <strong>Base Sepolia Tx Hash: </strong>
                    <a
                      href={`https://sepolia.basescan.org/tx/${dec.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline font-mono inline-flex items-center gap-1"
                    >
                      <span>{dec.tx_hash}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {matchingIncident?.recommended_remediation && (
                <div className="p-3 bg-[#1e1505] border border-[#3d2c0b] rounded-lg text-amber-200 text-xs">
                  <strong>Investigative Remediation: </strong>
                  {matchingIncident.recommended_remediation}
                </div>
              )}

              {matchingIncident?.governance_hash && (
                <div className="p-3 bg-[#0a101a] border border-[#1a2b4c] rounded-lg text-sky-300 text-xs font-mono break-all">
                  <strong>[Proof of Governance]: </strong>
                  {matchingIncident.governance_hash}
                </div>
              )}

              {matchingIncident && isHeld && (
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => {
                      overrideIncident(matchingIncident.incident_id, matchingIncident.mandate_id, 'FORCE_APPROVE', 'fleet-controller-1')
                        .then(() => alert('Mandate forcefully approved.'))
                        .catch(e => alert('Error: ' + e.message));
                    }}
                    className="px-3 py-1.5 text-[11px] font-bold bg-[#082818] hover:bg-[#0a3822] text-emerald-400 border border-emerald-900/60 rounded-md transition"
                  >
                    Force Approve
                  </button>
                  <button 
                    onClick={() => {
                      overrideIncident(matchingIncident.incident_id, matchingIncident.mandate_id, 'CONFIRM_BAN', 'fleet-controller-1')
                        .then(() => alert('Agent permanently banned.'))
                        .catch(e => alert('Error: ' + e.message));
                    }}
                    className="px-3 py-1.5 text-[11px] font-bold bg-[#330808] hover:bg-[#4a0a0a] text-rose-400 border border-rose-900/60 rounded-md transition"
                  >
                    Confirm Ban
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Timeline & Notes (Datadog style) */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Timeline & Fleet Controller Mitigation Notes</span>
            </div>

            <div className="space-y-2.5">
              {comments.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-[#0c0c0c] border border-[#1a1a1a] p-3 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    FC
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="font-semibold text-white">AI Agent Fleet Controller</span>
                      <span>Just now</span>
                    </div>
                    <p className="text-zinc-300 text-xs mt-0.5">{c}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a mitigation comment or status update..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0e0e0e] border border-[#222222] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Comment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
