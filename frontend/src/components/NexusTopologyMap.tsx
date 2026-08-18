'use client';

import React from 'react';

export const NexusTopologyMap: React.FC = () => {
  const nodes = [
    { id: '1', title: 'Buyer Agent', subtitle: 'AP2 Mandate', time: '0.0ms', status: 'INIT', color: '#71717a' },
    { id: '2', title: 'Gemma 2', subtitle: 'Edge Sanitizer', time: '1.2ms', status: 'CLEAN', color: '#818cf8' },
    { id: '3', title: 'Watcher Agent', subtitle: 'PubSub / Store', time: '3.4ms', status: 'INGESTED', color: '#38bdf8' },
    { id: '4', title: 'Forecaster', subtitle: 'Memory Bank', time: '5.1ms', status: 'RISK 0-100', color: '#fbbf24' },
    { id: '5', title: 'Gatekeeper', subtitle: 'Circuit Breaker', time: '3.8ms', status: 'GATED <60', color: '#34d399' },
    { id: '6', title: 'Settler / Forensics', subtitle: 'Base Sepolia', time: '14.2ms', status: 'FINALITY', color: '#a855f7' }
  ];

  return (
    <div className="bg-[#050505] border border-[#141414] rounded-lg p-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
          Multi-Agent Nexus Pipeline Topology
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-[#0d0d0d] px-2 py-0.5 rounded border border-[#1c1c1c]">
          Google ADK 2.7 Pipeline Execution
        </span>
      </div>

      {/* Horizontal Connected Pipeline Rail */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {nodes.map((n, i) => (
          <div
            key={n.id}
            className="p-3 bg-[#080808] border border-[#171717] rounded-md flex flex-col justify-between h-24 relative group hover:border-[#2a2a2a] transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500">0{i + 1}</span>
              <span className="text-[10px] font-mono text-zinc-400">{n.time}</span>
            </div>

            <div>
              <div className="text-xs font-medium text-white tracking-tight">{n.title}</div>
              <div className="text-[10px] font-mono text-zinc-500">{n.subtitle}</div>
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t border-[#121212]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: n.color }} />
              <span className="text-[9px] font-mono font-semibold" style={{ color: n.color }}>
                {n.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
