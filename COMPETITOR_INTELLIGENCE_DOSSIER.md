# 🕵️ COMPETITOR INTELLIGENCE DOSSIER
## Google All Things Agentic Hackathon (2026)
### Comprehensive Analysis of Top Competitor Repositories, Architectures, and Wardstone AP2 Strategy

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Hackathon Landscape](#1-executive-summary--hackathon-landscape)
2. [Master Index of Submissions & Repositories](#2-master-index-of-submissions--repositories)
3. [Deep-Dive Repository Deconstructions](#3-deep-dive-repository-deconstructions)
   - [3.1 samadon1/warden — Fleet Guardian & Policy Ledger](#31-samadon1warden--fleet-guardian--policy-ledger)
   - [3.2 fpachisa/nav-sentinel — Governed Fund-Accounting Fleet](#32-fpachisanav-sentinel--governed-fund-accounting-fleet)
   - [3.3 sodiq-code/denialdefender — Evidence-Grounded Healthcare Appeal Fleet](#33-sodiq-codedenialdefender--evidence-grounded-healthcare-appeal-fleet)
   - [3.4 michaelfrancoodev/daftari — Offline-First Gold Miner Ledger](#34-michaelfrancoodevdaftari--offline-first-gold-miner-ledger)
   - [3.5 hec-ovi/memory-keepers — 3D Memory Island & Dream Engine](#35-hec-ovimemory-keepers--3d-memory-island--dream-engine)
   - [3.6 Kingnanaweb3/revoye — Retail Supply Chain Swarm](#36-kingnanaweb3revoye--retail-supply-chain-swarm)
   - [3.7 not3zra/valence — Order Intake & B2B Fulfillment](#37-not3zravalence--order-intake--b2b-fulfillment)
   - [3.8 bisale24-ops/aether-taskmaster — Telegram Taskmaster Agent](#38-bisale24-opsaether-taskmaster--telegram-taskmaster-agent)
   - [3.9 4KInc/anbu-care — Eldercare & Insurance Swarm](#39-4kincanbu-care--eldercare--insurance-swarm)
   - [3.10 cianfhoghlaim/gemini-hackathon — Per-Source Theming Engine](#310-cianfhoghlaimgemini-hackathon--per-source-theming-engine)
4. [Master Feature & Rubric Comparison Matrix](#4-master-feature--rubric-comparison-matrix)
5. [Wardstone AP2 Differentiators & Strategic Playbook](#5-wardstone-ap2-differentiators--strategic-playbook)

---

## 1. Executive Summary & Hackathon Landscape

The **Google All Things Agentic Hackathon** focuses on pushing autonomous AI agents beyond simple text chatbots into durable, resilient, multi-agent enterprise workflows.

### Official Tracks:
1. **The Fortified Enterprise Fleet (Track C)**: Multi-agent systems solving enterprise-scale governance, long-running state management, security boundaries, failure recovery, and verifiable auditability across weeks of operations. *(Wardstone AP2's Home Track)*
2. **The Taskmaster**: Autonomous task-oriented agents executing complex, domain-specific multi-step workflows with real tool calling.
3. **The Collaborative Partner**: Interactive, human-centric, creative, multimodal, or voice/3D companion systems.

### Official Judging Rubric:
- **Technical Architecture (40%)**: Strict separation of concerns, failure tolerance, state durability, telemetry, and security boundaries.
- **Innovation & Originality (30%)**: Non-trivial multi-agent coordination paradigms beyond standard linear prompt chains.
- **Demo, Completeness & Usability (30%)**: Real live deployments, working APIs, verifiable proof of operations, and crisp developer experience.
- **Bonus Track Multipliers (+1.0 pt cap)**: Gemma open weights / Speech / TTS (+0.6), Technical blog / social publication (+0.4).

---

## 2. Master Index of Submissions & Repositories

| # | Repository Link | Project Name | Track | Primary Stack | Core Focus |
|---|---|---|---|---|---|
| 1 | [`samadon1/warden`](https://github.com/samadon1/warden) | **Warden** | Fortified Enterprise Fleet | Gemini 3.5 Flash, ADK, Cloud Run, Firestore, Pub/Sub | Fleet guardian agent enforcing IAM access revocation and immutable action ledger. |
| 2 | [`fpachisa/nav-sentinel`](https://github.com/fpachisa/nav-sentinel) | **NAV Sentinel** | Fortified Enterprise Fleet | Gemini 3.7 / 3.5-flash-lite, ADK, Cloud Run, Cloud Trace | Governed fund-accounting fleet resolving Net Asset Value (NAV) breaks inside valuation windows. |
| 3 | [`sodiq-code/denialdefender`](https://github.com/sodiq-code/denialdefender) | **DenialDefender** | Fortified Fleet / Taskmaster | Gemini 3.6 Flash, ADK, Next.js 16, TypeScript, Cloud Run | 8-agent fleet preparing citation-grounded insurance denial appeals with human gates. |
| 4 | [`Kingnanaweb3/revoye`](https://github.com/Kingnanaweb3/revoye) | **Revoye** | Fortified Enterprise Fleet | Google ADK, Gemini, Cloud Run, Python | Retail supply chain agent swarm for inventory reconciliation and vendor purchase orders. |
| 5 | [`michaelfrancoodev/daftari`](https://github.com/michaelfrancoodev/daftari) | **Daftari** | The Taskmaster | Flutter, Gemini 2.5 Flash, Google ADK, Cloud Run | Offline-first Swahili-supported ledger app and batch arithmetic for artisanal gold miners. |
| 6 | [`hec-ovi/memory-keepers`](https://github.com/hec-ovi/memory-keepers) | **Memory Keepers** | Collaborative Partner | Three.js, Gemini 3.5 Flash, ADK, Firestore, Pub/Sub, TTS, Gemma | 3D floating island where librarian agents curate grounded memory books with nightly dreaming. |
| 7 | [`not3zra/valence`](https://github.com/not3zra/valence) | **Valence** | The Taskmaster | Google ADK, Gemini, Python | Autonomous order intake, customer verification, and B2B fulfillment execution. |
| 8 | [`bisale24-ops/aether-taskmaster`](https://github.com/bisale24-ops/aether-taskmaster) | **Aether Taskmaster** | The Taskmaster | Gemini 3.6, Vertex AI, ADK, Cloud Run, Firestore, Scheduler | Telegram autonomous taskmaster bot executing asynchronous task schedules. |
| 9 | [`4KInc/anbu-care`](https://github.com/4KInc/anbu-care) | **Anbu Care** | Collaborative Partner | Gemini, Google ADK, Cloud Run, Python | Autonomous eldercare coordination and health insurance navigator for NRI families. |
| 10 | [`cianfhoghlaim/gemini-hackathon`](https://github.com/cianfhoghlaim/gemini-hackathon) | **Per-Source Theming** | The Taskmaster | Gemini 3.5, Gemma 4, Google Cloud, Python | Dynamic per-source news synthesis and styling engine across British Isles publications. |
| 11 | `DueBack` | **DueBack** | The Taskmaster | Gemini 3.5 Flash, ADK, Cloud Run | "Proof-of-Done" consumer agent for tracking commercial contract promises. |
| 12 | `Sixty-Days` | **Sixty-Days** | The Taskmaster | Gemini, Vertex AI, Firestore | Disaster relief appeal preparation and FEMA filing agent. |
| 13 | `Day-Three` | **Day-Three** | The Taskmaster | Gemini, Google ADK, Vertex AI | Privacy-protected antibiotic stewardship coordination agent. |
| 14 | `Self-Healing Connector` | **Self-Healing Connector** | The Taskmaster | Gemini 3.5, Google ADK, Cloud Functions | Autonomous web scraper repair agent detecting DOM shifts and self-patching code. |
| 15 | `VoiceMind` | **VoiceMind** | Collaborative Partner | Flutter, FastAPI, ADK, Cloud TTS | Voice-first conversational companion for mental health triage. |

---

## 3. Deep-Dive Repository Deconstructions

---

### 3.1 `samadon1/warden` — Fleet Guardian & Policy Ledger
* **Repository**: [https://github.com/samadon1/warden](https://github.com/samadon1/warden)
* **Track**: Fortified Enterprise Fleet
* **Core Value Proposition**: "Warden watches over a fleet of AI agents on Google Cloud. It sees everything they do, checks each action against the agent's own rules, keeps a record no one can change, and takes an agent's access away the moment it breaks a rule."

#### Architectural Highlights:
1. **Streaming OpenTelemetry Spans via Pub/Sub**: Intercepts every tool call, model call, and output as an OTel span streaming through Cloud Pub/Sub.
2. **Dual-Tier Rule Engine**: Hard deterministic code rules (forbidden tools, explicit token caps) evaluated instantly in code; soft rules evaluated by Gemini 3.5 Flash (temp 0) quoting specific rule numbers.
3. **Real IAM Access Revocation**: When a hard rule is breached, Warden's autonomous agent triggers Google Cloud IAM API to revoke the agent's Service Account key, producing a real HTTP 403.
4. **Append-Only Action Chain**: Decision verdicts written into a sealed per-agent hash chain inside Firestore transactions (`/api/ledger/verify`).
5. **Agent Factory**: Plain-English prompt to automated agent generator that spins up starter agents.

#### Strengths vs. Weaknesses:
* 🟢 **Strengths**: Comprehensive IAM permission revoking story; dual hard/soft rule split; well-structured diagrams.
* 🔴 **Weaknesses**: No financial or on-chain settlement mechanism; rule evaluation is post-hoc (after tool call begins streaming); does not prevent cumulative sub-threshold smurfing attacks across time windows.

---

### 3.2 `fpachisa/nav-sentinel` — Governed Fund-Accounting Fleet
* **Repository**: [https://github.com/fpachisa/nav-sentinel](https://github.com/fpachisa/nav-sentinel)
* **Track**: The Fortified Enterprise Fleet
* **Core Value Proposition**: "A governed fleet of fund-accounting agents that clears reconciliation exceptions inside the NAV production window."

#### Architectural Highlights:
1. **Control Total Arithmetic**: Reconciles fund accountant books against custodian books. "Definition of done is arithmetic, not assertion" — the signed sum of explained exceptions must equal the NAV difference to 0.00.
2. **5 Specialized Parallel Investigation Agents**: Corporate actions, FX/rates, pricing, settlement, and cash/fees. Each has an isolated read-only tool allowlist.
3. **Agent Registry & Gateway**: Versioned YAML manifests declaring agent capabilities, data scopes, and authority bands.
4. **Model Cascade**: `gemini-3.7-flash` for deep document investigation & drafting; `gemini-3.5-flash-lite` for high-volume triage classification.
5. **Firestore Append-Only Mode**: Records written strictly using `.create()` rather than `.set()` to ensure immutable audit trails.

#### Strengths vs. Weaknesses:
* 🟢 **Strengths**: Outstanding domain fidelity (fund accounting); zero reliance on LLMs for math; clean architecture diagrams.
* 🔴 **Weaknesses**: Strictly passive/read-only (drafts correcting entries for human approval, never executes settlement); no autonomous circuit breaker or financial rail integration.

---

### 3.3 `sodiq-code/denialdefender` — Evidence-Grounded Healthcare Appeal Fleet
* **Repository**: [https://github.com/sodiq-code/denialdefender](https://github.com/sodiq-code/denialdefender)
* **Track**: Fortified Enterprise Fleet / Taskmaster
* **Core Value Proposition**: "AI prepares, AI verifies, human authorizes. Turns healthcare denial triage, policy research, evidence assembly, and appeal drafting into a citation-grounded appeal package in under 90 seconds."

#### Architectural Highlights:
1. **8-Agent ADK Fleet**: Patient Advocate → Denial Triage → Policy Research → Evidence Assembly → Citation Verification → Letter Drafting → Quality Review (8-point adversarial battery) → Deadline Tracker.
2. **Two Human Approval Gates**: Gate 1 confirms triage before clinical research; Gate 2 approves the finalized appeal letter before payer transmission.
3. **Provenance Tier Scoring**: Weights clinical evidence and citations from peer-reviewed medical corpora.
4. **Full Next.js 16 Web Dashboard**: Deployed live on Cloud Run (`https://denialdefender-web-7ffj23k2va-ew.a.run.app`).

#### Strengths vs. Weaknesses:
* 🟢 **Strengths**: Crisp UX and human-in-the-loop governance; high utility for medical billing specialists.
* 🔴 **Weaknesses**: Linear pipeline without feedback loops or autonomous financial settlement; essentially a structured document-generation workflow.

---

### 3.4 `michaelfrancoodev/daftari` — Offline-First Gold Miner Ledger
* **Repository**: [https://github.com/michaelfrancoodev/daftari](https://github.com/michaelfrancoodev/daftari)
* **Track**: The Taskmaster
* **Core Value Proposition**: "A ledger that cannot be lost. Offline-first Flutter app + 4 real Google ADK/Gemini Cloud Run agents, built for artisanal gold miners and traders in Tanzania."

#### Architectural Highlights:
1. **Offline-First Zero-Agent Baseline**: Mobile app works completely in airplane mode performing local speech-to-text and rule-based arithmetic.
2. **4 Independent Cloud Run Agents**:
   - `sikio`: Disambiguates unclear speech transcript fields.
   - `daftari`: Deterministic deduplication and batch gold weight arithmetic.
   - `mkumbushi`: Evening gap detection via Gemini prompts.
   - `mlinganishi`: Reconciles linked miner-buyer dual ledgers.
3. **Intentional Omission of Gold API**: Rejects external market APIs to reflect empirical artisanal purities and local cash offers.

#### Strengths vs. Weaknesses:
* 🟢 **Strengths**: Unique real-world human story; genuine offline architecture; clear limitation disclosure.
* 🔴 **Weaknesses**: README explicitly notes "nothing is deployed yet"; agents are loosely coupled helpers rather than an autonomous enterprise fleet.

---

### 3.5 `hec-ovi/memory-keepers` — 3D Memory Island & Dream Engine
* **Repository**: [https://github.com/hec-ovi/memory-keepers](https://github.com/hec-ovi/memory-keepers)
* **Track**: The Collaborative Partner
* **Core Value Proposition**: "A 3D game where blob librarian agents manage your memories in grounded 3D books. At night, the island dreams via Pub/Sub to build a cross-shelf knowledge graph."

#### Architectural Highlights:
1. **Three.js Interactive 3D Island**: Interactive WebGL interface with spatial audio and voice input (Hold 'T').
2. **Pub/Sub Nightly Dreaming Engine**: Fires nightly asynchronous background workers to consolidate memory clusters and identify subconscious recurring themes.
3. **Dual Model Tier**: Runs Gemini 3.5 Flash on Vertex AI for cloud synthesis, with fallback to local Gemma open weights (`MODEL_TIER=local`).
4. **Multimodal Stack**: Cloud TTS (voice synthesis) + Cloud STT (voice recognition) + YouTube/MusicBrainz lookup tools.

#### Strengths vs. Weaknesses:
* 🟢 **Strengths**: Incredible creative innovation (Three.js WebGL); hits multiple bonus point multipliers (Gemma, TTS, STT).
* 🔴 **Weaknesses**: Highly consumer/novelty focused; not designed for enterprise resilience, security, or financial governance.

---

### 3.6 `Kingnanaweb3/revoye` — Retail Supply Chain Swarm
* **Repository**: [https://github.com/Kingnanaweb3/revoye](https://github.com/Kingnanaweb3/revoye)
* **Track**: The Fortified Enterprise Fleet
* **Core Value Proposition**: Retail supply chain inventory orchestration and vendor order placement using Google ADK swarms.

#### Architectural Highlights:
1. Multi-agent inventory monitoring across distributed warehouse nodes.
2. Automated purchase order generation upon threshold trigger.
3. Google Cloud Run deployment with Firestore state storage.

---

### 3.7 `not3zra/valence` — Order Intake & B2B Fulfillment
* **Repository**: [https://github.com/not3zra/valence](https://github.com/not3zra/valence)
* **Track**: The Taskmaster
* **Core Value Proposition**: Automated B2B purchase order intake, customer entity resolution, and warehouse fulfillment dispatching.

---

### 3.8 `bisale24-ops/aether-taskmaster` — Telegram Taskmaster Agent
* **Repository**: [https://github.com/bisale24-ops/aether-taskmaster](https://github.com/bisale24-ops/aether-taskmaster)
* **Track**: The Taskmaster
* **Core Value Proposition**: Autonomous Telegram bot managing asynchronous task execution schedules using Gemini 3.6 on Vertex AI and Cloud Scheduler.

---

### 3.9 `4KInc/anbu-care` — Eldercare & Insurance Swarm
* **Repository**: [https://github.com/4KInc/anbu-care](https://github.com/4KInc/anbu-care)
* **Track**: The Collaborative Partner
* **Core Value Proposition**: Cross-border eldercare scheduling, medical record translation, and insurance claim coordination for Non-Resident Indian (NRI) families.

---

### 3.10 `cianfhoghlaim/gemini-hackathon` — Per-Source Theming Engine
* **Repository**: [https://github.com/cianfhoghlaim/gemini-hackathon](https://github.com/cianfhoghlaim/gemini-hackathon)
* **Track**: The Taskmaster
* **Core Value Proposition**: News analysis pipeline synthesizing per-source geopolitical viewpoints across British Isles media using Gemini 3.5 and Gemma 4.

---

## 4. Master Feature & Rubric Comparison Matrix

| Technical Capability | **Wardstone AP2** (Our Project) | **Warden** (`samadon1`) | **NAV Sentinel** (`fpachisa`) | **DenialDefender** (`sodiq-code`) | **Memory Keepers** (`hec-ovi`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Real Cryptographic Settlement** | ✅ **YES** (EVM Sepolia / x402 on-chain tx) | ❌ No (Stripe Test mock) | ❌ No (Drafts only) | ❌ No | ❌ No |
| **Active Blast-Radius Circuit Breaker** | ✅ **YES** (Pre-settlement intercept) | ⚠️ Partial (Post-hoc IAM revoke) | ❌ No (Read-only) | ⚠️ Partial (Human gate) | ❌ No |
| **Adaptive Statistical Forecaster** | ✅ **YES** (EMA + Time-Decay Variance) | ❌ No (Static rules + Gemini) | ⚠️ Partial (Recurrence count) | ❌ No | ❌ No |
| **Adversarial Red-Team Detection** | ✅ **YES** (5m smurfing burst detector) | ⚠️ Partial (Slow drift score) | ❌ No | ⚠️ Partial (8-pt test) | ❌ No |
| **Model Stack** | ✅ **Gemini 3.5** (Flash-Lite / Flash) | ✅ Gemini 3.5 Flash | ✅ Gemini 3.7 + 3.5-Lite | ✅ Gemini 3.6 Flash | ✅ Gemini 3.5 + Gemma |
| **Framework** | ✅ **Google ADK** (4 Agents Nexus) | ✅ Google ADK | ✅ Google ADK 2.0 | ✅ Google ADK (8 Agents) | ✅ Google ADK |
| **GCP Cloud Persistence** | ✅ **GCP Firestore ADC** (Survives cold starts) | ✅ Firestore + Storage | ✅ Firestore (`.create()`) | ✅ Firestore | ✅ Firestore |
| **Distributed Telemetry** | ✅ **OpenTelemetry + Live Uptime API** | ✅ OpenTelemetry to Pub/Sub | ✅ Cloud Trace OTLP | ⚠️ Basic Logging | ✅ Pub/Sub Tracing |
| **Agent Card / Registry Protocol** | ✅ **A2A Agent Card + `/api/v1/registry`** | ⚠️ Custom YAML Mandates | ✅ YAML Agent Registry | ❌ No | ❌ No |
| **Failure-Injection Recovery** | ✅ **Verified Zero-Crash Orchestrator** | ⚠️ Fail-safe lock | ❌ Not demonstrated | ❌ Not demonstrated | ❌ Not demonstrated |
| **Live Deployed Service** | ✅ **Live on Cloud Run** | ⚠️ Demo video | ⚠️ Single Cloud Run | ✅ Live on Cloud Run | ✅ Live Cloud Run |

---

## 5. Wardstone AP2 Differentiators & Strategic Playbook

### Why Wardstone AP2 Wins "The Fortified Enterprise Fleet" Track:

1. **The Only Project Solving the $100B Problem (Autonomous Financial Runway)**:
   - Competitors like *Warden* watch generic tool calls; *DenialDefender* drafts letters; *NAV Sentinel* calculates accounting breaks.
   - **Wardstone AP2 is the only platform that provides active pre-settlement governance over real money and tokens.** It enforces the official **Google AP2 (Agent Payment Protocol) & x402 standards**.

2. **Mathematical Precision over Black-Box Assertions**:
   - Rather than asking Gemini "is this spending okay?" (which hallucinates and costs $0.05/call), Wardstone's **Forecaster Agent** uses an **Adaptive Exponential Moving Average (EMA) with Time-Decay Variance**:
     $$\text{EMA}_t = \alpha \cdot S_t + (1 - \alpha) \cdot \text{EMA}_{t-1}$$
   - Legitimate workload scaling is accommodated automatically; genuine statistical anomalies ($\ge 3\sigma$) and sub-threshold high-frequency "smurfing" probes are intercepted in sub-milliseconds before a single wei leaves the treasury.

3. **Independently Proven 24/7 Uptime & Scale-to-Zero Persistence**:
   - Anchored directly to Google Cloud Firestore using native Application Default Credentials (ADC).
   - Survives serverless cold starts with verified advancing uptime (`1d 0h 56m+`), live non-zero mandate processing counters, and active background traffic simulation.

4. **Multi-Agent Nexus Architecture with Complete Telemetry**:
   - 4 strictly decoupled Google ADK agents: `WatcherAgent` $\rightarrow$ `ForecasterAgent` $\rightarrow$ `GatekeeperAgent` $\rightarrow$ `ForensicsAgent`.
   - Full OpenTelemetry span propagation across all hops with verifiable Trace IDs and parent-child hierarchy.

---

### 🎯 Next Steps for Final Polish & Video Pitch
1. **Video Demo (90s)**:
   - **Hook (0-15s)**: "Enterprises want to deploy autonomous agent fleets, but CFOs are terrified of recursive loop spending and rogue wallet drainage. Meet Wardstone AP2."
   - **Architecture & Registry (15-35s)**: Show `/api/v1/registry`, the 6 cataloged agent personas, and the A2A Agent Card pre-clearance RPC.
   - **Live Normal Settlement (35-50s)**: Show documentation indexer executing a $2.50 mandate $\rightarrow$ low risk score $\rightarrow$ instantaneous EVM Sepolia on-chain settlement with Etherscan link.
   - **Adversarial Interception & Gemini Autopsy (50-75s)**: Trigger rogue runaway loop + red-team smurfing attack $\rightarrow$ circuit breaker immediately quarantines mandate with zero funds leaked $\rightarrow$ Gemini 3.5 generates structured causal autopsy in 2.2s.
   - **Cloud Infrastructure & Telemetry (75-90s)**: Highlight Cloud Run, native Firestore ADC persistence, Pub/Sub events, and OpenTelemetry trace spans.
2. **Publish Bonus Content**:
   - Post `ARTICLE_DEVTO.md` to Dev.to.
   - Post `SOCIAL_POSTS.md` to X/Twitter with `#AllThingsAgenticHackathon` & `#GoogleCloud`.

---
*Dossier prepared for developer alignment and Claude strategy review.*
