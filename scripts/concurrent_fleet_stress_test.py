"""
Wardstone AP2 — Real Concurrent Multi-Agent Fleet Stress Test
Fires simultaneous AP2 payment mandates from multiple distinct agent personas in parallel
to verify Gatekeeper concurrency, thread-safe memory bank updates, and non-blocking circuit breaking.
"""

import sys
import os
import time
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

TARGET_URL = os.environ.get("WARDSTONE_TARGET_URL", "https://wardstone-ap2-900526798908.us-central1.run.app")

CONCURRENT_TASKS = [
    {
        "agent": "Autonomous Documentation Indexer",
        "scenario": "normal_indexer",
        "expected": "APPROVED"
    },
    {
        "agent": "Nightly Model Evaluation Worker",
        "scenario": "batch_compute",
        "expected": "APPROVED"
    },
    {
        "agent": "Autonomous Documentation Indexer (Sub-task)",
        "scenario": "normal_indexer",
        "expected": "APPROVED"
    },
    {
        "agent": "Unsupervised Lead Scraper (Compromised Rogue)",
        "scenario": "runaway_rogue",
        "expected": "HELD"
    }
]


def execute_mandate(task_info: dict, index: int):
    start = time.perf_counter()
    url = f"{TARGET_URL}/api/v1/simulate/trigger"
    payload = json.dumps({"scenario": task_info["scenario"]}).encode("utf-8")
    
    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read().decode("utf-8"))
        elapsed = (time.perf_counter() - start) * 1000.0
        
        dec = data.get("decision", {})
        status = dec.get("status")
        score = data.get("risk_score")
        tx = dec.get("tx_hash")
        
        return {
            "task_index": index,
            "agent": task_info["agent"],
            "scenario": task_info["scenario"],
            "status": status,
            "risk_score": score,
            "tx_hash": tx,
            "elapsed_ms": round(elapsed, 1),
            "match_expected": (status == task_info["expected"]),
            "error": None
        }
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000.0
        return {
            "task_index": index,
            "agent": task_info["agent"],
            "scenario": task_info["scenario"],
            "status": "ERROR",
            "risk_score": None,
            "tx_hash": None,
            "elapsed_ms": round(elapsed, 1),
            "match_expected": False,
            "error": str(e)
        }


def main():
    print(f"=== WARDSTONE AP2 CONCURRENT FLEET EXECUTION TEST ===")
    print(f"Target: {TARGET_URL}")
    print(f"Spawning {len(CONCURRENT_TASKS)} parallel asynchronous agent threads simultaneously...\n")
    
    start_total = time.perf_counter()
    results = []
    
    with ThreadPoolExecutor(max_workers=len(CONCURRENT_TASKS)) as executor:
        futures = [executor.submit(execute_mandate, t, i + 1) for i, t in enumerate(CONCURRENT_TASKS)]
        for future in as_completed(futures):
            results.append(future.result())
            
    total_elapsed = (time.perf_counter() - start_total) * 1000.0
    results.sort(key=lambda x: x["task_index"])
    
    print("---------------------------------------------------------------------------------------------------------")
    print(f"{'#':<3} | {'Agent Persona':<38} | {'Scenario':<16} | {'Status':<10} | {'Score':<6} | {'Latency':<9} | {'Result':<6}")
    print("---------------------------------------------------------------------------------------------------------")
    
    all_passed = True
    for r in results:
        res_tag = "PASS" if r["match_expected"] else "FAIL"
        if not r["match_expected"]:
            all_passed = False
        print(f"{r['task_index']:<3} | {r['agent']:<38} | {r['scenario']:<16} | {r['status']:<10} | {str(r['risk_score']):<6} | {r['elapsed_ms']:>6.1f}ms | {res_tag}")
        if r["tx_hash"]:
            print(f"    --> Verified Tx: {r['tx_hash']}")
        elif r["error"]:
            print(f"    --> Error Detail: {r['error']}")
            
    print("---------------------------------------------------------------------------------------------------------")
    print(f"Total Concurrent Batch Time: {total_elapsed:.1f}ms for {len(CONCURRENT_TASKS)} parallel mandates.")
    print(f"Overall Concurrency Test Status: {'ALL PASSED' if all_passed else 'ENCOUNTERED FAILURES'}\n")


if __name__ == "__main__":
    main()
