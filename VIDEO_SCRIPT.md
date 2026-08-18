# Wardstone AP2 — 4-Minute Demo Video Pitch Script

**Title:** Circuit Breaker for the Agent Economy  
**Track:** Fortified Enterprise Fleet (Security & Governance / Multi-Agent Nexus)  
**Presenter:** AI Agent Fleet Controller  
**Target Duration:** 3 minutes 50 seconds (Strictly under 4:00 limit)

---

## Act 1: The Problem & The "Unlikely Hero" (0:00 – 0:45)

* **Visual on Screen:** Terminal/Dashboard showing multiple autonomous agents executing tasks. Camera overlay on speaker.
* **Audio / Narration:**
  > "Welcome. Today, autonomous AI agents are doing the heavy lifting across the enterprise — hiring other agents and paying for compute on the fly using Google and Coinbase's new AP2 and x402 protocols.
  >
  > But as an **AI Agent Fleet Controller**, here is my nightmare: what happens when an unsupervised background agent hits a prompt loop or gets hijacked, and burns $500 of micro-transactions in 10 minutes?
  >
  > Existing API gateways only show you dashboards *after* your money is gone. 
  > 
  > This is **Wardstone AP2**: the active, predictive circuit breaker that monitors the agent economy, calculates blast-radius velocity in real time, auto-approves safe payments on Base Sepolia, and stops runaway spend *before* on-chain settlement."

---

## Act 2: Clean Autonomous Settlement on Base Sepolia (0:45 – 1:45)

* **Visual on Screen:** Open `http://localhost:8080` (or Cloud Run URL). Show the live Command Console, Base Sepolia block height, and active Agent profiles in Memory Bank. Click **🟢 "Trigger Normal Mandate ($2.50)"**.
* **Audio / Narration:**
  > "Let's see Wardstone in action. Here is our Fleet Command Console deployed on Google Cloud.
  >
  > In our Agent Memory Bank, our Documentation Indexer Agent has an established baseline velocity of $15 per hour.
  >
  > When it issues an AP2 mandate for $2.50 of vector embeddings, the **Watcher Agent** normalizes the schema, the **Forecaster Agent** computes a safe blast-radius score of 20 out of 100, and the **Gatekeeper Agent** approves it.
  >
  > Watch the settlement stream: the official x402 facilitator executes a live transaction on Base Sepolia testnet. We click the transaction link right here — and there it is on BaseScan block explorer with full on-chain finality."

---

## Act 3: The Rogue Runaway Kill-Switch & Gemini 3.5 Postmortem (1:45 – 2:45)

* **Visual on Screen:** Click **🔴 "Simulate Rogue Runaway ($220.00)"**. Watch the instant UI response: the mandate turns bright red with status **QUARANTINED**, the Circuit Breaker intervention counter increments, and a new Gemini 3.5 Incident Postmortem appears in the right drawer.
* **Audio / Narration:**
  > "Now, watch what happens when an unsupervised scraper agent goes rogue and attempts an unapproved $220 burst transaction.
  >
  > The Forecaster detects a 25x velocity variance and outputs a critical risk score of 99 out of 100.
  >
  > Instantly, the **Gatekeeper trips the Circuit Breaker**. 
  >
  > Notice the on-chain status: **QUARANTINED**. Exactly zero dollars moved on Base Sepolia. 
  >
  > Simultaneously, our **Forensics Agent** prompts **Gemini 3.5 Flash** to generate this plain-English incident postmortem explaining the statistical deviation, affected endpoints, and recommended remediation for the Fleet Controller."

---

## Act 4: Failure-Tolerant Recovery & Google Cloud Proof (2:45 – 3:50)

* **Visual on Screen:** Click **⚠️ "Inject Worker Timeout & Test Recovery"**. Show the terminal logs showing the Orchestrator catching worker failure and engaging defensive quarantine. Switch browser tab to Google Cloud Console (Cloud Run service, Firestore collections, and Cloud Logs).
* **Audio / Narration:**
  > "Finally, let's test architectural resilience. Under the hackathon's Multi-Agent Nexus rubric, what happens if a worker agent loops or crashes?
  >
  > We inject a catastrophic worker timeout. Our Root Orchestrator catches the error, engages defensive fallback routing, quarantines the mandate safely, and keeps the rest of the fleet running with zero downtime.
  >
  > Here is our backend deployed live on **Google Cloud Run**, with our Firestore state collections, Pub/Sub event queues, and OpenTelemetry distributed traces.
  >
  > Wardstone AP2 gives organizations the confidence to let agents run autonomously in the background without fear of runaway spend. Thank you."

---

## Technical Checklist for Recording
- [ ] Base Sepolia live block height visible on navbar.
- [ ] Real BaseScan link clicked and opened in browser tab.
- [ ] Quarantined mandate provably shows "N/A (Held) / Zero Funds Moved".
- [ ] Gemini 3.5 incident explanation visible on screen.
- [ ] Cloud Run console / `.run` URL visible for proof of deployment.
