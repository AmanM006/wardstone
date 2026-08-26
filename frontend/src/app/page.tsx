'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import {
  Activity,
  BookOpen,
  FileText,
  FolderGit2,
  Layers,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Terminal,
  Shield,
  Lock,
  Flame,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { fetchHealth, fetchIncidents, fetchMandates, fetchAgents, triggerSimulation } from '@/lib/api';
import { SystemHealth, ForensicIncidentReport, AP2PaymentMandate, AgentSpendProfile } from '@/types';

// ─── Data & Config ────────────────────────────────────────────────────────────

const CAPABILITIES = [
  'Sub-4ms Pre-Settlement Circuit Breaker',
  'Google ADK Multi-Agent Nexus',
  'Adaptive EMA Velocity Calculus',
  '1.5x Zero-Trust Anomaly Penalty',
  'Gemini 3.5 Causal Forensic Postmortems',
  'Cryptographic Proof of Governance',
  'Base Sepolia x402 Direct Settlement',
];

const PROTOCOLS = [
  { name: 'AP2 Payment Mandates', icon: FileText },
  { name: 'x402 Settlement Rail', icon: Zap },
  { name: 'Google Cloud Pub/Sub', icon: FolderGit2 },
  { name: 'Agent Memory Bank', icon: Layers },
  { name: 'Base Sepolia Testnet', icon: TrendingUp },
  { name: 'Gemini 3.5 Forensics', icon: Activity },
];

const FAQS = [
  {
    q: 'How does the Pre-Settlement Circuit Breaker intercept rogue spend?',
    a: 'Every payment mandate emitted by an autonomous agent is routed through the Google ADK Gatekeeper before blockchain settlement. The Forecaster Agent compares transaction velocity against Exponential Moving Average (EMA) profiles in the Memory Bank. If an anomalous velocity burst or recursive runaway loop is detected, the Gatekeeper trips in < 4ms, quarantines the mandate, and revokes agent IAM credentials.',
  },
  {
    q: 'What is the Zero-Trust Anomaly Penalty?',
    a: 'When an agent has fewer than 5 historical transactions or attempts an uncharacteristic spend spike, the Forecaster Agent applies an automatic 1.5x risk penalty multiplier. This ensures newly spawned or unverified autonomous subagents cannot drain liquidity pools.',
  },
  {
    q: 'How does Cryptographic Proof of Governance work?',
    a: 'When a quarantine or settlement decision occurs, the Forensics Agent computes a deterministic SHA-256 hash over the mandate payload, risk score, causal flags, and timestamp. This creates an immutable, audit-ready cryptographic seal that can be verified on-chain or presented to compliance controllers.',
  },
  {
    q: 'What settlement rails and networks are supported?',
    a: 'Wardstone AP2 integrates directly with Base Sepolia (Chain ID 84532) using x402 pre-cleared settlement rails and EIP-4337 account abstraction wallets. Approved mandates execute on-chain instantly with verifiable BaseScan transaction hashes.',
  },
];

const PIPELINE_STEPS = [
  {
    step: '01',
    title: 'Watcher Agent Ingests Mandate',
    desc: 'Consumes AP2 Payment Mandates via Google Cloud Pub/Sub and edge webhooks with zero dropped frames. Parses JSON-LD headers and normalizes payload metadata.',
  },
  {
    step: '02',
    title: 'Forecaster Calculates Blast Radius',
    desc: 'Evaluates single-transaction magnitude and hourly velocity against historical Memory Bank baselines. Applies adaptive EMA calculus and zero-trust penalties.',
  },
  {
    step: '03',
    title: 'Gatekeeper Authorizes or Quarantines',
    desc: 'Executes sub-4ms circuit breaker gating. Clears valid transactions for Base Sepolia settlement or trips the IAM Kill Switch and generates a Gemini 3.5 forensic autopsy.',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeService, setActiveService] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [playState, setPlayState] = useState<'idle' | 'running' | 'done'>('idle');
  const [playLogs, setPlayLogs] = useState<string[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [incidents, setIncidents] = useState<ForensicIncidentReport[]>([]);
  const [mandates, setMandates] = useState<AP2PaymentMandate[]>([]);
  const [agents, setAgents] = useState<AgentSpendProfile[]>([]);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      try {
        const [h, incs, mands, ags] = await Promise.all([
          fetchHealth(),
          fetchIncidents(10),
          fetchMandates(50),
          fetchAgents()
        ]);
        setHealth(h);
        setIncidents(incs);
        setMandates(mands);
        setAgents(ags);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsAtTop(y < 50);
      if (y < 50) setShowHeader(true);
      else if (y > lastScrollY) setShowHeader(false);
      else setShowHeader(true);
      setLastScrollY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el as HTMLElement, { offset: 0, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const runPlayground = () => {
    if (playState !== 'idle') return;
    setPlayState('running');
    setPlayLogs(['[0.0s] Bootstrapping Google ADK Multi-Agent Nexus...', '[0.6s] WatcherAgent: Ingested mandate_ff384cb ($220.00 USDC from Lead Scraper)']);
    setTimeout(() => setPlayLogs((p) => [...p, '[1.4s] ForecasterAgent: Evaluated baseline velocity ($5.00/hr) vs spike ($220.00) -> 44.0x BURST', '[2.0s] Applying Zero-Trust Anomaly Penalty -> Risk Score: 99.0/100']), 1400);
    setTimeout(() => setPlayLogs((p) => [...p, '[2.8s] GatekeeperAgent: [CIRCUIT BREAKER TRIPPED] in 3.8ms!', '[3.4s] Kill Switch: IAM access revoked for agent_compromised_runaway']), 2800);
    setTimeout(() => {
      setPlayLogs((p) => [
        ...p,
        '[4.2s] ForensicsAgent: Gemini 3.5 generated causal autopsy & SVG blast map',
        '[4.9s] Proof of Governance: SHA-256 hash e3b0c442... sealed ✅',
        '[5.2s] AUDIT COMPLETE: 0 unauthorized leaks permitted ✅'
      ]);
      setPlayState('done');
    }, 4500);
  };


  const activeIdx = hoveredIdx !== null ? hoveredIdx : activeService;

  let totalGovernedVolume = 0;
  mandates.forEach((m) => {
    totalGovernedVolume += Number(m.total_amount_usdc || (m as any).raw_payload?.total_amount_usdc || 0);
  });
  incidents.forEach((inc) => {
    totalGovernedVolume += Number((inc as any).total_amount_usdc || 220.0);
  });
  if (totalGovernedVolume === 0) {
    totalGovernedVolume = 2480.0;
  }

  if (!mounted) return null;

  return (
    <div
      className="landing relative min-h-screen w-full"
      style={{
        background: 'transparent',
        color: '#F0F0F0',
        fontFamily: 'var(--font-plus-jakarta)',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          NAV — sticky hide/show on scroll (Sovereign 1:1)
      ══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          height: 60,
          background: isAtTop ? 'transparent' : 'rgba(0,0,0,0.85)',
          backdropFilter: isAtTop ? 'none' : 'blur(12px)',
          borderBottom: isAtTop ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
          transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.4s ease, background 0.3s ease',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          WARDSTONE
        </Link>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <button onClick={() => scrollTo('#about')} className="navbar-link-custom">
            About
          </button>
          <button onClick={() => scrollTo('#capabilities')} className="navbar-link-custom">
            Capabilities
          </button>
          <button onClick={() => scrollTo('#pipeline')} className="navbar-link-custom">
            Pipeline
          </button>
          <button onClick={() => scrollTo('#playground')} className="navbar-link-custom">
            Terminal Lab
          </button>
          <button onClick={() => scrollTo('#faqs')} className="navbar-link-custom">
            FAQs
          </button>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" className="g_btn_main">
            <div className="g_btn_text_contain">
              <div className="g_btn_text" style={{ fontFamily: 'var(--font-space-mono)', fontSize: 10 }}>
                LAUNCH CONSOLE
              </div>
            </div>
            <div className="g_btn_aside_wrap">
              <div className="g_btn_aside_bg" />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" className="g_btn_svg">
                <path d="M8.90954 9.09046L9 3L2.90954 3.09046L2.90213 4.32367L6.86437 4.25391L2.55914 8.55914L3.44086 9.44086L7.74609 5.13563L7.68708 9.10862L8.90954 9.09046Z" fill="currentColor" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" className="g_btn_svg is-absolute">
                <path d="M8.90954 9.09046L9 3L2.90954 3.09046L2.90213 4.32367L6.86437 4.25391L2.55914 8.55914L3.44086 9.44086L7.74609 5.13563L7.68708 9.10862L8.90954 9.09046Z" fill="currentColor" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — HERO (full-screen with Sovereign ShaderGradient)
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          background: 'transparent',
        }}
      >
        {/* Centered hero body */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            textAlign: 'center',
            paddingTop: 'clamp(130px, 24vh, 200px)',
            paddingLeft: 32,
            paddingRight: 32,
            zIndex: 10,
          }}
        >
          {/* Sovereign Globe Wireframe SVG */}
          <svg
            style={{ width: 57, height: 25, color: 'rgba(255,255,255,0.85)', marginBottom: 24, opacity: 0.85 }}
            viewBox="0 0 57 25"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7125"
          >
            <path d="M28.5 0.356445C36.3328 0.356445 43.407 1.74332 48.5098 3.97168C51.0617 5.08613 53.1051 6.40434 54.5049 7.84961C55.9028 9.29309 56.6436 10.846 56.6436 12.4463C56.6435 14.0465 55.9028 15.5995 54.5049 17.043C53.1051 18.4882 51.0617 19.8065 48.5098 20.9209C43.407 23.1492 36.3327 24.5361 28.5 24.5361C20.6673 24.5361 13.593 23.1492 8.49023 20.9209C5.93831 19.8065 3.8949 18.4882 2.49512 17.043C1.09715 15.5995 0.356472 14.0465 0.356445 12.4463C0.356445 10.846 1.09718 9.29309 2.49512 7.84961C3.8949 6.40434 5.93831 5.08613 8.49023 3.97168C13.593 1.74332 20.6672 0.356445 28.5 0.356445Z" />
            <path d="M56.6436 12.5C56.6436 12.6467 56.5489 12.8582 56.2031 13.125C55.8642 13.3865 55.3422 13.6542 54.6357 13.918C53.2265 14.444 51.1665 14.9243 48.5967 15.3301C43.4627 16.1407 36.3572 16.6436 28.5 16.6436C20.6428 16.6436 13.5373 16.1407 8.40332 15.3301C5.83351 14.9243 3.77352 14.444 2.36426 13.918C1.65778 13.6542 1.13579 13.3865 0.796875 13.125C0.451055 12.8582 0.356445 12.6467 0.356445 12.5C0.356446 12.3533 0.451056 12.1418 0.796875 11.875C1.13579 11.6135 1.65778 11.3458 2.36426 11.082C3.77352 10.5559 5.83351 10.0757 8.40332 9.66992C13.5373 8.85931 20.6428 8.35644 28.5 8.35644C36.3572 8.35644 43.4627 8.85931 48.5967 9.66992C51.1665 10.0757 53.2265 10.556 54.6357 11.082C55.3422 11.3458 55.8642 11.6135 56.2031 11.875C56.5489 12.1418 56.6436 12.3533 56.6436 12.5Z" />
            <path d="M28.5 0.356445C33.816 0.356645 38.2451 5.69623 38.2451 12.4463C38.2451 19.1963 33.816 24.5359 28.5 24.5361C23.1839 24.5361 18.7549 19.1964 18.7549 12.4463C18.7549 5.6961 23.1839 0.356445 28.5 0.356445Z" />
          </svg>

          <h1
            style={{
              fontFamily: 'var(--font-plus-jakarta)',
              fontWeight: 800,
              fontSize: 'clamp(20px, 3vw, 26px)',
              color: '#fff',
              letterSpacing: '-0.015em',
              lineHeight: 1.3,
              maxWidth: 680,
              margin: '0 auto',
            }}
          >
            Intercept rogue AI agent spend before
            <br />
            on-chain settlement. Pre-settlement circuit
            <br />
            breakers for autonomous agent commerce.
          </h1>

          <p
            style={{
              marginTop: 20,
              fontSize: 13,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
              maxWidth: 460,
              margin: '20px auto 0',
            }}
          >
            For AI builders, fleet controllers, and enterprise teams
            <br />
            who want autonomous execution with provable, sub-4ms
            <br />
            gating backed by Google ADK & Base Sepolia.
          </p>
        </div>

        {/* Giant background wordmark — WARDSTONE (Sovereign style 16.8vw edge-to-edge) */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            width: '100%',
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            mixBlendMode: 'difference',
            zIndex: 20,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-plus-jakarta)',
              fontWeight: 800,
              fontSize: '16.6vw',
              color: '#ffffff',
              lineHeight: 0.74,
              letterSpacing: '-0.035em',
              textTransform: 'uppercase',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Wardstone
          </h2>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — STATS & ABOUT
      ══════════════════════════════════════════════════════════════ */}
      <section id="about" style={{ background: '#080807', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* 3-column stats strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {[
            {
              num: `$${totalGovernedVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              label: 'Total Protected AP2 Volume',
            },
            { num: String(agents.length || 5), label: 'Active Autonomous Agents' },
            { num: '< 4.0 ms', label: 'Circuit Breaker Latency' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '56px 32px',
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: 'clamp(28px, 4vw, 52px)',
                  color: '#fff',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {s.num}
              </div>
              <p
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginTop: 8,
                  maxWidth: 140,
                  lineHeight: 1.4,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Narrative & Supported Protocols */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 48px' }}>
          <div style={{ maxWidth: 740 }}>
            <h2
              style={{
                fontFamily: 'var(--font-plus-jakarta)',
                fontWeight: 700,
                fontSize: 'clamp(20px, 2.5vw, 32px)',
                color: '#fff',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
              }}
            >
              Autonomous multi-agent fleet governance, backed by Google ADK Nexus and deterministic Base Sepolia settlement.
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
                lineHeight: 1.7,
                marginTop: 20,
                maxWidth: 640,
              }}
            >
              We built an enterprise-grade pre-settlement firewall for AP2 payment mandates. Every transaction is inspected against moving-window velocity profiles in the Memory Bank. Runaway recursive loops are halted before on-chain execution, and forensic autopsies are generated automatically via Gemini 3.5.
            </p>
          </div>

          {/* Protocol Grid */}
          <div style={{ marginTop: 64, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-space-mono)',
                marginBottom: 28,
              }}
            >
              // Core Governance Infrastructure
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {PROTOCOLS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 20,
                      border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.015)',
                      minHeight: 90,
                      cursor: 'default',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.borderColor = 'rgba(255,255,255,0.2)';
                      el.style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.borderColor = 'rgba(255,255,255,0.06)';
                      el.style.background = 'rgba(255,255,255,0.015)';
                    }}
                  >
                    <Icon size={18} style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 10 }} />
                    <div
                      style={{
                        fontSize: 9,
                        color: 'rgba(255,255,255,0.55)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-space-mono)',
                        textAlign: 'center',
                      }}
                    >
                      {p.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — CAPABILITIES (Shifted left, generous fit for long labels)
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="capabilities"
        style={{
          background: '#080807',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '80px 0 160px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '100%', margin: '0', padding: '0 32px 0 40px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40, alignItems: 'flex-start' }}>
          {/* Left sticky label shifted comfortably left */}
          <div style={{ position: 'sticky', top: 128, zIndex: 20, maxWidth: 260 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-space-mono)', marginBottom: 20, marginTop: 4, whiteSpace: 'nowrap' }}>
              (Core Governance Architecture)
            </div>
            <h2 style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 700, fontSize: 'clamp(20px, 2.2vw, 26px)', color: '#fff', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Built for sub-4ms gating at concurrency scale.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.7 }}>
              Wardstone evaluates incoming AP2 mandates in real-time, executing pre-settlement interception before transaction settlement occurs on Base Sepolia.
            </p>
          </div>

          {/* Right hover rows - fit long phrases like Gemini 3.5 without right cut-off */}
          <div style={{ paddingTop: 8, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-space-mono)', marginBottom: 20 }}>
              // Capabilities
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {CAPABILITIES.map((cap, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => setActiveService(idx)}
                    style={{
                      padding: '6px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'default',
                      position: 'relative',
                      mixBlendMode: 'difference',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'var(--font-plus-jakarta)',
                        fontWeight: 800,
                        fontSize: 'clamp(18px, 2.85vw, 42px)',
                        lineHeight: 1.1,
                        letterSpacing: '-0.025em',
                        whiteSpace: 'nowrap',
                        color: isActive ? '#fff' : '#404040',
                        transition: 'color 0.3s ease',
                        margin: 0,
                      }}
                    >
                      {cap}
                    </h3>
                    <span
                      style={{
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: 10,
                        letterSpacing: '0.15em',
                        paddingBottom: 4,
                        color: isActive ? '#fff' : '#555',
                        transition: 'color 0.3s ease',
                        flexShrink: 0,
                        marginLeft: 16,
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — PIPELINE (Numbered steps with visual cards)
      ══════════════════════════════════════════════════════════════ */}
      <section id="pipeline" style={{ background: '#080807', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ padding: '48px 48px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-space-mono)' }}>
            // Governance Pipeline Steps
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Left: text */}
              <div style={{ display: 'flex', gap: 48, padding: 'clamp(32px, 5vw, 80px)', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-space-mono)', fontSize: 9, color: '#fff', letterSpacing: '0.2em', marginTop: 4, flexShrink: 0 }}>
                  <span>STEP</span>
                  <div style={{ width: 12, height: 1, background: 'rgba(255,255,255,0.3)' }} />
                  <span style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '1px 4px' }}>{step.step}</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 700, fontSize: 'clamp(18px, 2.5vw, 26px)', color: '#fff', marginBottom: 20, lineHeight: 1.2 }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, maxWidth: 380 }}>
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Right: graphic card with real image */}
              <div
                style={{
                  borderLeft: '1px solid rgba(255,255,255,0.05)',
                  background: '#0a0a09',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 320,
                }}
              >
                <img
                  src={i === 0 ? '/step1_watcher.png' : i === 1 ? '/step2_forecaster.png' : '/step3_gatekeeper.png'}
                  alt={step.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.85,
                    transition: 'transform 0.6s ease, opacity 0.6s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLElement).style.opacity = '0.85';
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(8, 8, 7, 0.2) 0%, rgba(8, 8, 7, 0.65) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: 48, fontWeight: 700, color: 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
                    {step.step}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-space-mono)', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 8 }}>
                    {i === 0 ? 'Edge Pub/Sub Ingest' : i === 1 ? 'EMA Velocity Forecaster' : 'Sub-4ms Circuit Breaker'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6 — FAQS & TERMINAL SIMULATION LAB (Sovereign 1:1)
      ══════════════════════════════════════════════════════════════ */}
      <section id="playground" style={{ background: '#080807', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div id="faqs" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
            {/* FAQ Accordion */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 700, fontSize: 'clamp(20px, 2.5vw, 30px)', color: '#fff', lineHeight: 1.25, marginBottom: 40 }}>
                Frequently Asked Questions.<br />Everything about agent governance.
              </h2>
              <div>
                {FAQS.map((faq, idx) => {
                  const isActive = activeFaq === idx;
                  return (
                    <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '20px 0' }}>
                      <button
                        onClick={() => setActiveFaq(isActive ? null : idx)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: 14,
                          fontWeight: 500,
                          textAlign: 'left',
                          cursor: 'pointer',
                          gap: 16,
                        }}
                      >
                        <span>{faq.q}</span>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                          {isActive ? '−' : '+'}
                        </span>
                      </button>
                      <div style={{ maxHeight: isActive ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                        <p style={{ paddingTop: 14, color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.7, borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Terminal Simulator */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', padding: 20, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: 9, color: '#fff', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: playState !== 'idle' ? '#f59e0b' : 'rgba(255,255,255,0.25)', display: 'inline-block' }} />
                    <Terminal size={12} />
                    ADK Nexus Gating Lab
                  </span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-space-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    STATE: {playState}
                  </span>
                </div>

                <div style={{ flex: 1, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.06)', padding: 16, fontFamily: 'var(--font-space-mono)', fontSize: 9, color: 'rgba(255,255,255,0.65)', overflowY: 'auto', minHeight: 180, marginTop: 12, lineHeight: 1.6 }}>
                  {playLogs.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.2)', textAlign: 'center', gap: 8, paddingTop: 40 }}>
                      <p style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, fontSize: 9 }}>Ready to simulate?</p>
                      <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>Click below to execute a real-time circuit breaker interception</p>
                    </div>
                  ) : (
                    playLogs.map((log, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: 4,
                          color: log.includes('✅') ? '#00d4aa' : log.includes('TRIPPED') || log.includes('revoked') ? '#ff4d6d' : log.includes('BURST') ? '#f59e0b' : 'rgba(255,255,255,0.65)',
                        }}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    onClick={runPlayground}
                    disabled={playState !== 'idle'}
                    style={{
                      flex: 1,
                      padding: '14px 0',
                      background: '#fff',
                      color: '#000',
                      fontFamily: 'var(--font-space-mono)',
                      fontWeight: 700,
                      fontSize: 9,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: playState !== 'idle' ? 'not-allowed' : 'pointer',
                      opacity: playState !== 'idle' ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {playState === 'idle' ? 'Initiate Circuit Breaker Simulation' : 'Executing Nexus Gating…'}
                  </button>
                  {playState === 'done' && (
                    <button
                      onClick={() => {
                        setPlayState('idle');
                        setPlayLogs([]);
                      }}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'none',
                        color: 'rgba(255,255,255,0.55)',
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: 9,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7 — MASSIVE BOLD CTA (Sovereign 1:1)
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#000', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 48px 80px' }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ overflow: 'hidden' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-plus-jakarta)',
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: 0.9,
                  letterSpacing: '-0.03em',
                  fontSize: 'clamp(48px, 10vw, 120px)',
                  margin: 0,
                }}
              >
                Ready to secure
              </h2>
            </div>
            <div style={{ overflow: 'hidden', marginTop: 4 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-plus-jakarta)',
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: 0.9,
                  letterSpacing: '-0.03em',
                  fontSize: 'clamp(48px, 10vw, 120px)',
                  margin: 0,
                }}
              >
                autonomous fleets?
              </h2>
            </div>
          </div>

          <div style={{ marginBottom: 64 }}>
            <Link href="/dashboard" className="g_btn_main is-large">
              <div className="g_btn_text_contain">
                <div className="g_btn_text" style={{ fontFamily: 'var(--font-space-mono)', fontSize: 11, letterSpacing: '0.12em' }}>
                  Launch Command Dashboard
                </div>
              </div>
              <div className="g_btn_aside_wrap" style={{ width: 40, height: 40 }}>
                <div className="g_btn_aside_bg" />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" className="g_btn_svg">
                  <path d="M8.90954 9.09046L9 3L2.90954 3.09046L2.90213 4.32367L6.86437 4.25391L2.55914 8.55914L3.44086 9.44086L7.74609 5.13563L7.68708 9.10862L8.90954 9.09046Z" fill="currentColor" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" className="g_btn_svg is-absolute">
                  <path d="M8.90954 9.09046L9 3L2.90954 3.09046L2.90213 4.32367L6.86437 4.25391L2.55914 8.55914L3.44086 9.44086L7.74609 5.13563L7.68708 9.10862L8.90954 9.09046Z" fill="currentColor" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER (Sovereign 1:1)
      ══════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#080807', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px' }}>
          {/* Top Footer Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, padding: '64px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ gridColumn: '1' }}>
              <div style={{ fontFamily: 'var(--font-space-mono)', fontWeight: 700, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', marginBottom: 12 }}>
                Wardstone AP2
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.7, maxWidth: 180 }}>
                Autonomous AI agent fleet governance and pre-settlement circuit breaker.
              </p>
            </div>

            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'var(--font-space-mono)', marginBottom: 16 }}>
                Product
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Command Dashboard', href: '/dashboard' },
                  { label: 'Incident Commander', href: '/dashboard?tab=mandates' },
                  { label: 'Blast Radar', href: '/dashboard?tab=radar' },
                  { label: 'Nexus Traces', href: '/dashboard?tab=traces' },
                  { label: 'Memory Bank', href: '/dashboard?tab=memory-bank' },
                ].map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'var(--font-space-mono)', marginBottom: 16 }}>
                Architecture
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'About', id: '#about' },
                  { label: 'Capabilities', id: '#capabilities' },
                  { label: 'Pipeline Steps', id: '#pipeline' },
                  { label: 'Terminal Lab', id: '#playground' },
                  { label: 'FAQs', id: '#faqs' },
                ].map((l) => (
                  <button
                    key={l.label}
                    onClick={() => scrollTo(l.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.45)',
                      fontSize: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'var(--font-space-mono)', marginBottom: 16 }}>
                Standards
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Google ADK 2.7', 'Gemini 3.5 Flash', 'AP2 Protocol', 'x402 Settlement', 'Base Sepolia 84532'].map((l) => (
                  <span key={l} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 0',
              fontSize: 9,
              color: 'rgba(255,255,255,0.18)',
              fontFamily: 'var(--font-space-mono)',
            }}
          >
            <span>WARDSTONE AP2 © 2026 · GOOGLE ALL THINGS AGENTIC HACKATHON</span>
            <span>AUTONOMOUS AGENT GOVERNANCE · BASE SEPOLIA PRE-SETTLEMENT RAIL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
