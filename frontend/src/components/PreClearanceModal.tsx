'use client';

import React, { useState } from 'react';
import { AgentSpendProfile } from '@/types';
import { queryPreClearance } from '@/lib/api';
import { X, ShieldCheck, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface PreClearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentSpendProfile[];
}

export const PreClearanceModal: React.FC<PreClearanceModalProps> = ({
  isOpen,
  onClose,
  agents
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.agent_id || 'agent_steady_worker');
  const [amount, setAmount] = useState('5.00');
  const [service, setService] = useState('Vector Embedding Compute');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await queryPreClearance(selectedAgentId, Number(amount), service);
      setResult(res);
    } catch (err: any) {
      setResult({ error: err.message || 'Simulation error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans select-text">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-white text-sm">A2A Pre-Clearance RPC Query</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Query the Wardstone Gatekeeper A2A Pre-Clearance RPC before emitting an AP2 payment mandate to pre-calculate risk and prevent circuit breaker intervention.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-400 font-medium mb-1">Select Requesting Agent:</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1f1f1f] rounded-lg text-white text-xs focus:outline-none focus:border-zinc-500"
              >
                {agents.map((ag) => (
                  <option key={ag.agent_id} value={ag.agent_id}>
                    {ag.agent_name} (${ag.baseline_hourly_velocity}/hr baseline)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1">Intended Mandate Amount (USDC):</label>
              <input
                type="number"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1f1f1f] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1">Micro-Service Description:</label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 bg-[#050505] border border-[#1f1f1f] rounded-lg text-white text-xs focus:outline-none focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Evaluating A2A Pre-Clearance...' : 'Run Pre-Clearance Query (A2A RPC)'}
            </button>
          </form>

          {/* Result Block */}
          {result && (
            <div className="mt-4 p-4 bg-[#050505] border border-[#1a1a1a] rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-zinc-400 font-semibold">Pre-Clearance Status:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    result.pre_clearance_status === 'APPROVED'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-900'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-900'
                  }`}
                >
                  {result.pre_clearance_status || 'ERROR'}
                </span>
              </div>
              <div className="text-zinc-400 text-[11px]">
                <strong>Calculated Risk Score: </strong>
                <span className="font-mono text-white">{result.calculated_risk_score ?? 'N/A'}/100</span>
              </div>
              <div className="text-zinc-400 text-[11px] leading-relaxed">
                <strong>Analysis: </strong>
                {result.reasoning || result.error || 'Evaluation complete.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
