'use client';

import React from 'react';
import { SystemHealth } from '@/types';
import { Radio, Search, Shield, Key, FileCode } from 'lucide-react';

interface DatadogTopNavProps {
  health: SystemHealth | null;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  onOpenPreClearance: () => void;
  onOpenAgentCard: () => void;
}

export const DatadogTopNav: React.FC<DatadogTopNavProps> = ({
  health,
  activeNavTab,
  setActiveNavTab,
  onOpenPreClearance,
  onOpenAgentCard
}) => {
  const blockNumber = health?.base_sepolia?.block_number;
  const isConnected = health?.base_sepolia?.connected ?? false;

  const tabs = [
    { id: 'PAGES', label: 'Pages (Mandate Stream)' },
    { id: 'SUMMARY', label: 'Summary & Radar' },
    { id: 'TEAMS', label: 'Fleet Personas' },
    { id: 'TRACES', label: 'ADK Nexus Traces' }
  ];

  return (
    <header className="h-14 bg-[#050505] border-b border-[#1a1a1a] px-5 flex items-center justify-between select-none text-xs sticky top-0 z-10">
      {/* Datadog Horizontal Tabs */}
      <div className="flex items-center gap-6 h-full">
        {tabs.map((t) => {
          const isActive = activeNavTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveNavTab(t.id)}
              className={`h-full flex items-center font-semibold tracking-wide border-b-2 transition ${
                isActive
                  ? 'text-white border-sky-400 font-bold'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenPreClearance}
          className="px-2.5 py-1.5 bg-[#111111] hover:bg-[#1a1a1a] text-sky-400 border border-[#2a2a2a] rounded font-medium flex items-center gap-1.5 transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>A2A Pre-Clearance</span>
        </button>

        <button
          onClick={onOpenAgentCard}
          className="px-2.5 py-1.5 bg-[#111111] hover:bg-[#1a1a1a] text-zinc-300 border border-[#2a2a2a] rounded font-medium flex items-center gap-1.5 transition"
        >
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          <span>Agent Card</span>
        </button>

        {/* Base Sepolia Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0e0e] border border-[#222222] rounded font-mono text-[11px] text-zinc-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
            }`}
          />
          <span className="hidden sm:inline text-zinc-400">Base Sepolia</span>
          <span className="text-white font-bold">
            {blockNumber ? `Block #${blockNumber}` : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
};
