'use client';

import React from 'react';
import { AgentSpendProfile } from '@/types';

interface AgentProfilesListProps {
  agents: AgentSpendProfile[];
}

export const AgentProfilesList: React.FC<AgentProfilesListProps> = ({ agents }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">Memory Bank: Agent Profiles & Baselines</h2>
          <span className="px-2 py-0.5 text-xs font-mono bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/20">
            A2A Verified
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
        {agents.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No agent profiles registered.
          </div>
        ) : (
          agents.map((ag) => (
            <div
              key={ag.agent_id}
              className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between gap-3 hover:border-slate-700 transition"
            >
              <div>
                <div className="text-xs font-bold text-white">{ag.agent_name}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  ID: {ag.agent_id} • Max Single: ${ag.max_single_mandate}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-sky-400">
                  ${Number(ag.baseline_hourly_velocity).toFixed(1)}/hr
                </div>
                <div className="text-[10px] text-slate-400">
                  Baseline Spend Rate
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
