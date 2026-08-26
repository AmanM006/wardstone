'use client';

import React, { useState } from 'react';
import { AP2PaymentMandate } from '@/types';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, ShieldAlert, Cpu, Sparkles, Network, ChevronRight } from 'lucide-react';

interface TraceWaterfallProps {
  mandate: AP2PaymentMandate | null;
}

export const TraceWaterfall: React.FC<TraceWaterfallProps> = ({ mandate }) => {
  const [selectedSpan, setSelectedSpan] = useState<string>('gatekeeper');

  if (!mandate) {
    return <div className="p-8 text-center text-xs text-zinc-500">No mandate selected for tracing. Trigger a simulation to generate a Nexus execution trace.</div>;
  }

  const raw: any = mandate.raw_payload || mandate;
  const dec: any = mandate.governance_decision || {};
  const risk: any = mandate.risk_analysis || {};
  const isHeld = mandate.status === 'HELD' || dec.status === 'HELD' || (risk.risk_score || 0) >= 60;
  const mandateId = mandate.mandate_id || raw.mandate_id;
  const agentName = mandate.buyer_agent?.agent_name || raw.buyer_agent?.agent_name || 'Agent';

  const spans = [
    {
      id: 'orchestrator',
      name: 'RootOrchestrator.process_mandate_pipeline',
      agent: 'Google ADK Root Orchestrator',
      duration: '15.8ms',
      status: 'OK',
      type: 'Nexus Pipeline Chain',
      input: {
        mandate_id: mandateId,
        agent_name: agentName,
        total_amount_usdc: Number(mandate.total_amount_usdc || raw.total_amount_usdc || 0)
      },
      output: {
        governance_status: isHeld ? 'QUARANTINED' : 'SETTLED',
        total_pipeline_latency_ms: 15.8,
        final_action: isHeld ? 'CIRCUIT_BREAKER_TRIP' : 'BASE_SEPOLIA_SETTLED'
      }
    },
    {
      id: 'gemma2',
      name: 'Gemma2PreScreen.scan_metadata',
      agent: 'Gemma 2 2B Edge Sanitizer',
      duration: '1.2ms',
      status: 'OK',
      type: 'Zero-Leak Pre-Screen',
      input: {
        headers: { 'x-ap2-signature': '0x9a8f...21c', 'content-type': 'application/json' },
        raw_length_bytes: 482
      },
      output: {
        prompt_injection_detected: false,
        malformed_bytes: 0,
        sanitization_verdict: 'CLEAN'
      }
    },
    {
      id: 'watcher',
      name: 'WatcherAgent.process_incoming_event',
      agent: 'Google Cloud Pub/Sub Watcher',
      duration: '3.4ms',
      status: 'OK',
      type: 'Pub/Sub Ingestion',
      input: {
        topic: 'projects/wardstone-ap2-dev/topics/mandate-events',
        delivery_attempt: 1
      },
      output: {
        persisted_to_firestore: true,
        event_id: `evt_${mandateId.slice(0, 10)}`
      }
    },
    {
      id: 'forecaster',
      name: 'ForecasterAgent.evaluate_mandate_risk',
      agent: 'Predictive Blast-Radius Forecaster',
      duration: '5.1ms',
      status: 'OK',
      type: 'Memory Bank Risk Calculus',
      input: {
        agent_id: mandate?.buyer_agent?.agent_id || 'agent_batch_processor',
        baseline_hourly_velocity: risk.baseline_hourly_velocity || 15.0,
        attempted_amount: Number(mandate?.total_amount_usdc || 25.0)
      },
      output: {
        risk_score: risk.risk_score || (isHeld ? 88.5 : 17.5),
        projected_velocity: risk.projected_velocity || 42.0,
        blast_radius_factor: isHeld ? 'SEVERE' : 'NOMINAL'
      }
    },
    {
      id: 'gatekeeper',
      name: 'GatekeeperAgent.evaluate_and_settle',
      agent: 'Circuit Breaker & Base Sepolia Settler',
      duration: '3.8ms',
      status: isHeld ? 'HELD' : 'OK',
      type: 'Circuit Breaker Policy',
      input: {
        circuit_breaker_threshold: 60.0,
        computed_risk: risk.risk_score || (isHeld ? 88.5 : 17.5),
        settlement_chain_id: 84532
      },
      output: {
        decision_id: dec.decision_id || 'dec_4f98c755',
        status: isHeld ? 'HELD' : 'APPROVED',
        tx_hash: dec.tx_hash || (isHeld ? null : '0xc834ac72031575438fd98a1b18666fe1952a748d74e8f5868a6702d7bcaa5c98'),
        blocked_unauthorized_spend: isHeld
      }
    }
  ];

  const currentSpan = spans.find((s) => s.id === selectedSpan) || spans[0];

  return (
    <div className="space-y-4 font-sans select-text">
      {/* Header Info Card */}
      <div className="bg-[#050505] border border-[#171717] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0e0e0e] border border-[#222222] flex items-center justify-center text-sky-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-2">
              <span>Trace: Multi-Agent Nexus Chain</span>
              <span className="font-mono text-[10px] text-zinc-500 font-normal">#{mandateId}</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Buyer: <span className="text-zinc-200">{agentName}</span> &bull; Latency: <span className="text-sky-400 font-bold">15.8ms</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-mono text-[11px]">Verdict:</span>
          <span
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
              isHeld
                ? 'bg-rose-950/60 text-rose-300 border-rose-900'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-900'
            }`}
          >
            {isHeld ? 'CIRCUIT BREAKER QUARANTINE' : 'SETTLED ON BASE SEPOLIA'}
          </span>
        </div>
      </div>

      {/* Main Execution Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Execution Waterfall Tree (5 cols) */}
        <div className="lg:col-span-5 bg-[#050505] border border-[#171717] rounded-xl p-3 flex flex-col space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1">
            Execution Tree (Google ADK Pipeline)
          </div>

          <div className="space-y-1">
            {spans.map((s, idx) => {
              const isSelected = selectedSpan === s.id;
              const isSpanHeld = s.status === 'HELD';
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSpan(s.id)}
                  className={`p-3 rounded-lg cursor-pointer transition flex items-center justify-between text-xs border ${
                    isSelected
                      ? 'bg-[#121212] border-[#2a2a2a] text-white'
                      : 'bg-[#080808] border-[#141414] text-zinc-400 hover:bg-[#0d0d0d] hover:border-[#222222]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    <span className="text-[10px] font-mono text-zinc-600">0{idx + 1}</span>
                    <div className="truncate">
                      <div className={`font-mono text-xs truncate ${isSelected ? 'text-sky-400 font-semibold' : 'text-zinc-300'}`}>
                        {s.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">{s.agent}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    <span className={isSelected ? 'text-white' : 'text-zinc-400'}>{s.duration}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSpanHeld ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Span Details & Raw Telemetry (7 cols) */}
        <div className="lg:col-span-7 bg-[#050505] border border-[#171717] rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#141414]">
            <div>
              <div className="text-xs font-mono font-bold text-white">{currentSpan.name}</div>
              <div className="text-[11px] text-zinc-500 font-mono">{currentSpan.type} &bull; {currentSpan.agent}</div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-zinc-500">Latency: </span>
              <span className="text-sky-400 font-bold">{currentSpan.duration}</span>
            </div>
          </div>

          {/* Input Telemetry JSON Block */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Input Telemetry
            </div>
            <pre className="p-3.5 bg-[#080808] border border-[#171717] rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto select-text leading-relaxed">
              {JSON.stringify(currentSpan.input, null, 2)}
            </pre>
          </div>

          {/* Output State JSON Block */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Output State & Governance Verdict
            </div>
            <pre className="p-3.5 bg-[#080808] border border-[#171717] rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto select-text leading-relaxed">
              {JSON.stringify(currentSpan.output, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
