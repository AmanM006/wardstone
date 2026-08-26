'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Lenis from 'lenis';
import { VercelSidebar } from '@/components/VercelSidebar';
import { VercelHeader } from '@/components/VercelHeader';
import { VercelOverview } from '@/components/VercelOverview';
import { DatadogIncidentPanel } from '@/components/DatadogIncidentPanel';
import { VelocityRiskChart } from '@/components/VelocityRiskChart';
import { NexusTopologyMap } from '@/components/NexusTopologyMap';
import { TraceWaterfall } from '@/components/TraceWaterfall';
import { PreClearanceModal } from '@/components/PreClearanceModal';
import { AgentCardModal } from '@/components/AgentCardModal';
import { SkeletonDashboard } from '@/components/SkeletonDashboard';
import { TopologyModal } from '@/components/TopologyModal';
import { FleetDetailModal } from '@/components/FleetDetailModal';
import { FleetOnboardingModal } from '@/components/FleetOnboardingModal';

import {
  fetchHealth,
  fetchAgents,
  fetchMandates,
  fetchIncidents,
  fetchAgentCard,
  triggerSimulation
} from '@/lib/api';

import {
  SystemHealth,
  AgentSpendProfile,
  AP2PaymentMandate,
  ForensicIncidentReport
} from '@/types';
import { Plus, Sliders, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [agents, setAgents] = useState<AgentSpendProfile[]>([]);
  const [mandates, setMandates] = useState<AP2PaymentMandate[]>([]);
  const [incidents, setIncidents] = useState<ForensicIncidentReport[]>([]);
  const [agentCard, setAgentCard] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selected items for Modals & Drawers
  const [selectedMandate, setSelectedMandate] = useState<AP2PaymentMandate | null>(null);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<AgentSpendProfile | null>(null);

  // Modals
  const [isPreClearanceOpen, setIsPreClearanceOpen] = useState(false);
  const [isAgentCardOpen, setIsAgentCardOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedTopologyIncident, setSelectedTopologyIncident] = useState<ForensicIncidentReport | null>(null);

  // Main scroll container ref for Lenis
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Sync with browser pathname / search params
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'mandates') setActiveTab('MANDATES');
      else if (tab === 'radar') setActiveTab('RADAR');
      else if (tab === 'traces') setActiveTab('TRACES');
      else if (tab === 'memory-bank') setActiveTab('MEMORY_BANK');
      else setActiveTab('OVERVIEW');
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize Lenis smooth scrolling for main content
  useEffect(() => {
    if (!mainScrollRef.current) return;

    const lenis = new Lenis({
      wrapper: mainScrollRef.current,
      content: mainScrollRef.current.firstElementChild as HTMLElement,
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [activeTab]);

  const refreshAll = useCallback(async () => {
    try {
      const [h, a, m, inc] = await Promise.all([
        fetchHealth(),
        fetchAgents(),
        fetchMandates(60),
        fetchIncidents(35)
      ]);

      if (h) setHealth(h);
      if (a) setAgents(a);
      if (m) {
        setMandates(m);
        if (!selectedMandate && m.length > 0) {
          setSelectedMandate(m[0]);
        }
      }
      if (inc) setIncidents(inc);
      setIsLoading(false);
    } catch (err) {
      console.error('Error updating live telemetry:', err);
      setIsLoading(false);
    }
  }, [selectedMandate]);

  useEffect(() => {
    refreshAll();
    fetchAgentCard().then((card) => {
      if (card) setAgentCard(card);
    });

    const interval = setInterval(refreshAll, 3500);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const handleTriggerSimulation = async (scenario: string) => {
    try {
      setLoadingScenario(scenario);
      const result = await triggerSimulation(scenario);
      await refreshAll();
      // Show toast and navigate to mandates so user sees the new mandate
      const isRogue = result.risk_score >= 60;
      setToast({
        type: isRogue ? 'error' : 'success',
        message: isRogue
          ? `🚨 Circuit Breaker TRIGGERED — ${result.buyer_agent} tried $${result.amount_usdc} USDC (Risk: ${result.risk_score}/100)`
          : `✅ Mandate settled — ${result.buyer_agent}: $${result.amount_usdc} USDC (Risk: ${result.risk_score}/100)`,
      });
      setTimeout(() => setToast(null), 6000);
      // Navigate to mandates tab so they see the new entry
      handleNavigate('MANDATES', 'mandates');
    } catch (err: any) {
      setToast({ type: 'error', message: `Simulation failed: ${err.message}` });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoadingScenario(null);
    }
  };

  // Facet Counts
  const highCount = useMemo(() => {
    return mandates.filter((m) => {
      const dec: any = m.governance_decision || {};
      const score = m.risk_analysis?.risk_score || 0;
      return m.status === 'HELD' || dec.status === 'HELD' || score >= 60;
    }).length;
  }, [mandates]);

  const handleNavigate = (tab: string, param: string) => {
    setActiveTab(tab);
    const newUrl = param ? `/dashboard?tab=${param}` : '/dashboard';
    window.history.pushState(null, '', newUrl);
  };

  const handleUpdatePolicy = (agentId: string, velocity: number, maxMandate: number) => {
    setAgents(
      agents.map((ag) =>
        ag.agent_id === agentId
          ? { ...ag, baseline_hourly_velocity: velocity, max_single_mandate: maxMandate }
          : ag
      )
    );
  };

  const handleAddAgent = (newAgent: AgentSpendProfile) => {
    setAgents([...agents, newAgent]);
  };

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#ededed] flex overflow-hidden font-sans select-text">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] max-w-md px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'success'
            ? 'bg-[#0a1f0f] border-emerald-800 text-emerald-300'
            : 'bg-[#1f0a0a] border-rose-800 text-rose-300'
        }`}>
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-zinc-500 hover:text-white mt-0.5">✕</button>
        </div>
      )}
      {/* 1. Wardstone Left Sidebar */}
      <VercelSidebar
        activeTab={activeTab}
        setActiveTab={(t) => {
          const map: Record<string, string> = {
            OVERVIEW: '',
            MANDATES: 'mandates',
            RADAR: 'radar',
            TRACES: 'traces',
            MEMORY_BANK: 'memory-bank'
          };
          handleNavigate(t, map[t] || '');
        }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        highCount={highCount}
        totalCount={mandates.length}
        incidents={incidents}
        mandates={mandates}
      />

      {/* 2. Main Workspace (h-full flex flex-col overflow-hidden) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#000000] min-w-0">
        {/* Single Header with Simulation Controls */}
        <VercelHeader
          health={health}
          onOpenPreClearance={() => setIsPreClearanceOpen(true)}
          onOpenAgentCard={() => setIsAgentCardOpen(true)}
          onTriggerSimulation={handleTriggerSimulation}
          loadingScenario={loadingScenario}
        />

        {/* View 1: Overview (Executive Control Plane) */}
        {activeTab === 'OVERVIEW' && (
          <div ref={mainScrollRef} className="flex-1 h-full overflow-y-auto">
            <div>
              <VercelOverview
                mandates={mandates}
                incidents={incidents}
                agents={agents}
                health={health}
                onSelectMandate={(m) => {
                  setSelectedMandate(m);
                  handleNavigate('MANDATES', 'mandates');
                }}
                onNavigateTab={(t) => {
                  const map: Record<string, string> = {
                    OVERVIEW: '',
                    MANDATES: 'mandates',
                    RADAR: 'radar',
                    TRACES: 'traces',
                    MEMORY_BANK: 'memory-bank'
                  };
                  handleNavigate(t, map[t] || '');
                }}
              />
            </div>
          </div>
        )}

        {/* View 2: Mandates & Datadog Incident Response Panel */}
        {activeTab === 'MANDATES' && (
          <div className="flex-1 h-full overflow-hidden flex flex-col">
            <DatadogIncidentPanel
              mandates={mandates}
              incidents={incidents}
              selectedMandate={selectedMandate}
              onSelectMandate={(m) => setSelectedMandate(m)}
              onOpenTopology={(inc) => setSelectedTopologyIncident(inc)}
            />
          </div>
        )}

        {/* View 3: Blast Radar & Predictive Analytics Waves (Vercel Screenshot 3) */}
        {activeTab === 'RADAR' && (
          <div ref={mainScrollRef} className="flex-1 h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Predictive Blast-Radius Radar & Spend Velocity Waves
              </div>
              <VelocityRiskChart mandates={mandates} incidents={incidents} />
              <NexusTopologyMap />
            </div>
          </div>
        )}

        {/* View 4: Multi-Agent Nexus Traces (Google ADK DAG) */}
        {activeTab === 'TRACES' && (
          <div ref={mainScrollRef} className="flex-1 h-full overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Google ADK Multi-Agent Nexus Execution Tree
              </div>
              <TraceWaterfall mandate={selectedMandate || (mandates.length > 0 ? mandates[0] : null)} />
            </div>
          </div>
        )}

        {/* View 5: Memory Bank Baseline Profiles & Interactive Fleet Management */}
        {activeTab === 'MEMORY_BANK' && (
          <div ref={mainScrollRef} className="flex-1 h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white tracking-tight">
                    Agent Engine Memory Bank Profiles
                  </div>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">
                    Continuous spend baselines & moving window velocity profiles
                  </div>
                </div>

                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard New Fleet</span>
                </button>
              </div>

              {/* Grid of Agent Fleets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {agents.map((ag) => (
                  <div
                    key={ag.agent_id}
                    onClick={() => setSelectedAgentDetail(ag)}
                    className="bg-[#050505] border border-[#171717] hover:border-[#2a2a2a] rounded-xl p-5 shadow cursor-pointer transition space-y-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-mono group-hover:text-sky-400 transition">
                        {ag.agent_name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                        Score: {ag.reputation_score}/100
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 font-mono">ID: {ag.agent_id}</div>

                    <div className="border-t border-[#141414] pt-3 space-y-1.5 text-xs text-zinc-400 font-mono">
                      <div className="flex justify-between">
                        <span>Baseline Velocity:</span>
                        <span className="text-sky-400 font-bold">${ag.baseline_hourly_velocity}/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Single Mandate:</span>
                        <span className="text-white font-bold">${ag.max_single_mandate} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Settled:</span>
                        <span className="text-emerald-400 font-bold">${ag.total_settled_usdc} USDC</span>
                      </div>
                    </div>

                    <div className="border-t border-[#141414] pt-2 flex items-center justify-between text-[11px] text-zinc-500 group-hover:text-zinc-300 transition">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-sky-400" />
                        <span>Inspect & Edit Policy</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Modals */}
      <FleetDetailModal
        agent={selectedAgentDetail}
        mandates={mandates}
        onClose={() => setSelectedAgentDetail(null)}
        onUpdatePolicy={handleUpdatePolicy}
      />

      <FleetOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onAddAgent={handleAddAgent}
      />

      <PreClearanceModal
        isOpen={isPreClearanceOpen}
        onClose={() => setIsPreClearanceOpen(false)}
        agents={agents}
      />

      <AgentCardModal
        isOpen={isAgentCardOpen}
        onClose={() => setIsAgentCardOpen(false)}
        cardData={agentCard}
      />

      <TopologyModal
        incident={selectedTopologyIncident}
        onClose={() => setSelectedTopologyIncident(null)}
      />
    </div>
  );
}
