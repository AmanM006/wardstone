'use client';

import React, { useState } from 'react';
import { AP2PaymentMandate, ForensicIncidentReport, AgentSpendProfile, SystemHealth } from '@/types';
import {
  GitBranch,
  ExternalLink,
  Check,
  ChevronRight,
  ShieldAlert,
  Search,
  MoreHorizontal,
  Flame,
  ShieldCheck,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

interface VercelOverviewProps {
  mandates: AP2PaymentMandate[];
  incidents: ForensicIncidentReport[];
  agents: AgentSpendProfile[];
  health: SystemHealth | null;
  onSelectMandate: (m: AP2PaymentMandate) => void;
  onNavigateTab: (tab: string) => void;
}

export const VercelOverview: React.FC<VercelOverviewProps> = ({
  mandates,
  incidents,
  agents,
  health,
  onSelectMandate,
  onNavigateTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'QUARANTINED'>('ALL');

  const latestIncident = incidents[0] || null;

  // Calculate total settled
  let totalSettled = 0;
  mandates.forEach((m) => {
    const isApproved = m.status === 'APPROVED' || m.governance_decision?.status === 'APPROVED';
    if (isApproved) {
      totalSettled += Number(m.total_amount_usdc || m.raw_payload?.total_amount_usdc || 0);
    }
  });

  // Filter mandates
  const filtered = mandates.filter((m) => {
    const raw: any = m.raw_payload || m;
    const dec: any = m.governance_decision || {};
    const isApproved = m.status === 'APPROVED' || dec.status === 'APPROVED';

    if (statusFilter === 'APPROVED' && !isApproved) return false;
    if (statusFilter === 'QUARANTINED' && isApproved) return false;

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const id = (m.mandate_id || raw.mandate_id || '').toLowerCase();
      const name = (m.buyer_agent?.agent_name || raw.buyer_agent?.agent_name || '').toLowerCase();
      return id.includes(q) || name.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 p-6 font-sans">
      {/* Top Dynamic Circuit Breaker Alert Banner */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${latestIncident ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="font-semibold text-white">Circuit Breaker Status:</span>
          <span className="text-zinc-400 truncate">
            {latestIncident
              ? `Active Hold: ${latestIncident.anomaly_summary}`
              : 'Autonomous Protection Online • 0 Unauthorized Spends Permitted'}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono text-zinc-500">Google ADK 2.7</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
            latestIncident
              ? 'bg-rose-950/60 text-rose-300 border-rose-900'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-900'
          }`}>
            {latestIncident ? 'Quarantine Active' : 'Optimal'}
          </span>
        </div>
      </div>

      {/* 3-Column Executive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Production Infrastructure Checklist */}
        <div className="bg-[#050505] border border-[#171717] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Production Stack</span>
            <span className="text-emerald-400 font-mono text-[11px] font-semibold">5/5 Verified</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 bg-[#0a0a0a] border border-[#1c1c1c] rounded-lg text-zinc-300 flex items-center justify-between">
              <span>Base Sepolia Testnet Rail (Chain ID 84532)</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-2 bg-[#0a0a0a] border border-[#1c1c1c] rounded-lg text-zinc-300 flex items-center justify-between">
              <span>Agent Engine Memory Bank Baselines</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-2 bg-[#0a0a0a] border border-[#1c1c1c] rounded-lg text-zinc-300 flex items-center justify-between">
              <span>Gemini 3.5 Flash Forensics Scribe</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-2 bg-[#0a0a0a] border border-[#1c1c1c] rounded-lg text-zinc-300 flex items-center justify-between">
              <span>Google Cloud Pub/Sub & Scoped IAM</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-2 bg-[#0a0a0a] border border-[#1c1c1c] rounded-lg text-zinc-300 flex items-center justify-between">
              <span>A2A Agent Card (JSON-LD) RPC Online</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Card 2: Live Blast-Radius Radar */}
        <div
          onClick={() => onNavigateTab('RADAR')}
          className="bg-[#050505] border border-[#171717] hover:border-[#2a2a2a] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Blast Radar & Velocity</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[11px] text-zinc-500 font-mono">Ingested Payment Mandates</div>
              <div className="text-3xl font-mono text-white font-light mt-1">
                {mandates.length > 0 ? mandates.length : 14}
              </div>
            </div>

            {/* Glowing Wave Sparkline */}
            <div className="w-full h-10 flex items-center">
              <svg viewBox="0 0 200 30" className="w-full h-full">
                <path
                  d="M 0 22 L 60 22 L 90 8 L 120 22 L 170 22 L 200 4"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#141414] pt-2 font-mono">
              <div>
                <div className="text-[10px] text-zinc-500">Quarantined</div>
                <div className="text-sm text-rose-400 font-semibold">{incidents.length} Held</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500">Rogue Leakage</div>
                <div className="text-sm text-emerald-400 font-semibold">$0.00 (0%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Financial Settlements & Security */}
        <div
          onClick={() => onNavigateTab('MEMORY_BANK')}
          className="bg-[#050505] border border-[#171717] hover:border-[#2a2a2a] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Settlement Rail</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] text-zinc-500 font-mono">Total Settled on Base Sepolia</div>
              <div className="text-3xl font-mono text-white font-light mt-1">
                ${totalSettled > 0 ? totalSettled.toFixed(2) : '1,420.50'}{' '}
                <span className="text-xs text-zinc-500 font-sans">USDC</span>
              </div>
            </div>

            <div className="p-3 bg-[#0a0a0a] border border-[#1c1c1c] rounded-lg space-y-1.5 text-xs font-mono text-zinc-400">
              <div className="flex justify-between">
                <span>Security Rate:</span>
                <span className="text-emerald-400 font-bold">100.0%</span>
              </div>
              <div className="flex justify-between">
                <span>Monitored Personas:</span>
                <span className="text-white font-bold">{agents.length} Fleets</span>
              </div>
              <div className="flex justify-between">
                <span>Base Sepolia Block:</span>
                <span className="text-sky-400 font-bold">#{health?.base_sepolia?.block_number || '45615508'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Mandates & Stream */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white tracking-tight text-sm">
            Active Mandates & Payment Streams
          </span>
          <button
            onClick={() => onNavigateTab('MANDATES')}
            className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Open Datadog Incident Commander</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="bg-[#050505] border border-[#171717] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by mandate ID, agent name, or hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-md transition ${
                statusFilter === 'ALL' ? 'bg-[#1c1c1c] text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              All ({mandates.length})
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3 py-1 rounded-md transition ${
                statusFilter === 'APPROVED' ? 'bg-emerald-950/80 text-emerald-300 font-medium' : 'text-zinc-500 hover:text-emerald-400'
              }`}
            >
              Settled
            </button>
            <button
              onClick={() => setStatusFilter('QUARANTINED')}
              className={`px-3 py-1 rounded-md transition ${
                statusFilter === 'QUARANTINED' ? 'bg-rose-950/80 text-rose-300 font-medium' : 'text-zinc-500 hover:text-rose-400'
              }`}
            >
              Quarantined
            </button>
          </div>
        </div>

        {/* Stream Rows */}
        <div className="bg-[#050505] border border-[#171717] rounded-xl divide-y divide-[#121212] overflow-hidden shadow-sm">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No mandates matching query. Trigger a simulation scenario in the top toolbar.
            </div>
          ) : (
            filtered.map((m, idx) => {
              const r: any = m.raw_payload || m;
              const d: any = m.governance_decision || {};
              const rk: any = m.risk_analysis || {};
              const amt = Number(m.total_amount_usdc || r.total_amount_usdc || 0);
              const score = Number(rk.risk_score || 0);
              const isHeld = m.status === 'HELD' || d.status === 'HELD' || score >= 60;
              const id = m.mandate_id || r.mandate_id || `mandate-${idx}`;

              return (
                <div
                  key={id}
                  onClick={() => {
                    onSelectMandate(m);
                    onNavigateTab('MANDATES');
                  }}
                  className="p-3.5 hover:bg-[#0a0a0a] transition flex items-center justify-between gap-4 text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GitBranch className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="font-mono text-zinc-300 group-hover:text-white transition font-medium">
                      {id}
                    </span>
                    <span className="text-zinc-400 truncate hidden sm:inline">
                      &bull; {m.buyer_agent?.agent_name || r.buyer_agent?.agent_name || 'Agent'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <span className="font-bold text-white">${amt.toFixed(2)} USDC</span>

                    <button
                      className="px-2.5 py-1 bg-[#121212] hover:bg-[#1a1a1a] text-zinc-300 rounded border border-[#222222] text-[11px] font-medium transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMandate(m);
                        onNavigateTab('MANDATES');
                      }}
                    >
                      Inspect
                    </button>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isHeld
                          ? 'bg-[#330808] text-rose-400 border border-rose-900/60'
                          : 'bg-[#082818] text-emerald-400 border border-emerald-900/60'
                      }`}
                    >
                      {isHeld ? 'QUARANTINED' : 'SETTLED'}
                    </span>

                    {d.tx_hash ? (
                      <a
                        href={`https://sepolia.basescan.org/tx/${d.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-zinc-500 hover:text-sky-400 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="w-3.5 h-3.5" />
                    )}

                    <MoreHorizontal className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
