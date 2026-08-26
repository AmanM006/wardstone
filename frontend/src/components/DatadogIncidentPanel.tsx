'use client';

import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { AP2PaymentMandate, ForensicIncidentReport } from '@/types';
import { overrideIncident } from '@/lib/api';
import { playCloudTTS } from '../lib/tts';
import { CheckCircle2, Volume2, Network, Flame, Send, MessageSquare, ExternalLink, ShieldCheck, ShieldAlert, ChevronRight, Download, Play, X } from 'lucide-react';

interface DatadogIncidentPanelProps {
  mandates: AP2PaymentMandate[];
  incidents: ForensicIncidentReport[];
  selectedMandate: AP2PaymentMandate | null;
  onSelectMandate: (m: AP2PaymentMandate) => void;
  onOpenTopology: (inc: ForensicIncidentReport) => void;
}

// Format a relative timestamp
function formatRelative(isoString?: string): string {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Just now';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Simulate Policy Modal
const SimulatePolicyModal: React.FC<{ onClose: () => void; mandates: AP2PaymentMandate[] }> = ({ onClose, mandates }) => {
  const [threshold, setThreshold] = useState('50');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const run = async () => {
    const val = parseFloat(threshold);
    if (isNaN(val) || val < 0 || val > 100) { setError('Enter a valid threshold between 0 and 100'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/v1/simulate-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_threshold: val })
      });
      if (!res.ok) throw new Error('Request failed');
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message || 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0e0e0e] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-sm">Simulate Policy Threshold</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-zinc-400 mb-4">Run a what-if simulation against all historical mandates with a new risk threshold. See how many mandates would flip status.</p>
        <div className="flex gap-2 mb-4">
          <input
            type="number" min="0" max="100" step="1"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            placeholder="Threshold (e.g. 50)"
            className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white text-xs focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={run} disabled={loading}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-40 flex items-center gap-2"
          >
            <Play className="w-3 h-3" />
            {loading ? 'Simulating...' : 'Run'}
          </button>
        </div>
        {error && <p className="text-rose-400 text-xs mb-3">{error}</p>}
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-white">{result.total_historical_mandates}</div>
                <div className="text-[10px] text-zinc-500 mt-1">Total Mandates</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-amber-400">{result.flipped_mandates_count}</div>
                <div className="text-[10px] text-zinc-500 mt-1">Would Flip</div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-sky-400">{result.proposed_threshold}</div>
                <div className="text-[10px] text-zinc-500 mt-1">New Threshold</div>
              </div>
            </div>
            {result.flips && result.flips.length > 0 ? (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {result.flips.map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-[#111] rounded-lg px-3 py-2 text-xs font-mono">
                    <span className="text-zinc-400 truncate">{f.mandate_id}</span>
                    <span className="text-zinc-500">{f.old_status} → <span className={f.new_status === 'HELD' ? 'text-rose-400' : 'text-emerald-400'}>{f.new_status}</span></span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-zinc-500 text-xs py-4 bg-[#111] rounded-lg">
                No mandates would change status at threshold {result.proposed_threshold}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const DatadogIncidentPanel: React.FC<DatadogIncidentPanelProps> = ({
  mandates,
  incidents,
  selectedMandate,
  onSelectMandate,
  onOpenTopology
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userComments, setUserComments] = useState<string[]>([]);

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
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    const rafId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, [selectedMandate]);

  // Reset ack when switching mandates
  useEffect(() => { setAcknowledged(false); }, [selectedMandate?.mandate_id]);

  // Find matching incident by mandate ID
  const matchingIncident = selectedMandate
    ? incidents.find(inc => inc.mandate_id === (selectedMandate.mandate_id || (selectedMandate as any).raw_payload?.mandate_id)) || null
    : null;

  const raw: any = selectedMandate?.raw_payload || selectedMandate;
  const dec: any = selectedMandate?.governance_decision || {};
  const risk: any = selectedMandate?.risk_analysis || {};
  const isHeld = selectedMandate?.status === 'HELD' || dec.status === 'HELD' || (risk.risk_score || 0) >= 60 || !!matchingIncident;
  const amount = Number(selectedMandate?.total_amount_usdc || raw?.total_amount_usdc || 0);

  const handlePlayAudio = () => {
    const agentName = selectedMandate?.buyer_agent?.agent_name || raw?.buyer_agent?.agent_name || 'Unknown Agent';
    const text = matchingIncident
      ? `Alert: Wardstone Circuit Breaker has quarantined mandate from agent ${agentName}. Attempted spend: ${matchingIncident.attempted_amount_usdc} USDC. Risk score: ${matchingIncident.risk_score} out of 100. Base Sepolia settlement halted.`
      : `Wardstone confirmed mandate from agent ${agentName} for ${amount.toFixed(2)} USDC. Transaction settled on Base Sepolia.`;
    playCloudTTS(text);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setUserComments(prev => [...prev, newComment.trim()]);
    setNewComment('');
  };

  // Generate unique hash per mandate
  const mandateId = selectedMandate?.mandate_id || raw?.mandate_id;
  const proofHash = mandateId
    ? Array.from(mandateId + (dec.tx_hash || '')).reduce(
        (hash, ch) => ((hash << 5) - hash + ch.charCodeAt(0)) | 0, 0
      ).toString(16).padStart(64, '0')
    : '0'.repeat(64);

  const mandateCreatedAt = selectedMandate?.created_at as string | undefined;
  const incidentTimestamp = (matchingIncident as any)?.created_at || (matchingIncident as any)?.timestamp || mandateCreatedAt;

  return (
    <>
      {showSimModal && <SimulatePolicyModal onClose={() => setShowSimModal(false)} mandates={mandates} />}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 h-full overflow-hidden border-t border-[#1a1a1a]">
        {/* Central Stream Table (5 cols on lg) */}
        <div className="lg:col-span-5 border-r border-[#1a1a1a] bg-[#050505] flex flex-col h-full overflow-hidden">
          {/* Table Subheader */}
          <div className="p-3 border-b border-[#1a1a1a] bg-[#080808] flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">Active ({mandates.length})</span>
                <span className="text-zinc-500">Triggered ({incidents.length})</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-500">Base Sepolia x402</span>
            </div>
            {/* Simulate Policy + Export on full-width row below */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="simThreshold"
                placeholder="Threshold (e.g. 50)"
                className="flex-1 min-w-0 px-2 py-1 bg-[#111] text-white text-xs border border-zinc-700 rounded"
              />
              <button
                onClick={() => setShowSimModal(true)}
                className="px-2 py-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-zinc-300 rounded border border-zinc-700 transition flex items-center gap-1 text-xs whitespace-nowrap"
              >
                <Play className="w-3 h-3" />
                Simulate Policy
              </button>
              <a
                href="/api/v1/export-compliance"
                download="wardstone-compliance.csv"
                className="px-2 py-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-zinc-300 rounded border border-zinc-700 transition flex items-center gap-1 text-xs whitespace-nowrap"
              >
                <Download className="w-3 h-3" />
                Export CSV
              </a>
            </div>
          </div>

          {/* Mandate Rows */}
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
                const hasIncident = incidents.some(inc => inc.mandate_id === (m.mandate_id || r.mandate_id));
                const held = m.status === 'HELD' || d.status === 'HELD' || score >= 60 || hasIncident;
                const isSelected = (m.mandate_id || r.mandate_id) === (selectedMandate?.mandate_id || raw?.mandate_id);

                return (
                  <div
                    key={m.mandate_id || r.mandate_id || `mandate-${idx}`}
                    onClick={() => onSelectMandate(m)}
                    className={`p-3 cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected ? 'bg-[#111111] border-l-2 border-sky-500' : 'hover:bg-[#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white truncate max-w-[180px]">
                        {m.buyer_agent?.agent_name || r.buyer_agent?.agent_name || 'Autonomous Agent'}
                      </span>
                      <span className="font-mono font-bold text-white">${amt.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${held ? 'bg-[#330808] text-rose-400 border border-rose-900/60' : 'bg-[#082818] text-emerald-400 border border-emerald-900/60'}`}>
                        {held ? 'HIGH' : 'LOW'}
                      </span>
                      <span className="text-zinc-500 font-mono">Service: <span className="text-zinc-300">ap2-x402-rail</span></span>
                      <span className="text-zinc-600">&bull;</span>
                      <span className="text-zinc-500 font-mono">{score > 0 ? `Risk: ${score.toFixed(1)}/100` : 'Pending'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div ref={scrollContainerRef} className="lg:col-span-7 bg-[#080808] h-full overflow-y-auto flex flex-col">
          <div className="p-6 space-y-6">
            {/* Header Metadata */}
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
                <a
                  href={`https://github.com/AmanM006/wardstone/blob/main/src/agents/gatekeeper.py`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  View Policy Rulebook <ExternalLink className="w-3 h-3" />
                </a>
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
                  <span className={`mt-1 px-2 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1 border ${isHeld ? 'bg-[#330808] text-rose-400 border-rose-900/60' : 'bg-[#082818] text-emerald-400 border-emerald-900/60'}`}>
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
                  <span className="mt-1 text-zinc-300 block font-mono">{formatRelative(incidentTimestamp)}</span>
                </div>

                <div>
                  <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Responder</span>
                  <span className="mt-1 text-sky-400 block font-medium">Circuit Breaker</span>
                </div>

                <div>
                  <span className="text-zinc-500 uppercase text-[10px] block font-semibold">Settlement Rail</span>
                  <span className="mt-1 text-zinc-300 block font-mono">
                    {dec.tx_hash ? 'Base Sepolia' : isHeld ? 'Blocked (0 USDC)' : 'Settled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-3.5 bg-[#0c0c0c] border border-[#1a1a1a] rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAcknowledged(!acknowledged)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition shadow ${acknowledged ? 'bg-emerald-600 text-white' : 'bg-[#0066cc] hover:bg-[#0052a3] text-white'}`}
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

              {/* TTS always shown for any selected mandate */}
              {selectedMandate && (
                <button
                  onClick={handlePlayAudio}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#161616] hover:bg-[#202020] text-amber-300 border border-amber-900/40 rounded-lg transition flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Play TTS Voice Alert</span>
                </button>
              )}
            </div>

            {/* Description Section */}
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
                  <div><strong>Destination Wallet:</strong> <span className="font-mono text-zinc-300">{selectedMandate?.destination_wallet || raw?.destination_wallet || '—'}</span></div>
                  {dec.tx_hash && (
                    <div>
                      <strong>Base Sepolia Tx Hash: </strong>
                      <a href={`https://sepolia.basescan.org/tx/${dec.tx_hash}`} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-mono inline-flex items-center gap-1">
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

                {proofHash && (
                  <div className="p-3 bg-[#0a101a] border border-[#1a2b4c] rounded-lg text-sky-300 text-xs font-mono break-all">
                    <strong>[Proof of Governance]: </strong>
                    {matchingIncident?.governance_hash || proofHash}
                  </div>
                )}

                {matchingIncident && isHeld && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => overrideIncident(matchingIncident.incident_id, matchingIncident.mandate_id, 'FORCE_APPROVE', 'fleet-controller-1')
                        .then(() => alert('Mandate forcefully approved.'))
                        .catch(e => alert('Error: ' + e.message))}
                      className="px-3 py-1.5 text-[11px] font-bold bg-[#082818] hover:bg-[#0a3822] text-emerald-400 border border-emerald-900/60 rounded-md transition"
                    >
                      Force Approve
                    </button>
                    <button
                      onClick={() => overrideIncident(matchingIncident.incident_id, matchingIncident.mandate_id, 'CONFIRM_BAN', 'fleet-controller-1')
                        .then(() => alert('Agent permanently banned.'))
                        .catch(e => alert('Error: ' + e.message))}
                      className="px-3 py-1.5 text-[11px] font-bold bg-[#330808] hover:bg-[#4a0a0a] text-rose-400 border border-rose-900/60 rounded-md transition"
                    >
                      Confirm Ban
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Timeline */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Timeline & Fleet Controller Mitigation Notes</span>
              </div>

              <div className="space-y-2.5">
                {/* System-generated timeline entries from the incident */}
                {matchingIncident ? (
                  <>
                    <div className="flex items-start gap-2.5 bg-[#0c0c0c] border border-[#1a1a1a] p-3 rounded-xl text-xs">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-orange-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">CB</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="font-semibold text-white">Wardstone Circuit Breaker</span>
                          <span>{formatRelative(incidentTimestamp)}</span>
                        </div>
                        <p className="text-zinc-300 text-xs mt-0.5">Automated Circuit Breaker intervened pre-settlement. Zero tokens transferred on Base Sepolia.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-[#0c0c0c] border border-[#1a1a1a] p-3 rounded-xl text-xs">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">AI</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="font-semibold text-white">Gemini 3.5 Flash Forensics</span>
                          <span>{formatRelative(incidentTimestamp)}</span>
                        </div>
                        <p className="text-zinc-300 text-xs mt-0.5">Causal postmortem generated: {matchingIncident.anomaly_summary?.slice(0, 120) || 'Anomalous spend pattern detected.'}...</p>
                      </div>
                    </div>
                  </>
                ) : selectedMandate ? (
                  <div className="flex items-start gap-2.5 bg-[#0c0c0c] border border-[#1a1a1a] p-3 rounded-xl text-xs">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">✓</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span className="font-semibold text-white">Base Sepolia Settlement</span>
                        <span>{formatRelative(mandateCreatedAt)}</span>
                      </div>
                      <p className="text-zinc-300 text-xs mt-0.5">Mandate cleared all checks. ${amount.toFixed(2)} USDC settled on Base Sepolia testnet.</p>
                    </div>
                  </div>
                ) : null}

                {/* User comments */}
                {userComments.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-[#0c0c0c] border border-[#1a1a1a] p-3 rounded-xl text-xs">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">FC</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span className="font-semibold text-white">Fleet Controller</span>
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
                <button type="submit" className="px-4 py-2 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
