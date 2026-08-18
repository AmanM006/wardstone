'use client';

import React, { useState } from 'react';
import { AgentSpendProfile, AP2PaymentMandate } from '@/types';
import { X, Shield, Activity, TrendingUp, CheckCircle2, Sliders, ExternalLink, Zap, Terminal } from 'lucide-react';

interface FleetDetailModalProps {
  agent: AgentSpendProfile | null;
  mandates: AP2PaymentMandate[];
  onClose: () => void;
  onUpdatePolicy: (agentId: string, velocity: number, maxMandate: number) => void;
}

export const FleetDetailModal: React.FC<FleetDetailModalProps> = ({
  agent,
  mandates,
  onClose,
  onUpdatePolicy
}) => {
  if (!agent) return null;

  const [hourlyVelocity, setHourlyVelocity] = useState(agent.baseline_hourly_velocity.toString());
  const [maxMandate, setMaxMandate] = useState(agent.max_single_mandate.toString());
  const [isSaved, setIsSaved] = useState(false);

  // Filter mandates by this agent
  const agentMandates = mandates.filter((m) => {
    const r: any = m.raw_payload || m;
    return (m.buyer_agent?.agent_id || r.buyer_agent?.agent_id) === agent.agent_id;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePolicy(agent.agent_id, Number(hourlyVelocity), Number(maxMandate));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans select-text">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-sky-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">{agent.agent_name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/80 text-sky-400 border border-sky-900">
                  Score: {agent.reputation_score}/100
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">Agent ID: {agent.agent_id}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-[#141414] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#050505] border border-[#171717] rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Baseline Velocity</span>
              <span className="text-lg font-mono font-semibold text-sky-400 mt-1 block">
                ${agent.baseline_hourly_velocity}/hr
              </span>
            </div>
            <div className="p-3.5 bg-[#050505] border border-[#171717] rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Single Mandate</span>
              <span className="text-lg font-mono font-semibold text-white mt-1 block">
                ${agent.max_single_mandate} USDC
              </span>
            </div>
            <div className="p-3.5 bg-[#050505] border border-[#171717] rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Settled</span>
              <span className="text-lg font-mono font-semibold text-emerald-400 mt-1 block">
                ${agent.total_settled_usdc} USDC
              </span>
            </div>
          </div>

          {/* Policy Adjustment Form */}
          <div className="p-4 bg-[#050505] border border-[#171717] rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Adjust Governance Policy Limits</span>
              </span>
              {isSaved && (
                <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved to Memory Bank
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Max Hourly Velocity ($/hr):</label>
                <input
                  type="number"
                  value={hourlyVelocity}
                  onChange={(e) => setHourlyVelocity(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0a0a0a] border border-[#222222] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Max Single Mandate ($ USDC):</label>
                <input
                  type="number"
                  value={maxMandate}
                  onChange={(e) => setMaxMandate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0a0a0a] border border-[#222222] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition shadow"
                >
                  Save Policy to Agent Engine Memory Bank
                </button>
              </div>
            </form>
          </div>

          {/* Recent Mandates Emitted by this Agent */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Recent Mandates by this Fleet ({agentMandates.length})
            </div>

            <div className="bg-[#050505] border border-[#171717] rounded-xl divide-y divide-[#121212] max-h-48 overflow-y-auto">
              {agentMandates.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500">
                  No transaction history recorded yet for this persona.
                </div>
              ) : (
                agentMandates.map((m) => {
                  const r: any = m.raw_payload || m;
                  const amt = Number(m.total_amount_usdc || r.total_amount_usdc || 0);
                  const isHeld = m.status === 'HELD' || m.governance_decision?.status === 'HELD';
                  return (
                    <div key={m.mandate_id || r.mandate_id} className="p-3 flex items-center justify-between text-xs font-mono">
                      <div className="truncate text-zinc-300">
                        {m.mandate_id || r.mandate_id}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-white">${amt.toFixed(2)} USDC</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isHeld
                              ? 'bg-rose-950 text-rose-400 border border-rose-900'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                          }`}
                        >
                          {isHeld ? 'QUARANTINED' : 'SETTLED'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
