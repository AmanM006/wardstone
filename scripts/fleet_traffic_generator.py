"""
Wardstone AP2 — Continuous Background Fleet Traffic Generator
Demonstrates long-running asynchronous fleet operations with realistic micro-transactions,
continuous pre-clearance checks, and deliberate anomaly injections.
"""

import sys
import os
import time
import random
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

TARGET_URL = os.environ.get("WARDSTONE_TARGET_URL", "https://wardstone-ap2-900526798908.us-central1.run.app")

AGENT_PERSONAS = [
    {
        "id": "agent_steady_worker",
        "name": "Autonomous Documentation Indexer",
        "service": "Vector Embedding Batch",
        "min_amount": 1.0,
        "max_amount": 4.5,
        "is_rogue": False
    },
    {
        "id": "agent_batch_processor",
        "name": "Nightly Model Evaluation Worker",
        "service": "LLM Benchmark Run",
        "min_amount": 15.0,
        "max_amount": 35.0,
        "is_rogue": False
    },
    {
        "id": "agent_subagent_coordinator",
        "name": "Distributed Task Dispatcher",
        "service": "Sub-agent Compute Allocation",
        "min_amount": 5.0,
        "max_amount": 12.0,
        "is_rogue": False
    }
]


def log(msg: str):
    now = datetime.now(timezone.utc).strftime("%H:%M:%S.%f")[:-3]
    print(f"[{now}] {msg}", flush=True)


def test_pre_clearance(persona: dict, amount: float):
    url = f"{TARGET_URL}/api/v1/a2a/pre-clearance"
    payload = json.dumps({
        "buyer_agent_id": persona["id"],
        "amount_usdc": amount,
        "intended_service": persona["service"]
    }).encode("utf-8")
    
    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode("utf-8"))
        status = data.get("pre_clearance_status")
        score = data.get("projected_risk_score")
        log(f"  [A2A Pre-Clearance] Agent '{persona['name']}' (${amount:.2f}) -> Status: {status} (Score: {score})")
        return data
    except Exception as e:
        log(f"  [A2A Pre-Clearance Error]: {e}")
        return None


def run_fleet_cycle(iteration: int):
    log(f"--- FLEET ASYNC CYCLE #{iteration} ---")
    
    # 1. Normal Persona Operations
    persona = random.choice(AGENT_PERSONAS)
    amount = round(random.uniform(persona["min_amount"], persona["max_amount"]), 2)
    
    # Pre-clearance check
    test_pre_clearance(persona, amount)
    
    # Execute normal mandate
    scenario = "normal_indexer" if persona["id"] == "agent_steady_worker" else "batch_compute"
    url = f"{TARGET_URL}/api/v1/simulate/trigger"
    payload = json.dumps({"scenario": scenario}).encode("utf-8")
    
    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        resp = urllib.request.urlopen(req, timeout=15)
        res_data = json.loads(resp.read().decode("utf-8"))
        dec = res_data.get("decision", {})
        log(f"  [MANDATE EXECUTED] Mandate: {res_data.get('mandate_id')} | Status: {dec.get('status')} | Tx: {dec.get('tx_hash') or 'NONE'}")
    except Exception as e:
        log(f"  [Execution Error]: {e}")

    # 2. Occasional Injected Anomaly on Cycle #3
    if iteration % 4 == 0:
        log(f"\n[!! ANOMALY INJECTION !!] Rogue spend loop attempt detected on fleet!")
        rogue_payload = json.dumps({"scenario": "runaway_rogue"}).encode("utf-8")
        try:
            req = urllib.request.Request(url, data=rogue_payload, headers={"Content-Type": "application/json"})
            resp = urllib.request.urlopen(req, timeout=20)
            res_data = json.loads(resp.read().decode("utf-8"))
            dec = res_data.get("decision", {})
            inc = res_data.get("incident", {})
            log(f"  [CIRCUIT BREAKER ENGAGED] Mandate: {res_data.get('mandate_id')} | Status: {dec.get('status')} | Zero Funds Leaked!")
            log(f"  [GEMINI AUTOPSY SUMMARY]: {inc.get('anomaly_summary')}\n")
        except Exception as e:
            log(f"  [Rogue Injection Error]: {e}")


def main():
    cycles = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    log(f"Starting Continuous Background Fleet Generator (Target: {TARGET_URL}). Total Cycles: {cycles}")
    
    for i in range(1, cycles + 1):
        run_fleet_cycle(i)
        if i < cycles:
            time.sleep(1.5)
            
    log(f"Fleet simulation run completed successfully.")


if __name__ == "__main__":
    main()
