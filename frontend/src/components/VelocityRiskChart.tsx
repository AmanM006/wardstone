'use client';

import React from 'react';
import { AP2PaymentMandate } from '@/types';

interface VelocityRiskChartProps {
  mandates: AP2PaymentMandate[];
}

export const VelocityRiskChart: React.FC<VelocityRiskChartProps> = ({ mandates }) => {
  const highRiskCount = mandates.filter((m) => (m.risk_analysis?.risk_score || 0) >= 60).length;
  const highRiskPct = mandates.length > 0 ? ((highRiskCount / mandates.length) * 100).toFixed(1) : '0.0';

  let totalSettled = 0;
  mandates.forEach((m) => {
    const isApproved = m.status === 'APPROVED' || m.governance_decision?.status === 'APPROVED';
    if (isApproved) {
      totalSettled += Number(m.total_amount_usdc || (m as any).raw_payload?.total_amount_usdc || 0);
    }
  });

  return (
    <div className="space-y-6 font-sans select-text">
      {/* 1. Top 4 Metric Cards (1:1 with Vercel Screenshot 3) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#050505] border border-[#171717] rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Total Input Mandates
          </div>
          <div className="text-3xl font-light text-white tracking-tight mt-2 font-mono">
            {mandates.length}
          </div>
        </div>

        <div className="bg-[#050505] border border-[#171717] rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Total Output Volume
          </div>
          <div className="text-3xl font-light text-white tracking-tight mt-2 font-mono">
            {totalSettled.toFixed(2)} <span className="text-xs text-zinc-500 font-sans">USDC</span>
          </div>
        </div>

        <div className="bg-[#050505] border border-[#171717] rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Requests with Risk &ge; 60.0
          </div>
          <div className="text-3xl font-light text-amber-400 tracking-tight mt-2 font-mono flex items-center gap-2">
            <span>{highRiskPct}%</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
        </div>

        <div className="bg-[#050505] border border-[#171717] rounded-xl p-5 flex flex-col justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Mean Execution Latency
          </div>
          <div className="text-3xl font-light text-sky-400 tracking-tight mt-2 font-mono">
            14.2 <span className="text-xs text-zinc-500 font-sans">ms</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Wave Charts (1:1 with Vercel Screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Tokens / Velocity Per Second (Electric Purple) */}
        <div className="bg-[#050505] border border-[#171717] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Tokens & Velocity Per Second Generated
            </span>
            <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Output: Tokens Per Second
            </span>
          </div>

          <div className="w-full h-44 relative flex items-center justify-center">
            <svg viewBox="0 0 600 160" className="w-full h-full">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[20, 55, 90, 125, 150].map((y, i) => (
                <g key={i}>
                  <line x1="35" y1={y} x2="580" y2={y} stroke="#141414" strokeWidth="1" />
                  <text x="5" y={y + 3} fill="#52525b" fontSize="10" fontFamily="monospace">
                    {40 - i * 10}
                  </text>
                </g>
              ))}

              {/* Undulating Bezier Area */}
              <path
                d="M 35 120 C 100 110, 140 85, 180 90 C 220 95, 250 50, 300 50 C 350 50, 380 130, 430 135 C 480 140, 530 135, 580 130 L 580 150 L 35 150 Z"
                fill="url(#purpleGrad)"
              />

              {/* Undulating Bezier Stroke */}
              <path
                d="M 35 120 C 100 110, 140 85, 180 90 C 220 95, 250 50, 300 50 C 350 50, 380 130, 430 135 C 480 140, 530 135, 580 130"
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-8 border-t border-[#141414] pt-2">
            <span>00:00</span>
            <span>00:15</span>
            <span>00:30</span>
            <span>00:45</span>
            <span>01:00</span>
          </div>
        </div>

        {/* Chart 2: Pipeline Execution Latency (Neon Blue) */}
        <div className="bg-[#050505] border border-[#171717] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Pipeline Execution Latency (ms)
            </span>
            <span className="text-[11px] font-mono text-sky-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Latency (ms)
            </span>
          </div>

          <div className="w-full h-44 relative flex items-center justify-center">
            <svg viewBox="0 0 600 160" className="w-full h-full">
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[20, 55, 90, 125, 150].map((y, i) => (
                <g key={i}>
                  <line x1="35" y1={y} x2="580" y2={y} stroke="#141414" strokeWidth="1" />
                  <text x="0" y={y + 3} fill="#52525b" fontSize="10" fontFamily="monospace">
                    {4000 - i * 1000}
                  </text>
                </g>
              ))}

              {/* Undulating Bezier Area */}
              <path
                d="M 35 100 C 90 120, 140 140, 190 120 C 240 100, 310 125, 360 130 C 410 135, 470 30, 520 70 C 550 90, 570 120, 580 125 L 580 150 L 35 150 Z"
                fill="url(#blueGrad)"
              />

              {/* Undulating Bezier Stroke */}
              <path
                d="M 35 100 C 90 120, 140 140, 190 120 C 240 100, 310 125, 360 130 C 410 135, 470 30, 520 70 C 550 90, 570 120, 580 125"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-8 border-t border-[#141414] pt-2">
            <span>00:00</span>
            <span>00:15</span>
            <span>00:30</span>
            <span>00:45</span>
            <span>01:00</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Table + Hollow Donut + Green Request Wave (1:1 with Vercel Screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Services Table (5 cols) */}
        <div className="lg:col-span-5 bg-[#050505] border border-[#171717] rounded-xl p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
            Services and Protocols using AP2 SDK
          </div>
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-[#171717] text-[10px] text-zinc-500 uppercase">
                <th className="pb-2">service.name</th>
                <th className="pb-2">telemetry.sdk</th>
                <th className="pb-2 text-right">Spans</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121212] text-[11px] text-zinc-300">
              <tr>
                <td className="py-2.5 text-sky-400">wardstone-gatekeeper</td>
                <td className="py-2.5 text-zinc-500">python / adk-2.7</td>
                <td className="py-2.5 text-right font-bold text-white">218</td>
              </tr>
              <tr>
                <td className="py-2.5 text-sky-400">gemini-3.5-forensics</td>
                <td className="py-2.5 text-zinc-500">vertex / google-genai</td>
                <td className="py-2.5 text-right font-bold text-white">104</td>
              </tr>
              <tr>
                <td className="py-2.5 text-sky-400">base-sepolia-x402</td>
                <td className="py-2.5 text-zinc-500">web3.py / eip-4337</td>
                <td className="py-2.5 text-right font-bold text-white">64</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Center: Donut Ring Chart (3 cols) */}
        <div className="lg:col-span-3 bg-[#050505] border border-[#171717] rounded-xl p-5 flex flex-col justify-between items-center text-center">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 self-start">
            LLM Provider Distribution
          </div>

          <div className="relative flex items-center justify-center my-2">
            <svg width="110" height="110" viewBox="0 0 120 120" className="transform -rotate-90">
              <circle cx="60" cy="60" r="45" fill="transparent" stroke="#171717" strokeWidth="18" />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="transparent"
                stroke="#c084fc"
                strokeWidth="18"
                strokeDasharray="282.7"
                strokeDashoffset="80"
                strokeLinecap="round"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="transparent"
                stroke="#38bdf8"
                strokeWidth="18"
                strokeDasharray="282.7"
                strokeDashoffset="210"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono text-white">218</span>
              <span className="text-[9px] text-zinc-500 font-mono">Spans</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400 pt-2 border-t border-[#141414] w-full justify-center">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Gemini
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Base
            </span>
          </div>
        </div>

        {/* Right: Number of Requests Over Time Wave (4 cols) */}
        <div className="lg:col-span-4 bg-[#050505] border border-[#171717] rounded-xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Requests Over Time
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Count
            </span>
          </div>

          <div className="w-full h-24">
            <svg viewBox="0 0 300 100" className="w-full h-full">
              <path
                d="M 10 70 C 60 50, 100 20, 150 20 C 200 20, 240 60, 290 30"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-zinc-500 border-t border-[#141414] pt-1">
            <span>00:00</span>
            <span>00:30</span>
            <span>01:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
