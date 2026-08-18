'use client';

import React from 'react';
import { Search, ChevronDown, Bell, CheckSquare, Square, Shield, Radio, Activity, Users, Settings } from 'lucide-react';

interface DatadogSidebarProps {
  urgencyFilter: string;
  setUrgencyFilter: (u: string) => void;
  selectedAgentFilter: string;
  setSelectedAgentFilter: (a: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  highCount: number;
  lowCount: number;
  totalCount: number;
  agentList: { id: string; name: string; count: number }[];
}

export const DatadogSidebar: React.FC<DatadogSidebarProps> = ({
  urgencyFilter,
  setUrgencyFilter,
  selectedAgentFilter,
  setSelectedAgentFilter,
  searchTerm,
  setSearchTerm,
  highCount,
  lowCount,
  totalCount,
  agentList
}) => {
  return (
    <aside className="w-64 h-full bg-[#050505] border-r border-[#1a1a1a] flex flex-col shrink-0 select-none text-xs z-20 overflow-hidden">
      {/* Top Header Logo */}
      <div className="h-14 p-3.5 border-b border-[#1a1a1a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#111111] border border-[#2a2a2a] flex items-center justify-center text-sky-400 font-bold text-xs">
            W
          </div>
          <div className="font-semibold text-white tracking-wide text-xs">
            WARDSTONE <span className="text-[10px] text-sky-400 font-mono">AP2</span>
          </div>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">v1.0</span>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-[#1a1a1a] shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search mandates, agents, tx..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-[#0e0e0e] border border-[#222222] rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>
      </div>

      {/* Pages Switcher */}
      <div className="p-3 border-b border-[#1a1a1a] space-y-1 shrink-0">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-[#0066cc] text-white rounded font-medium text-xs shadow">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" />
            <span>All Pages</span>
          </div>
          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">{totalCount}</span>
        </button>
        <button className="w-full flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white rounded hover:bg-[#0e0e0e] transition">
          <Users className="w-3.5 h-3.5 text-zinc-500" />
          <span>My Assigned Fleets</span>
        </button>
      </div>

      {/* Scrollable Facet Filter Checklists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Urgency Section */}
        <div>
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold mb-2">
            <span className="flex items-center gap-1">
              <ChevronDown className="w-3 h-3" />
              <span>Urgency</span>
            </span>
          </div>
          <div className="space-y-1">
            <label
              onClick={() => setUrgencyFilter(urgencyFilter === 'HIGH' ? 'ALL' : 'HIGH')}
              className="flex items-center justify-between p-1.5 rounded hover:bg-[#0e0e0e] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {urgencyFilter === 'HIGH' ? (
                  <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-zinc-600" />
                )}
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#330808] text-rose-400 rounded border border-rose-900/60">
                  HIGH
                </span>
              </div>
              <span className="font-mono text-zinc-500 text-[11px]">{highCount}</span>
            </label>

            <label
              onClick={() => setUrgencyFilter(urgencyFilter === 'LOW' ? 'ALL' : 'LOW')}
              className="flex items-center justify-between p-1.5 rounded hover:bg-[#0e0e0e] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {urgencyFilter === 'LOW' ? (
                  <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-zinc-600" />
                )}
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#2d2204] text-amber-300 rounded border border-amber-800/60">
                  LOW
                </span>
              </div>
              <span className="font-mono text-zinc-500 text-[11px]">{lowCount}</span>
            </label>
          </div>
        </div>

        {/* Monitored Agent Fleets Section */}
        <div>
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold mb-2">
            <span className="flex items-center gap-1">
              <ChevronDown className="w-3 h-3" />
              <span>Fleet Personas</span>
            </span>
          </div>
          <div className="space-y-1">
            {agentList.map((ag) => {
              const isChecked = selectedAgentFilter === ag.id;
              return (
                <label
                  key={ag.id}
                  onClick={() => setSelectedAgentFilter(isChecked ? 'ALL' : ag.id)}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-[#0e0e0e] cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    )}
                    <span className="text-zinc-300 truncate text-[11px]">{ag.name}</span>
                  </div>
                  <span className="font-mono text-zinc-500 text-[10px] shrink-0">{ag.count}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Service Rail Section */}
        <div>
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold mb-2">
            <span className="flex items-center gap-1">
              <ChevronDown className="w-3 h-3" />
              <span>Settlement Rail</span>
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between p-1.5 rounded text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px]">Base Sepolia (84532)</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center justify-between p-1.5 rounded text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px]">x402 Facilitator</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1a1a1a] text-zinc-500 flex items-center justify-between text-[10px] shrink-0">
        <span>Google ADK + Gemini 3.5</span>
        <span className="text-emerald-400 font-mono">100% Security</span>
      </div>
    </aside>
  );
};
