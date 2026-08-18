'use client';

import React from 'react';
import { SystemHealth } from '@/types';

interface NavbarProps {
  health: SystemHealth | null;
  onOpenPreClearance: () => void;
  onOpenAgentCard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  onOpenPreClearance,
  onOpenAgentCard
}) => {
  const blockNumber = health?.base_sepolia?.block_number;
  const isConnected = health?.base_sepolia?.connected ?? false;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
          <span className="text-white text-xs font-bold">W</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
            WARDSTONE <span className="text-sky-400 font-semibold">AP2</span>
          </h1>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
          AI Agent Fleet Controller
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenPreClearance}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 rounded-lg transition"
        >
          🔍 A2A Pre-Clearance
        </button>

        <button
          onClick={onOpenAgentCard}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition"
        >
          📜 Agent Card (JSON-LD)
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
            }`}
          />
          <span className="hidden md:inline">Base Sepolia</span>
          <span className="text-sky-400 font-semibold">
            {blockNumber ? `Block #${blockNumber}` : 'Connecting...'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-400">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Google ADK + Gemini 3.5</span>
        </div>
      </div>
    </header>
  );
};
