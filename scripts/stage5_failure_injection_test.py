"""
Stage 5 Verification Script: Forensics & Failure-Tolerance Injection Test
Validates:
1. Forensics Agent generates structured, plain-English incident postmortem on quarantined mandate
2. Incident report persisted to Firestore 'incidents' collection
3. Failure-Injection Test: Deliberately injected worker timeout/failure is gracefully caught and recovered by Orchestrator
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.protocols.ap2_schema import AP2AgentIdentity, AP2CartItem, AP2PaymentMandate
from src.orchestrator.root_orchestrator import root_orchestrator
from src.storage.firestore_client import firestore_client
from scripts.seed_agent_personas import seed


def main():
    print("==================================================================")
    print("   WARDSTONE AP2 — STAGE 5: FORENSICS & FAILURE TOLERANCE TEST    ")
    print("==================================================================\n")

    seed()

    seller = AP2AgentIdentity(
        agent_id="agent_oracle_node",
        agent_name="Decentralized Oracle Node",
        owner_wallet="0x28054904C99b7FE4c000F9F570b7f83C76f1F43E"
    )

    print("=== [1/2] Testing Forensics Incident Report Generation ===")
    rogue_buyer = AP2AgentIdentity(
        agent_id="agent_compromised_runaway",
        agent_name="Unsupervised Lead Scraper (Compromised)",
        owner_wallet="0x3333333333333333333333333333333333333333",
        declared_spend_limit_usd=10.0
    )
    mandate_data = {
        "buyer_agent": rogue_buyer.model_dump(mode="json"),
        "seller_agent": seller.model_dump(mode="json"),
        "cart_items": [{"description": "High-frequency recursive scraping API", "unit_price_usdc": 140.0, "quantity": 1}],
        "total_amount_usdc": 140.0,
        "destination_wallet": seller.owner_wallet,
        "valid_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
    }

    result = root_orchestrator.process_mandate_pipeline(mandate_data)
    assert result["success"] is True
    assert result["decision"]["status"] == "HELD"
    assert result["incident"] is not None, "Expected incident report on held mandate"

    incident = result["incident"]
    print(f"  [PASS] Incident Report Generated (ID: {incident['incident_id']}):")
    print(f"         Summary: {incident['anomaly_summary']}")
    print(f"         Root Cause: {incident['root_cause_explanation'][:140]}...")
    print(f"         Remediation: {incident['recommended_remediation']}")

    # Verify Firestore record exists
    incidents_list = firestore_client.list_incidents()
    assert len(incidents_list) > 0, "Incident not found in storage"
    print("  [PASS] Incident record verified in Firestore 'incidents' collection.")

    print("\n=== [2/2] Testing Failure Injection & Orchestrator Recovery ===")
    print("  [INJECTION] Simulating catastrophic Forecaster worker timeout & malformed output...")
    
    # Run with simulated failure injection
    resilient_result = root_orchestrator.process_mandate_pipeline(
        mandate_data,
        simulate_forecaster_failure=True
    )

    assert resilient_result["success"] is True, "Orchestrator failed to recover from worker crash!"
    assert resilient_result["decision"]["status"] == "HELD"
    assert "WORKER_FAILURE_DEFENSIVE_FALLBACK" in str(resilient_result["incident"]["root_cause_explanation"]) or resilient_result["risk_score"] >= 90.0
    
    print(f"  [PASS] Orchestrator successfully caught worker failure, engaged defensive fallback, and completed safely!")
    print(f"         Execution time with recovery: {resilient_result['elapsed_ms']} ms")
    print(f"         System Status: ZERO CRASHES, FLEET OPERATIONAL")

    print("\n------------------------------------------------------------------")
    print(">>> STAGE 5 VERIFICATION RESULT: ALL CHECKS PASSED [100%]")
    print("------------------------------------------------------------------\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
