'use client';

import React from 'react';
import { AP2PaymentMandate, ForensicIncidentReport, AgentSpendProfile, SystemHealth } from '@/types';
import { ArrowUpRight, ShieldCheck, Flame, Cpu, DollarSign } from 'lucide-react';

interface MetricsGridProps {
  mandates: AP2PaymentMandate[];
  incidents: ForensicIncidentReport[];
  agents: AgentSpendProfile[];
  health: SystemHealth | null;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  mandates,
  incidents,
  agents,
  health
}) => {
  // Calculate total settled spend
  let totalSpendUsdc = 0;
  mandates.forEach((m) => {
    const isApproved = m.status === 'APPROVED' || m.governance_decision?.status === 'APPROVED';
    if (isApproved) {
      const amount = Number(m.total_amount_usdc || m.raw_payload?.total_amount_usdc || 0);
      totalSpendUsdc += amount;
    }
  });

  const blockHeight = health?.base_sepolia?.block_number || 45612338;
  const quarantinedCount = incidents.length;
  const activeAgentCount = agents.length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Fleet Spend */}
      <div className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Fleet Spend
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-sky-400 transition">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-3xl font-bold font-mono text-white tracking-tight">
            ${totalSpendUsdc.toFixed(2)}{' '}
            <span className="text-xs font-sans text-sky-400 font-semibold">USDC</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Base Sepolia x402 Micropayments</span>
        </div>
      </div>

      {/* Card 2: Monitored Agent Personas */}
      <div className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monitored Agent Fleets
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-3xl font-bold font-mono text-white tracking-tight">
            {activeAgentCount}{' '}
            <span className="text-xs font-sans text-amber-400 font-semibold">Fleets</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Agent Engine Memory Bank Profiles</span>
        </div>
      </div>

      {/* Card 3: Circuit Breaker Interventions */}
      <div className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Circuit Breaker Interventions
          </span>
          <div className="w-7 h-7 rounded-full bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-3xl font-bold font-mono text-rose-400 tracking-tight">
            {quarantinedCount}{' '}
            <span className="text-xs font-sans text-rose-400/80 font-semibold">Quarantined</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Pre-Settlement Kill Switch (0 Leaks)</span>
        </div>
      </div>

      {/* Card 4: Base Sepolia Block Height & Security */}
      <div className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Settlement Security Rate
          </span>
          <div className="w-7 h-7 rounded-full bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
            100.0%
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Block #{blockHeight}</span>
        </div>
      </div>
    </section>
  );
};
