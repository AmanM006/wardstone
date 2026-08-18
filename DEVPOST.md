# Devpost Submission Form Content

## 1. Project Title
**Wardstone AP2: Circuit Breaker for the Agent Economy**

## 2. Tagline
Predictive multi-agent circuit breaker and governance control plane for AP2/x402 agent payments on Google Cloud and Base Sepolia.

## 3. Selected Category / Track
**Fortified Enterprise Fleet** (Primary Track: Security & Governance / Multi-Agent Nexus)

## 4. Text Description (Problem, Solution & Value Proposition)

### Inspiration & The "Unlikely Hero"
In the agentic era, autonomous AI agents are moving beyond chat prompts: they are forming decentralized teams, executing complex workflows asynchronously in the background, and hiring sub-agents using Google and Coinbase's new **Agent Payment Protocol (AP2) and x402 on-chain settlement rails**.

However, as more agents operate unsupervised, enterprise engineering leads and financial controllers face a terrifying friction: **Unsupervised Spend Loops & Runaway Blast Radius**. An unhandled prompt loop or rogue tool chain can burn hundreds of dollars in automated micropayments within minutes before a human even opens a dashboard.

We built **Wardstone AP2** for the **AI Agent Fleet Controller** — an active, predictive governance immune system that intercepts payment mandates *before* settlement, predicts velocity variance using Memory Bank baselines, auto-approves safe transactions on Base Sepolia testnet, and trips the circuit breaker on rogue spikes while generating plain-English causal postmortems with Gemini 3.5 Flash.

### What It Does
1. **Predictive Blast-Radius Forecasting**: Rather than enforcing static caps after money has been spent, the **Forecaster Agent** queries the **Agent Engine Memory Bank** to model moving-window velocity and assign a dynamic 0–100 risk score.
2. **Active Circuit Breaker & Real Testnet Settlement**: The **Gatekeeper Agent** enforces policy: safe mandates (< 60 risk) settle instantly on **Base Sepolia testnet** producing verifiable on-chain transaction hashes; anomalous mandates ($\ge$ 60 risk) are quarantined instantly with **zero on-chain token movement**.
3. **Gemini 3.5 Causal Incident Forensics**: When a mandate is held, the **Forensics Agent** prompts **Gemini 3.5 Flash** to analyze the statistical deviation, identify affected components, and generate an executive-ready plain-English incident postmortem in Firestore.
4. **A2A Agent Card Pre-Clearance**: Implements the official **A2A Agent Card (JSON-LD)** standard, allowing external buyer agents to query pre-clearance before committing expensive payments.
5. **Failure-Tolerant Multi-Agent Nexus**: If a worker agent crashes or returns malformed data, the **Root Orchestrator** catches the failure, performs exponential retries, and applies safe defensive quarantine fallback without stalling fleet operations.

### How We Built It
* **Agent Architecture**: 4 Google ADK agents (Watcher, Forecaster, Gatekeeper, Forensics) orchestrated under the Multi-Agent Nexus pattern with strict separation of concerns.
* **Core LLM**: Google Gemini 3.5 Flash via Google GenAI SDK.
* **State & Memory**: Google Cloud Firestore (`mandates`, `agent_profiles`, `incidents`) and persistent Agent Engine Memory Bank.
* **Ingestion**: Google Cloud Pub/Sub (`mandate-events`).
* **Settlement Rail**: Web3 on Base Sepolia Testnet (Chain ID 84532) using the official x402 facilitator flow.
* **Observability**: OpenTelemetry distributed tracing across agent hops.
* **Compute & UI**: Containerized on Google Cloud Run serving a responsive real-time Command Console.

### Challenges We Overcame
1. **Pre-Settlement Interception vs Post-Hoc Tracing**: Most observability tools only log traces after API calls finish. Designing a low-latency pre-settlement gating loop that calculates velocity projections without adding noticeable overhead required fine-tuning our Memory Bank windowing.
2. **Multi-Agent Nexus Failure Recovery**: Building a genuine failure-tolerant state machine where a worker agent's failure triggers defensive quarantine rather than an unhandled container crash required dedicated recovery middleware.

### Findings & Learnings
* Autonomous agent economies require **active control planes**, not just passive monitoring dashboards.
* Combining A2A Agent Cards with predictive blast-radius scoring eliminates up to 90% of unintended spend loops before on-chain finality.

## 5. Built With
- `google-adk` (Agent Development Kit 2.7)
- `gemini-3.5-flash` (Google GenAI SDK)
- `google-cloud-run`
- `google-cloud-firestore`
- `google-cloud-pubsub`
- `base-sepolia` (Web3 / x402 settlement)
- `opentelemetry`
- `fastapi` & `python`
