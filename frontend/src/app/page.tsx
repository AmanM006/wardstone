'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Zap,
  Lock,
  Activity,
  Cpu,
  Terminal,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Flame,
  Radio,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed] font-sans selection:bg-sky-500/20 selection:text-sky-300">
      {/* 1. Navigation Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#151515] px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              WARDSTONE <span className="text-sky-400 font-mono text-xs">AP2</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
            <a href="#architecture" className="hover:text-white transition">Architecture</a>
            <a href="#circuit-breaker" className="hover:text-white transition">Circuit Breaker</a>
            <a href="#adk" className="hover:text-white transition">Google ADK 2.7</a>
            <a href="#base-sepolia" className="hover:text-white transition">Base Sepolia</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://sepolia.basescan.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] hover:bg-[#141414] text-zinc-400 hover:text-white rounded-md border border-[#1f1f1f] text-xs font-mono transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chain ID: 84532</span>
          </a>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-md text-xs font-semibold transition shadow-md"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Subtle Radial Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d0d0d] border border-[#222222] text-xs text-zinc-300 mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium">Google All Things Agentic Hackathon 2026</span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-sky-400 font-mono text-[11px]">ADK 2.7</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.08]">
          Autonomous Agent Governance & Pre-Settlement Circuit Breaker
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Wardstone intercepts anomalous AI spend before settlement on Base Sepolia.
          Powered by <strong>Google ADK Multi-Agent Nexus</strong>, <strong>Gemini 3.5 Flash Causal Forensics</strong>, and <strong>Agent Engine Memory Bank</strong>.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-semibold transition shadow-lg"
          >
            <span>Open Command Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard?tab=traces"
            className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] hover:bg-[#141414] text-zinc-300 hover:text-white rounded-lg border border-[#222222] text-sm font-medium transition shadow-sm"
          >
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Explore ADK Traces</span>
          </Link>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-4 bg-[#050505] border border-[#171717] rounded-xl">
            <div className="text-[11px] font-mono uppercase text-zinc-500">Circuit Breaker Gating</div>
            <div className="text-2xl font-mono font-bold text-sky-400 mt-1">3.8 ms</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Pre-Settlement Interception</div>
          </div>
          <div className="p-4 bg-[#050505] border border-[#171717] rounded-xl">
            <div className="text-[11px] font-mono uppercase text-zinc-500">Settlement Rail</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">Base Sepolia</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Chain ID: 84532 (x402)</div>
          </div>
          <div className="p-4 bg-[#050505] border border-[#171717] rounded-xl">
            <div className="text-[11px] font-mono uppercase text-zinc-500">Unauthorized Spends</div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">$0.00 (0 Leaks)</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">100% Security Protection</div>
          </div>
          <div className="p-4 bg-[#050505] border border-[#171717] rounded-xl">
            <div className="text-[11px] font-mono uppercase text-zinc-500">Forensics Engine</div>
            <div className="text-2xl font-mono font-bold text-purple-400 mt-1">Gemini 3.5</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Flash Causal Autopsies</div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Console Mockup */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="bg-[#050505] border border-[#1f1f1f] rounded-2xl p-2 shadow-2xl overflow-hidden relative group">
          <div className="p-3 bg-[#0a0a0a] border-b border-[#171717] flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#222222]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#222222]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#222222]" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">wardstone-ap2.internal &bull; Live Control Plane</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Base Sepolia Block #45616235</span>
            </div>
          </div>

          <div className="p-6 bg-[#000000] grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#050505] border border-[#171717] rounded-xl space-y-2">
              <div className="text-xs font-semibold text-white">Rogue Spend Intercepted</div>
              <div className="text-xl font-mono text-rose-400 font-bold">$220.00 USDC</div>
              <div className="text-[11px] text-zinc-400">Circuit Breaker quarantined runaway lead scraper before Base Sepolia wallet transfer.</div>
            </div>

            <div className="p-4 bg-[#050505] border border-[#171717] rounded-xl space-y-2">
              <div className="text-xs font-semibold text-white">Gemini 3.5 Causal Autopsy</div>
              <div className="text-xs font-mono text-purple-300">Runaway pagination loop</div>
              <div className="text-[11px] text-zinc-400">Automated root-cause analysis generated with remediation recommendation.</div>
            </div>

            <div className="p-4 bg-[#050505] border border-[#171717] rounded-xl space-y-2">
              <div className="text-xs font-semibold text-white">Agent Engine Memory Bank</div>
              <div className="text-xl font-mono text-sky-400 font-bold">$15.00/hr Baseline</div>
              <div className="text-[11px] text-zinc-400">Moving window historical spend profiles and dynamic reputation scoring.</div>
            </div>
          </div>

          <div className="p-4 bg-[#080808] border-t border-[#171717] text-center">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center justify-center gap-1"
            >
              <span>Enter Interactive Command Dashboard &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Core Pillars Architecture */}
      <section id="architecture" className="px-6 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            The Multi-Agent Governance Architecture
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Built from first principles for autonomous agent fleets transacting via AP2 mandates and x402 settlement rails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 bg-[#050505] border border-[#171717] rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Watcher Agent</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Consumes AP2 Payment Mandates via Google Cloud Pub/Sub and edge endpoints with zero dropped frames.
            </p>
          </div>

          <div className="p-6 bg-[#050505] border border-[#171717] rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Forecaster Agent</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Calculates 0-100 blast radius risk against historical velocity profiles in the Agent Engine Memory Bank.
            </p>
          </div>

          <div className="p-6 bg-[#050505] border border-[#171717] rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Gatekeeper Agent</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sub-4ms Pre-Settlement Circuit Breaker. Authorizes Base Sepolia execution or isolates anomalous spends.
            </p>
          </div>

          <div className="p-6 bg-[#050505] border border-[#171717] rounded-2xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">Gemini 3.5 Forensics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generates causal autopsies and Imagen 3 topological blast maps when quarantine events trigger.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-[#151515] px-6 py-10 max-w-6xl mx-auto flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-4">
        <div>
          <span className="font-semibold text-white">Wardstone AP2</span> &bull; Google All Things Agentic Hackathon 2026
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <a href="https://sepolia.basescan.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1">
            <span>BaseScan</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://cloud.google.com/run" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
            Google Cloud Run
          </a>
        </div>
      </footer>
    </div>
  );
}
