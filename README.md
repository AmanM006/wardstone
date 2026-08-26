# Wardstone AP2: Zero-Trust Agent Fleet Gatekeeper

> **Live Dashboard**: [https://wardstone-ap2.vercel.app](https://wardstone-ap2.vercel.app)  
> **Live Backend API (Cloud Run)**: [https://wardstone-ap2-900526798908.us-central1.run.app/api/v1/health](https://wardstone-ap2-900526798908.us-central1.run.app/api/v1/health)

---

## What is Wardstone?

Wardstone is a **real-time, zero-trust governance firewall** for autonomous AI agent payment fleets. As AI agents begin independently executing high-value financial transactions (via AP2 / x402 payment protocols on Base Sepolia), Wardstone intercepts, evaluates, and either approves or quarantines every mandate before any funds settle on-chain.

The core thesis: **AI agents will hallucinate, get compromised, and recurse into runaway spending loops.** Wardstone is the circuit breaker that stops them.

---

## Google AI Models & Cloud Services Used

### 🤖 AI Models

| Model | Model ID | Role |
|---|---|---|
| **Gemma 4** | `gemma-4-26b-a4b-it` | Edge Pre-Screen Firewall — low-latency semantic filter blocking prompt injections and override payloads at the gatekeeper layer before they reach the risk engine |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` | Core Forensics Scribe — generates detailed Markdown causal postmortems for every quarantined incident, including root cause, remediation steps, and governance proof hash |
| **Gemini 2.5 Flash Image** | `gemini-2.5-flash-image` | Blast-Radius Topology Map — generates the underlying tech-noir grid background art dynamically embedded into SVG forensic topology diagrams |
| **Google Cloud Text-to-Speech** | `en-US-Journey-O` voice | Audible Incident Dispatch — streams real MP3 threat alerts from the backend to the dashboard frontend on every incident |

### ☁️ Google Cloud Services

| Service | Usage |
|---|---|
| **Cloud Run** | Hosts the FastAPI backend (`src/server.py`) — fully containerized, auto-scaling |
| **Cloud Firestore** | Stores all `ForensicIncidentReport` and `AP2PaymentMandate` documents |
| **Cloud Pub/Sub** | Event-driven mandate broadcasting to the monitoring fleet |
| **Cloud Text-to-Speech API** | Streams MP3 audio alerts via the `/api/v1/tts` endpoint |

### 🔧 Agent Framework

- **Google GenAI SDK** (`google-genai >= 1.0.0`) — used natively for all Gemma and Gemini model calls

---

## Architecture

```
                    ┌─────────────────────────────────┐
  AP2 Payment ────► │   Wardstone Gatekeeper (FastAPI) │
  Mandate           │                                 │
                    │  1. Gemma Pre-Screen (Edge)      │
                    │  2. Risk Engine + Velocity EMA   │
                    │  3. Circuit Breaker Decision      │
                    │  4. Gemini Forensics Postmortem  │
                    │  5. Gemini 2.5 Flash Image Map   │
                    │  6. Cloud TTS Voice Alert        │
                    │  7. Firestore + Pub/Sub          │
                    └─────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Base Sepolia      │
                    │  x402 Settlement   │
                    │  (Chain ID 84532)  │
                    └────────────────────┘
```

---

## Dashboard Features

| Section | Description |
|---|---|
| **Overview** | Executive control plane — circuit breaker status, settlement rail, live mandate stream |
| **Mandate Stream** | Datadog-style incident commander — click any mandate to inspect, acknowledge, view postmortem |
| **Blast-Radius Radar** | Predictive velocity wave charts + real-time risk ≥ 60 heatmap |
| **Trace Waterfall** | OpenTelemetry span-level pipeline latency traces |
| **Memory Bank** | Institutional memory — all past forensic postmortems queryable |
| **Agent Onboarding** | Register new agent fleets with spend limits and behavioral baselines |

---

## Simulation Triggers

Click any button in the top toolbar to inject a live payment mandate through the full pipeline:

- 🟢 **Normal ($2.50)** — clean autonomous documentation indexer, approved instantly
- 🟡 **Batch ($25.00)** — medium-cost GPU compute, passes with low risk score
- 🔴 **Rogue Runaway ($220.00)** — compromised scraper at 22x its declared limit → circuit breaker trips, Gemini generates postmortem, TTS alert fires
- 🔄 **Inject Crash** — worker failure injection test

---

## Running Locally

```bash
# Backend
pip install -r requirements.txt
cp .env.example .env  # add your GEMINI_API_KEY
python -m uvicorn src.server:app --host 0.0.0.0 --port 8080

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# Open http://localhost:3000/dashboard
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key (for Gemma + Gemini calls) |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON (for Firestore, Pub/Sub, TTS) |
| `BASE_SEPOLIA_RPC_URL` | Base Sepolia RPC endpoint |
| `SETTLEMENT_PRIVATE_KEY` | Wallet private key for test settlements |

---

## Tech Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Recharts, Lenis
- **Blockchain**: web3.py, Base Sepolia testnet (Chain ID 84532), x402 / EIP-4337
- **Observability**: OpenTelemetry (traces, spans, latency metrics)
- **AI**: Google GenAI SDK, Gemma 4, Gemini 3.5 Flash, Gemini 2.5 Flash Image
- **Cloud**: Cloud Run, Firestore, Pub/Sub, Cloud TTS, Vertex AI
