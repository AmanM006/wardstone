'use client';

import React, { useState } from 'react';
import { RefreshCw, Play, ShieldAlert } from 'lucide-react';

interface SimulationBarProps {
  onTrigger: (scenario: string) => Promise<void>;
}

export const SimulationBar: React.FC<SimulationBarProps> = ({ onTrigger }) => {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);

  const handleTrigger = async (scenario: string) => {
    try {
      setLoadingScenario(scenario);
      await onTrigger(scenario);
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <section className="bg-[#000000] border-b border-[#141414] px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
          Simulation Rail
        </span>
        <span className="text-zinc-700 font-mono text-[10px]">/</span>
        <span className="text-zinc-400 text-[11px]">
          AP2 Payment Mandate Ingestion & Circuit Breaker Triggers
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={loadingScenario !== null}
          onClick={() => handleTrigger('normal_indexer')}
          className="px-3 py-1.5 bg-[#080808] hover:bg-[#111111] active:scale-[0.98] text-zinc-300 border border-[#1a1a1a] hover:border-[#262626] rounded-md font-medium text-[11px] transition flex items-center gap-2 disabled:opacity-40 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Normal Indexer ($2.50)</span>
        </button>

        <button
          disabled={loadingScenario !== null}
          onClick={() => handleTrigger('batch_compute')}
          className="px-3 py-1.5 bg-[#080808] hover:bg-[#111111] active:scale-[0.98] text-zinc-300 border border-[#1a1a1a] hover:border-[#262626] rounded-md font-medium text-[11px] transition flex items-center gap-2 disabled:opacity-40 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Batch Evaluation ($25.00)</span>
        </button>

        <button
          disabled={loadingScenario !== null}
          onClick={() => handleTrigger('runaway_rogue')}
          className="px-3 py-1.5 bg-[#0e0606] hover:bg-[#170a0a] active:scale-[0.98] text-rose-300 border border-rose-950/80 hover:border-rose-900 rounded-md font-medium text-[11px] transition flex items-center gap-2 disabled:opacity-40 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Rogue Runaway ($220.00)</span>
        </button>

        <button
          disabled={loadingScenario !== null}
          onClick={() => handleTrigger('worker_failure')}
          className="px-3 py-1.5 bg-[#080808] hover:bg-[#111111] active:scale-[0.98] text-zinc-400 hover:text-zinc-200 border border-[#1a1a1a] hover:border-[#262626] rounded-md font-medium text-[11px] transition flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
        >
          <RefreshCw className={`w-3 h-3 text-zinc-400 ${loadingScenario === 'worker_failure' ? 'animate-spin text-sky-400' : ''}`} />
          <span>Inject Worker Failure</span>
        </button>
      </div>
    </section>
  );
};
