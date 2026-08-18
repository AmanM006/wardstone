'use client';

import React, { useState } from 'react';
import { AgentSpendProfile } from '@/types';
import { X, Shield, Plus, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Network } from 'lucide-react';

interface FleetOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (newAgent: AgentSpendProfile) => void;
}

export const FleetOnboardingModal: React.FC<FleetOnboardingModalProps> = ({
  isOpen,
  onClose,
  onAddAgent
}) => {
  const [step, setStep] = useState<number>(1);
  const [agentName, setAgentName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [hourlyVelocity, setHourlyVelocity] = useState('20.0');
  const [maxSingleMandate, setMaxSingleMandate] = useState('40.0');
  const [capabilities, setCapabilities] = useState<string[]>(['inference', 'vector_search']);
  const [serviceAccount, setServiceAccount] = useState('agent-runner@wardstone-ap2.iam.gserviceaccount.com');
  const [isProvisioning, setIsProvisioning] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setAgentName(val);
    setAgentId(val.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  };

  const toggleCapability = (cap: string) => {
    if (capabilities.includes(cap)) {
      setCapabilities(capabilities.filter((c) => c !== cap));
    } else {
      setCapabilities([...capabilities, cap]);
    }
  };

  const handleCompleteOnboarding = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      const newProfile: AgentSpendProfile = {
        agent_id: agentId || `agent_${Date.now()}`,
        agent_name: agentName || 'Autonomous Micro-Agent',
        baseline_hourly_velocity: Number(hourlyVelocity) || 20.0,
        max_single_mandate: Number(maxSingleMandate) || 40.0,
        historical_mandates_count: 0,
        total_settled_usdc: 0.0,
        reputation_score: 95.0
      };
      onAddAgent(newProfile);
      setIsProvisioning(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans select-text">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Provision New Agent Fleet Cluster</h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Step {step} of 3 &bull; Google ADK & AP2 Protocol Onboarding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-[#141414] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Steps */}
        <div className="p-6 space-y-5">
          {/* Step 1: Persona & Identity */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Agent Fleet Persona Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Scraping Worker"
                  value={agentName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1f1f1f] rounded-lg text-white text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Agent ID (Deterministic URI):</label>
                <input
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1f1f1f] rounded-lg text-zinc-300 font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Google Cloud IAM Service Account:</label>
                <input
                  type="text"
                  value={serviceAccount}
                  onChange={(e) => setServiceAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#1f1f1f] rounded-lg text-zinc-300 font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Memory Bank Spending Policy */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#050505] border border-[#171717] rounded-xl text-zinc-400 text-xs leading-relaxed">
                Configure the baseline velocity window in the <strong>Agent Engine Memory Bank</strong>. Exceeding these limits trips the 3.8ms Circuit Breaker.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Baseline Spend Velocity ($/hr):</label>
                  <input
                    type="number"
                    value={hourlyVelocity}
                    onChange={(e) => setHourlyVelocity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050505] border border-[#1f1f1f] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Max Single Mandate ($ USDC):</label>
                  <input
                    type="number"
                    value={maxSingleMandate}
                    onChange={(e) => setMaxSingleMandate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050505] border border-[#1f1f1f] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: AP2 Capabilities & Confirmation */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-2">Declared Protocol Capabilities:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'inference', label: 'LLM Model Inference' },
                    { id: 'vector_search', label: 'Vector DB Compute' },
                    { id: 'batch_scraping', label: 'Autonomous Web Scraping' },
                    { id: 'index_refresh', label: 'Knowledge Graph Indexer' }
                  ].map((cap) => (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => toggleCapability(cap.id)}
                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                        capabilities.includes(cap.id)
                          ? 'bg-[#181818] border-sky-500 text-white font-medium'
                          : 'bg-[#050505] border-[#1f1f1f] text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span>{cap.label}</span>
                      {capabilities.includes(cap.id) && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#050505] border border-[#171717] rounded-xl font-mono text-[11px] space-y-1 text-zinc-400">
                <div className="text-white font-bold">Onboarding Summary:</div>
                <div><strong>Persona:</strong> {agentName || 'Default Agent'}</div>
                <div><strong>Hourly Limit:</strong> ${hourlyVelocity}/hr</div>
                <div><strong>Max Mandate:</strong> ${maxSingleMandate} USDC</div>
                <div><strong>Rail:</strong> Base Sepolia (x402 Facilitator)</div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] text-zinc-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isProvisioning || !agentName.trim()}
                onClick={handleCompleteOnboarding}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow disabled:opacity-40"
              >
                {isProvisioning ? 'Syncing to Memory Bank...' : 'Deploy Fleet Cluster'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
