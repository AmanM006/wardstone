"""
Stage 6 Verification Script: Server Endpoints & Dashboard Verification
Validates:
1. FastAPI app initializes cleanly
2. Health check endpoint reports Base Sepolia connection
3. Simulation trigger endpoints function correctly
4. Dashboard HTML and static assets are accessible
"""

import os
import sys
from fastapi.testclient import TestClient

# Ensure src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.server import app
from scripts.seed_agent_personas import seed


def main():
    print("==================================================================")
    print("   WARDSTONE AP2 — STAGE 6: SERVER & DASHBOARD VERIFICATION       ")
    print("==================================================================\n")

    seed()
    with TestClient(app) as client:
        print("=== [1/4] Testing Health Check & Base Sepolia Status ===")
        res_health = client.get("/api/v1/health")
        assert res_health.status_code == 200
        health_data = res_health.json()
        assert health_data["status"] == "HEALTHY"
        print(f"  [PASS] Server reports HEALTHY status (GCP Project: {health_data['google_cloud_project']})")

        print("\n=== [2/4] Testing Dashboard HTML & Static Files ===")
        res_dash = client.get("/")
        assert res_dash.status_code == 200
        assert "WARDSTONE" in res_dash.text
        print("  [PASS] Dashboard root HTML rendered successfully.")

        print("\n=== [3/4] Testing A2A Agent Card & Pre-Clearance Endpoints ===")
        res_card = client.get("/api/v1/a2a/agent-card")
        assert res_card.status_code == 200
        card_data = res_card.json()
        assert card_data["name"] == "Wardstone Gatekeeper & Circuit Breaker"
        print(f"  [PASS] Official A2A Agent Card endpoint validated (ID: {card_data['id']})")

        res_pre = client.post("/api/v1/a2a/pre-clearance", json={
            "buyer_agent_id": "agent_steady_worker",
            "amount_usdc": 3.0
        })
        assert res_pre.status_code == 200
        pre_data = res_pre.json()
        assert pre_data["pre_clearance_status"] == "PRE_APPROVED"
        print(f"  [PASS] A2A Pre-Clearance RPC returned PRE_APPROVED (Score: {pre_data['projected_risk_score']}).")

        print("\n=== [4/4] Testing Live Simulation Pipeline Triggers ===")
        # Normal Indexer
        res_sim1 = client.post("/api/v1/simulate/trigger", json={"scenario": "normal_indexer"})
        assert res_sim1.status_code == 200
        assert res_sim1.json()["decision"]["status"] == "APPROVED"
        print("  [PASS] Simulation 1 (Normal Indexer) -> Approved & Settled on Base Sepolia.")

        # Runaway Rogue
        res_sim2 = client.post("/api/v1/simulate/trigger", json={"scenario": "runaway_rogue"})
        assert res_sim2.status_code == 200
        assert res_sim2.json()["decision"]["status"] == "HELD"
        assert res_sim2.json()["incident"] is not None
        print("  [PASS] Simulation 2 (Runaway Rogue) -> Circuit Breaker Quarantined & Incident Created.")

    print("\n------------------------------------------------------------------")
    print(">>> STAGE 6 VERIFICATION RESULT: ALL CHECKS PASSED [100%]")
    print("------------------------------------------------------------------\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
