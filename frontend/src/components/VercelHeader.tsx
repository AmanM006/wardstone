'use client';

import React from 'react';
import { SystemHealth } from '@/types';
import { RefreshCw, Play, ShieldAlert, Zap, Radio } from 'lucide-react';

interface VercelHeaderProps {
  health: SystemHealth | null;
  onOpenPreClearance: () => void;
  onOpenAgentCard: () => void;
  onTriggerSimulation: (scenario: string) => Promise<void>;
  loadingScenario: string | null;
}

export const VercelHeader: React.FC<VercelHeaderProps> = ({
  health,
  onOpenPreClearance,
  onOpenAgentCard,
  onTriggerSimulation,
  loadingScenario
}) => {
  const blockNumber = health?.base_sepolia?.block_number;
  const isConnected = health?.base_sepolia?.connected ?? false;

  return (
    <header className="h-14 bg-[#000000] border-b border-[#1a1a1a] px-5 flex items-center justify-between select-none text-xs sticky top-0 z-10 shrink-0 font-sans">
      {/* Left: Project Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white tracking-tight text-xs">wardstone-ap2</span>
        <span className="text-zinc-600 font-mono text-xs">/</span>
        <span className="text-zinc-400 text-xs">ap2-x402-circuit-breaker</span>
      </div>

      {/* Center: Live Simulation Trigger Controls */}
      <div className="hidden lg:flex items-center gap-2">
        <button
          disabled={loadingScenario !== null}
          onClick={() => onTriggerSimulation('normal_indexer')}
          className="px-2.5 py-1 bg-[#0a0a0a] hover:bg-[#141414] active:scale-[0.98] text-zinc-300 border border-[#222222] hover:border-[#333333] rounded text-[11px] font-medium transition flex items-center gap-1.5 disabled:opacity-40"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Normal ($2.50)</span>
        </button>

        <button
          disabled={loadingScenario !== null}
          onClick={() => onTriggerSimulation('batch_compute')}
          className="px-2.5 py-1 bg-[#0a0a0a] hover:bg-[#141414] active:scale-[0.98] text-zinc-300 border border-[#222222] hover:border-[#333333] rounded text-[11px] font-medium transition flex items-center gap-1.5 disabled:opacity-40"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Batch ($25.00)</span>
        </button>

        <button
          disabled={loadingScenario !== null}
          onClick={() => onTriggerSimulation('runaway_rogue')}
          className="px-2.5 py-1 bg-[#140606] hover:bg-[#200909] active:scale-[0.98] text-rose-300 border border-rose-900/60 hover:border-rose-800 rounded text-[11px] font-medium transition flex items-center gap-1.5 disabled:opacity-40"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Rogue Runaway ($220.00)</span>
        </button>

        <button
          disabled={loadingScenario !== null}
          onClick={() => onTriggerSimulation('worker_failure')}
          className="px-2.5 py-1 bg-[#0a0a0a] hover:bg-[#141414] active:scale-[0.98] text-zinc-400 hover:text-zinc-200 border border-[#222222] hover:border-[#333333] rounded text-[11px] font-medium transition flex items-center gap-1.5 disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 text-zinc-400 ${loadingScenario === 'worker_failure' ? 'animate-spin text-sky-400' : ''}`} />
          <span>Inject Crash</span>
        </button>
      </div>

      {/* Right: Quick Actions & Live Blockchain Height */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenPreClearance}
          className="px-2.5 py-1 bg-[#0c0c0c] hover:bg-[#161616] text-zinc-300 border border-[#222222] rounded text-[11px] font-medium transition"
        >
          A2A Pre-Clearance
        </button>

        <button
          onClick={onOpenAgentCard}
          className="px-2.5 py-1 bg-[#0c0c0c] hover:bg-[#161616] text-zinc-300 border border-[#222222] rounded text-[11px] font-medium transition"
        >
          Agent Card
        </button>

        {/* Base Sepolia Live Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0c0c0c] border border-[#222222] rounded font-mono text-[11px] text-zinc-300">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-500'
            }`}
          />
          <span className="text-zinc-500 font-sans">Base Sepolia</span>
          <span className="text-white font-semibold">
            {blockNumber ? `#${blockNumber}` : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
};
