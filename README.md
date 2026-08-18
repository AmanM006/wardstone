# Wardstone AP2: Circuit Breaker for the Agent Economy

**An autonomous multi-agent governance platform and predictive circuit breaker for the Google & Coinbase AP2 / x402 Agent Payments Protocol, built on Google Cloud, Google ADK, Base Sepolia testnet, and Gemini 3.5 Flash.**

[![Built with Google ADK](https://img.shields.io/badge/Google-ADK%202.7-4285F4.svg)](https://github.com/google/adk-python)
[![Powered by Gemini 3.5 Flash](https://img.shields.io/badge/Gemini-3.5%20Flash-34A853.svg)](https://ai.google.dev/)
[![Settlement Rail: Base Sepolia](https://img.shields.io/badge/Base%20Sepolia-x402%20Settlement-0052FF.svg)](https://sepolia.basescan.org)
[![Cloud Run Ready](https://img.shields.io/badge/Deploy-Google%20Cloud%20Run-EA4335.svg)](https://cloud.google.com/run)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. The Unlikely Hero & Problem Statement

### The Persona: **The AI Agent Fleet Controller**
In the emerging agentic economy, autonomous AI agents procure compute, hire sub-agents, and execute micro-transactions without human supervision using **Google & Coinbase's AP2 / x402 protocol**. 

However, organizations face a critical operational nightmare:
* **Runaway Spend Loops**: An unsupervised agent encountering an unhandled prompt loop can burn hundreds of dollars in micro-transactions within minutes.
* **Lack of Predictive Interventions**: Existing API gateways only enforce *static post-facto spend caps* or log traces after money has already left the wallet.
* **The Blast-Radius Risk**: Before Wardstone, there was no pre-settlement immune system capable of calculating risk velocity and halting anomalous payment mandates *before* on-chain finality.

**Wardstone AP2** is the active control plane built for the **AI Agent Fleet Controller** — an autonomous multi-agent governance system that predicts blast-radius risk, auto-approves safe payments, quarantines rogue mandates before settlement, and generates plain-English incident postmortems using Gemini 3.5 Flash.

---

## 2. Multi-Agent Nexus Architecture

Wardstone implements the **Multi-Agent Nexus** orchestration pattern using Google ADK with strictly enforced separation of concerns:

```mermaid
graph TD
    subgraph "External Multi-Agent Ecosystem"
        EXT["External Buyer Agent<br/>(Requests Micro-Service / Compute)"]
        AC_EXT["A2A Pre-Clearance Query<br/>(Queries Gatekeeper Agent Card)"]
    end

    subgraph "Google Cloud Ingestion Layer"
        PS["Cloud Pub/Sub: `mandate-events`<br/>(Intent → Cart → AP2 Payment Mandate)"]
    end

    subgraph "Wardstone Multi-Agent Governance Fleet (Google ADK)"
        ORCH["Root Orchestrator<br/>(Supervises State Machine & Failure Recovery)"]
        
        WATCH["1. Watcher Agent<br/>(Normalizes Mandates → Firestore)"]
        FORE["2. Forecaster Agent<br/>(Memory Bank History → 0-100 Blast Risk)"]
        GATE["3. Gatekeeper Agent<br/>(Threshold Policy & A2A Agent Card)"]
        FOREN["4. Forensics Agent (Gemini 3.5 Flash)<br/>(Causal Postmortem & Remediation Scribe)"]
        
        MB[("Agent Engine Memory Bank<br/>Spend Baselines & Profiles")]
    end

    subgraph "Official x402 Settlement Rail"
        X402["Official a2a-x402 Facilitator<br/>(Base Sepolia Settlement)"]
        TX[("Base Sepolia Blockchain<br/>Live Verifiable Tx Hash")]
        BLOCK["Circuit Breaker Quarantined<br/>(Zero Funds / No On-Chain Tx)"]
    end

    subgraph "Observability & Fleet Command Console"
        OTEL["OpenTelemetry Distributed Traces"]
        DASH["Wardstone Fleet Command Console<br/>(FastAPI Real-Time Dashboard)"]
        INC[("Firestore `incidents` Collection")]
    end

    EXT -->|Emits Payment Mandate| PS
    EXT <-->|Queries Pre-Clearance| AC_EXT
    AC_EXT <--> GATE

    PS --> WATCH
    ORCH --> WATCH & FORE & GATE & FOREN

    WATCH --> FORE
    FORE <--> MB
    FORE -->|Risk Score| GATE

    GATE -->|Low Risk (Score < 60)| X402 --> TX
    GATE -->|High Risk (Score >= 60)| BLOCK
    BLOCK --> FOREN
    FOREN --> INC

    ORCH --> OTEL
    INC & MB & PS --> DASH
```

---

## 3. Strict Separation of Concerns (4 Google ADK Agents)

| Agent | Core Responsibility | What It Does NOT Do |
| :--- | :--- | :--- |
| **1. Watcher Agent** | Subscribes to Pub/Sub events, parses AP2 schemas, normalizes records into Firestore. | Does *not* calculate risk scores, does *not* execute payments. |
| **2. Forecaster Agent** | Queries **Agent Engine Memory Bank**, calculates velocity variance & deviation, outputs 0–100 Blast Risk. | Does *not* make binary approve/deny policy decisions. |
| **3. Gatekeeper Agent** | Applies threshold policy (`Score < 60`), authorizes on-chain Base Sepolia settlement, or trips Circuit Breaker. Exposes **A2A Agent Card**. | Does *not* generate long-form forensic reports. |
| **4. Forensics Agent** | Ingests quarantined mandates and prompts **Gemini 3.5 Flash** to draft executive-ready, plain-English incident postmortems. | Never touches money or settlement credentials. |

---

## 4. Failure-Tolerant Recovery (Multi-Agent Nexus Rubric)

A key requirement of the hackathon's Multi-Agent Nexus architecture is failure recovery:
* If a worker agent (such as the Forecaster) times out, encounters a network glitch, or returns malformed output, the **RecoveryManager** catches the exception.
* It performs exponential retries and engages safe **defensive fallback routing** (quarantining unverified high-value transactions defensively) without crashing the fleet or stalling downstream operations.

---

## 5. Live Demo Scenarios & Testnet Disclosure

> [!NOTE]
> **Testnet Disclosure**: All on-chain settlement demonstrations execute strictly on **Base Sepolia Testnet** using test-USDC or test-ETH micropayments. No real currency is transferred.

The built-in Command Console includes one-click triggers to demonstrate the entire lifecycle live:
1. **Clean Micro-Settlement ($2.50)**: Normal steady indexer mandate $\rightarrow$ Score: 20.0/100 $\rightarrow$ Approved $\rightarrow$ Settled on Base Sepolia with verifiable transaction hash.
2. **Batch Compute Mandate ($25.00)**: Nightly batch worker $\rightarrow$ Score: 38.5/100 $\rightarrow$ Approved $\rightarrow$ Settled on Base Sepolia.
3. **Rogue Runaway Loop ($220.00)**: Compromised agent attempting recursive bursts $\rightarrow$ Score: 99.0/100 $\rightarrow$ **Circuit Breaker Quarantined (Zero On-Chain Movement)** $\rightarrow$ Gemini 3.5 generates incident postmortem in Firestore.
4. **Failure Injection & Recovery**: Deliberately crashes the Forecaster mid-flight $\rightarrow$ Orchestrator catches error, logs warning, engages defensive quarantine, and keeps the fleet fully operational.

---

## 6. Quick Start & Reproducible Setup Guide

### Prerequisites
* Python 3.12+
* Google Cloud account with Gemini API key (optional for local deterministic fallback)
* Base Sepolia testnet RPC connection (defaults to `https://sepolia.base.org`)

### Local Installation & Spin-Up

```bash
# 1. Clone the repository
git clone https://github.com/your-username/wardstone-ap2.git
cd wardstone-ap2

# 2. Install dependencies with uv or pip
uv pip install --system -r requirements.txt

# 3. Configure environment variables (optional - sensible defaults provided)
cp .env.example .env

# 4. Run automated verification suite across all 6 stages
python scripts/stage1_gcp_check.py
python scripts/stage2_settle_proof.py
python scripts/stage3_watcher_forecaster_test.py
python scripts/stage4_gatekeeper_test.py
python scripts/stage5_failure_injection_test.py
python scripts/stage6_server_test.py

# 5. Launch the FastAPI server and Command Console
uvicorn src.server:app --host 0.0.0.0 --port 8080
```

Open your browser at **`http://localhost:8080`** to view the live Command Console!

---

## 7. Google Cloud Run Deployment

To deploy Wardstone AP2 to Google Cloud Run:

```bash
# Build and submit container image to Google Artifact Registry
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/wardstone-ap2:latest

# Deploy to Cloud Run with scale-to-zero configuration
gcloud run deploy wardstone-ap2 \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/wardstone-ap2:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT,GEMINI_MODEL=gemini-3.5-flash
```

---

## 8. Technology Stack Summary

* **Core AI Reasoning**: Google Gemini 3.5 Flash (via Google GenAI SDK)
* **Agent Framework**: Google Agent Development Kit (ADK 2.7)
* **Agent Protocol**: A2A (Agent-to-Agent v1.0) with JSON-LD Agent Cards & AP2 / x402 micropayments
* **Cloud Infrastructure**: Google Cloud Run, Google Cloud Firestore, Google Cloud Pub/Sub
* **Blockchain Settlement**: Base Sepolia Testnet (Chain ID: 84532), Web3.py
* **Observability**: OpenTelemetry Distributed Tracing (OTLP)
* **Backend & UI**: FastAPI, Uvicorn, Vanilla Modern CSS/JS Command Console
