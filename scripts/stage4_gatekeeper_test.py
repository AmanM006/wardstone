"""
Stage 4 Verification Script: Gatekeeper + Active Circuit Breaker + A2A Query Verification
Validates:
1. Low-risk mandate full path: Watcher -> Forecaster -> Gatekeeper -> Real Base Sepolia Settlement (Tx Hash verified)
2. High-risk mandate full path: Watcher -> Forecaster -> Gatekeeper -> Circuit Breaker Quarantined (Zero Tx Hash, Zero Funds Moved)
3. A2A Pre-Clearance Query verification from an external test agent querying Gatekeeper Agent Card
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.protocols.ap2_schema import AP2AgentIdentity, AP2CartItem, AP2PaymentMandate
from src.agents.watcher import watcher_agent
from src.agents.forecaster import forecaster_agent
from src.agents.gatekeeper import gatekeeper_agent
from scripts.seed_agent_personas import seed


def main():
    print("==================================================================")
    print("   WARDSTONE AP2 — STAGE 4: GATEKEEPER & A2A VERIFICATION         ")
    print("==================================================================\n")

    seed()

    seller = AP2AgentIdentity(
        agent_id="agent_gpu_node",
        agent_name="GPU Cluster Node",
        owner_wallet="0x28054904C99b7FE4c000F9F570b7f83C76f1F43E"
    )

    print("=== [1/3] Testing Low-Risk Path: Real Base Sepolia On-Chain Settlement ===")
    steady_buyer = AP2AgentIdentity(
        agent_id="agent_steady_worker",
        agent_name="Autonomous Documentation Indexer",
        owner_wallet="0x1111111111111111111111111111111111111111",
        declared_spend_limit_usd=25.0
    )
    low_mandate = AP2PaymentMandate(
        buyer_agent=steady_buyer,
        seller_agent=seller,
        cart_items=[AP2CartItem(description="Vector query index update", unit_price_usdc=3.50, quantity=1)],
        total_amount_usdc=3.50,
        destination_wallet=seller.owner_wallet,
        valid_until=datetime.now(timezone.utc) + timedelta(minutes=15)
    )

    _, norm_low, _ = watcher_agent.process_incoming_event(low_mandate.model_dump(mode="json"))
    risk_low = forecaster_agent.evaluate_mandate_risk(norm_low)
    settle_ok, dec_low = gatekeeper_agent.evaluate_and_settle(norm_low, risk_low)

    assert settle_ok is True, "Expected low-risk mandate to be approved"
    assert dec_low.status == "APPROVED", f"Status expected APPROVED, got {dec_low.status}"
    assert dec_low.tx_hash is not None, "Expected valid on-chain tx hash"
    print(f"  [PASS] Low-risk mandate APPROVED and SETTLED on Base Sepolia!")
    print(f"         Tx Hash: {dec_low.tx_hash}")
    print(f"         Block Explorer: https://sepolia.basescan.org/tx/{dec_low.tx_hash}")

    print("\n=== [2/3] Testing High-Risk Path: Circuit Breaker Quarantined (Zero Token Movement) ===")
    rogue_buyer = AP2AgentIdentity(
        agent_id="agent_compromised_runaway",
        agent_name="Unsupervised Lead Scraper (Compromised)",
        owner_wallet="0x3333333333333333333333333333333333333333",
        declared_spend_limit_usd=10.0
    )
    high_mandate = AP2PaymentMandate(
        buyer_agent=rogue_buyer,
        seller_agent=seller,
        cart_items=[AP2CartItem(description="Runaway burst extraction", unit_price_usdc=180.0, quantity=1)],
        total_amount_usdc=180.0,
        destination_wallet=seller.owner_wallet,
        valid_until=datetime.now(timezone.utc) + timedelta(minutes=15)
    )

    _, norm_high, _ = watcher_agent.process_incoming_event(high_mandate.model_dump(mode="json"))
    risk_high = forecaster_agent.evaluate_mandate_risk(norm_high)
    settle_high_ok, dec_high = gatekeeper_agent.evaluate_and_settle(norm_high, risk_high)

    assert settle_high_ok is False, "Expected high-risk mandate to be blocked"
    assert dec_high.status == "HELD", f"Status expected HELD, got {dec_high.status}"
    assert dec_high.action_taken == "QUARANTINED_CIRCUIT_BREAKER"
    assert dec_high.tx_hash is None, "CRITICAL: High-risk mandate must NOT produce an on-chain tx hash!"
    print(f"  [PASS] Circuit Breaker successfully quarantined runaway mandate!")
    print(f"         Decision Status: {dec_high.status}")
    print(f"         Action: {dec_high.action_taken}")
    print(f"         On-Chain Funds Moved: ZERO (Verified)")

    print("\n=== [3/3] Testing A2A Agent Card Pre-Clearance Query ===")
    # External test agent queries Gatekeeper prior to signing
    pre_query_safe = gatekeeper_agent.query_pre_clearance(
        buyer_agent_id="agent_steady_worker",
        amount_usdc=4.0,
        intended_service="text_embedding"
    )
    print(f"  [A2A QUERY 1 - Safe $4.00] Status: {pre_query_safe['pre_clearance_status']} (Score: {pre_query_safe['projected_risk_score']}) -> {pre_query_safe['message']}")
    assert pre_query_safe["pre_clearance_status"] == "PRE_APPROVED"

    pre_query_risky = gatekeeper_agent.query_pre_clearance(
        buyer_agent_id="agent_steady_worker",
        amount_usdc=250.0,
        intended_service="bulk_gpu_lease"
    )
    print(f"  [A2A QUERY 2 - Risky $250.00] Status: {pre_query_risky['pre_clearance_status']} (Score: {pre_query_risky['projected_risk_score']}) -> {pre_query_risky['message']}")
    assert pre_query_risky["pre_clearance_status"] == "BLOCKED"
    print("  [PASS] A2A Pre-Clearance interface verified for external agent queries.")

    print("\n------------------------------------------------------------------")
    print(">>> STAGE 4 VERIFICATION RESULT: ALL CHECKS PASSED [100%]")
    print("------------------------------------------------------------------\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
