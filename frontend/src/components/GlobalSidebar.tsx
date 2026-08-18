'use client';

import React from 'react';
import { Shield, Radio, Users, Activity, Sliders, HelpCircle, Terminal } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  urgencyFilter: string;
  setUrgencyFilter: (u: string) => void;
  selectedAgentFilter: string;
  setSelectedAgentFilter: (a: string) => void;
  highCount: number;
  medCount: number;
  lowCount: number;
  agentList: { id: string; name: string; count: number }[];
}

export const GlobalSidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  urgencyFilter,
  setUrgencyFilter,
  selectedAgentFilter,
  setSelectedAgentFilter,
  highCount,
  medCount,
  lowCount,
  agentList
}) => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
            <Shield className="w-4 h-4 text-sky-400" />
          </div>
        </div>
        <div>
          <div className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
            WARDSTONE <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono">AP2</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Fleet Incident Control</div>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="p-3 border-b border-slate-800/60 space-y-1">
        <button
          onClick={() => setActiveTab('RADAR')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'RADAR'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Live Radar & Stream</span>
        </button>

        <button
          onClick={() => setActiveTab('TRACES')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'TRACES'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>ADK Nexus Traces</span>
        </button>

        <button
          onClick={() => setActiveTab('AGENTS')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'AGENTS'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Memory Bank Fleets</span>
        </button>
      </div>

      {/* Datadog-style Facet Filters */}
      <div className="p-4 flex-1 space-y-5 text-xs">
        {/* Risk / Urgency Filter */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Blast-Radius Urgency
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer group">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={urgencyFilter === 'HIGH'}
                  onChange={() => setUrgencyFilter(urgencyFilter === 'HIGH' ? 'ALL' : 'HIGH')}
                  className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                />
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  HIGH (Quarantined)
                </span>
              </div>
              <span className="font-mono text-slate-400 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {highCount}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer group">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={urgencyFilter === 'MED'}
                  onChange={() => setUrgencyFilter(urgencyFilter === 'MED' ? 'ALL' : 'MED')}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  MED (Review)
                </span>
              </div>
              <span className="font-mono text-slate-400 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {medCount}
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer group">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={urgencyFilter === 'LOW'}
                  onChange={() => setUrgencyFilter(urgencyFilter === 'LOW' ? 'ALL' : 'LOW')}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                />
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  LOW (Settled)
                </span>
              </div>
              <span className="font-mono text-slate-400 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {lowCount}
              </span>
            </label>
          </div>
        </div>

        {/* Monitored Agent Services */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Monitored Agent Personas
          </div>
          <div className="space-y-1">
            {agentList.map((ag) => (
              <label
                key={ag.id}
                className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <input
                    type="checkbox"
                    checked={selectedAgentFilter === ag.id}
                    onChange={() => setSelectedAgentFilter(selectedAgentFilter === ag.id ? 'ALL' : ag.id)}
                    className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                  />
                  <span className="text-slate-300 truncate text-[11px]">{ag.name}</span>
                </div>
                <span className="font-mono text-slate-400 text-[10px]">
                  {ag.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Base Sepolia Active</span>
        </span>
        <span className="font-mono text-[10px]">v1.0.1</span>
      </div>
    </aside>
  );
};
