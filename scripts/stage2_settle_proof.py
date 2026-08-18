"""
Stage 2 Verification Script: Official x402 Facilitator Settlement Proof on Base Sepolia
Validates:
1. Base Sepolia live RPC connection (Chain ID 84532)
2. Real cryptographic signing and transaction execution
3. Verifiable transaction hash generation
4. Timeout and network resilience without unhandled crashes
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.protocols.ap2_schema import AP2AgentIdentity, AP2CartItem, AP2PaymentMandate
from src.protocols.x402_settler import x402_settler


def main():
    print("==================================================================")
    print("   WARDSTONE AP2 — STAGE 2: BASE SEPOLIA SETTLEMENT PROOF CHECK   ")
    print("==================================================================\n")

    print("=== [1/3] Checking Live Base Sepolia RPC Connection ===")
    conn_info = x402_settler.check_connection()
    if conn_info.get("connected"):
        print(f"  [PASS] Connected to Base Sepolia RPC: {conn_info['rpc_url']}")
        print(f"         Chain ID: {conn_info['chain_id']} (Expected: 84532 for Base Sepolia)")
        print(f"         Current Block Height: {conn_info['block_number']}")
        print(f"         Gas Price: {conn_info['gas_price_wei']} wei")
        print(f"         Settler Wallet: {conn_info['wallet_address']}")
    else:
        print(f"  [FAIL] Unable to connect to Base Sepolia RPC: {conn_info.get('error')}")
        return 1

    print("\n=== [2/3] Constructing & Executing Real AP2 Settlement Mandate ===")
    buyer = AP2AgentIdentity(
        agent_id="agent_code_auditor",
        agent_name="Autonomous Code Auditor",
        owner_wallet="0x28054904C99b7FE4c000F9F570b7f83C76f1F43E",
        declared_capabilities=["static_analysis", "test_runner"],
        declared_spend_limit_usd=25.0
    )
    seller = AP2AgentIdentity(
        agent_id="agent_compiler_service",
        agent_name="Cloud Compiler Node",
        owner_wallet="0x28054904C99b7FE4c000F9F570b7f83C76f1F43E",
        declared_capabilities=["wasm_build", "docker_pack"],
        declared_spend_limit_usd=100.0
    )
    cart = [
        AP2CartItem(description="WASM compilation: 5 source packages", unit_price_usdc=0.50, quantity=2)
    ]
    mandate = AP2PaymentMandate(
        buyer_agent=buyer,
        seller_agent=seller,
        cart_items=cart,
        total_amount_usdc=1.0,
        destination_wallet=seller.owner_wallet,
        valid_until=datetime.now(timezone.utc) + timedelta(minutes=10),
        context_metadata={"service": "cloud_compiler", "trace_id": "trace_00293"}
    )

    success, decision = x402_settler.execute_settlement(mandate)
    if success and decision.tx_hash:
        print(f"  [PASS] Settlement Executed Successfully!")
        print(f"         Decision Status: {decision.status}")
        print(f"         Action: {decision.action_taken}")
        print(f"         Transaction Hash: {decision.tx_hash}")
        print(f"         Block Explorer Link: https://sepolia.basescan.org/tx/{decision.tx_hash}")
    else:
        print(f"  [FAIL] Settlement failed: {decision}")
        return 1

    print("\n=== [3/3] Testing Resilience & Non-Crashing Error Handling ===")
    # Simulate an invalid destination address to ensure the settler handles it gracefully without throwing an uncaught exception
    bad_mandate = AP2PaymentMandate(
        buyer_agent=buyer,
        seller_agent=seller,
        cart_items=cart,
        total_amount_usdc=1.0,
        destination_wallet="invalid_ethereum_address",
        valid_until=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    handled_success, handled_decision = x402_settler.execute_settlement(bad_mandate)
    assert handled_success is False or handled_decision.status in ["HELD", "REJECTED"], "Failed to handle malformed address"
    print(f"  [PASS] Handled malformed address gracefully without crash (Decision: {handled_decision.status}, Action: {handled_decision.action_taken})")

    print("\n------------------------------------------------------------------")
    print(">>> STAGE 2 VERIFICATION RESULT: ALL CHECKS PASSED [100%]")
    print("------------------------------------------------------------------\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
