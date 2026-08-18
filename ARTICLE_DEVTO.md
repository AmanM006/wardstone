# Building an Active Circuit Breaker for the Agent Economy on Google ADK & AP2

> **Disclaimer:** *I created this project and article for the purposes of entering the Google All Things Agentic Hackathon on Devpost.*

---

## 1. Introduction: The Unsupervised Agent Economy

In 2026, AI agents are no longer passive chat assistants. Using Google and Coinbase's new **Agent Payment Protocol (AP2) and x402 on-chain micropayment standard**, agents autonomously procure compute, pay for vector embeddings, and hire specialized sub-agents.

However, giving autonomous background agents financial wallets introduces a critical systemic risk: **Runaway Spend Loops and Blast-Radius Acceleration**. If an agent encounters an unhandled prompt exception or recursive loop, it can burn through hundreds of dollars in automated micropayments in minutes before any human notices.

Existing API gateways only show **post-facto logs after money has already been spent**. 

To solve this, we built **Wardstone AP2** — an active, predictive circuit breaker for the **AI Agent Fleet Controller** that calculates blast-radius variance and quarantines anomalous payment mandates *before* on-chain finality on Base Sepolia.

---

## 2. Architecture: The Multi-Agent Nexus Pattern

Wardstone is built with **Google Agent Development Kit (ADK 2.7)** and **Gemini 3.5 Flash** using a 4-agent separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│              ROOT ORCHESTRATOR (Google ADK)                 │
│      Supervises state machine, retries, and recovery        │
└───────┬─────────────┬──────────────┬───────────────┬────────┘
        │             │              │               │
   ┌────▼────┐   ┌────▼──────┐  ┌────▼──────┐   ┌────▼──────┐
   │ Watcher │   │Forecaster │  │Gatekeeper │   │ Forensics │
   │  Agent  │──▶│   Agent   │─▶│   Agent   │──▶│   Agent   │
   └─────────┘   └───────────┘  └───────────┘   └───────────┘
        │             │              │               │
   Cloud Pub/Sub  Memory Bank    Base Sepolia    Gemini 3.5
     Ingestion    (Baselines)     Settlement     Postmortems
```

### 1. Watcher Agent
Subscribes to Google Cloud Pub/Sub (`mandate-events`), normalizes AP2 payloads (Intent, Cart, Payment Mandate), and writes records to Google Cloud Firestore.

### 2. Forecaster Agent
Queries the **Agent Engine Memory Bank** for the agent's historical spend profile. Calculates moving-window rolling velocity and assigns a dynamic **0–100 Blast-Radius Risk Score**.

### 3. Gatekeeper Agent
Enforces governance thresholds:
* **Score < 60 (Low Risk)**: Authorizes official x402 on-chain settlement on **Base Sepolia testnet**, generating a verifiable transaction hash on BaseScan.
* **Score $\ge$ 60 (High Risk)**: Trips the circuit breaker, halting settlement with **provably zero on-chain token movement**.
* Exposes an official **A2A Agent Card (JSON-LD)** allowing external buyer agents to query pre-clearance prior to signing.

### 4. Forensics Agent (Powered by Gemini 3.5 Flash)
When a mandate is quarantined, the Forensics Agent prompts **Gemini 3.5 Flash** to generate a structured, executive-ready incident postmortem detailing the statistical deviation, affected components, and recommended remediation.

---

## 3. Failure-Tolerant Multi-Agent Recovery

Under the hackathon's **Multi-Agent Nexus** architectural criteria, our system implements resilient failure recovery:
If a worker agent crashes or returns malformed schema, the `FailureRecoveryManager` detects the exception, attempts exponential retries, and applies safe defensive fallback quarantine without crashing the fleet.

---

## 4. Key Learnings & Takeaways

1. **Active Gating > Passive Observability**: You cannot rely on post-execution dashboards when autonomous agents have real wallets. Control planes must act as pre-settlement immune systems.
2. **A2A Agent Cards Enable Collaborative Governance**: Exposing pre-clearance query RPCs allows well-behaved agents to verify their spend headroom before committing expensive transactions.

---

*Built with Google ADK, Gemini 3.5 Flash, Google Cloud Run, Cloud Firestore, Cloud Pub/Sub, and Base Sepolia.*
