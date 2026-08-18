"""
Wardstone AP2 — Adversarial Smurfing & Sub-Threshold Probe Verification
Tests whether the Forecaster and Gatekeeper detect an adversarial agent attempting rapid,
sub-threshold micropayments designed to evade single-mandate static spend caps.
"""

import sys
import os
import time
from datetime import datetime, timezone, timedelta

# Ensure src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.protocols.ap2_schema import AP2AgentIdentity, AP2PaymentMandate, AP2CartItem
from src.orchestrator.root_orchestrator import root_orchestrator
from src.storage.memory_bank import memory_bank
from scripts.seed_agent_personas import seed


def main():
    print("========================================================================")
    print("   WARDSTONE AP2 — ITEM 2: ADVERSARIAL SMURFING RED-TEAM PROBE TEST    ")
    print("========================================================================\n")

    seed()

    # Red Team Adversarial Persona
    prober = AP2AgentIdentity(
        agent_id="agent_adversarial_prober",
        agent_name="Adversarial Sub-Threshold Smurf (Red Team)",
        owner_wallet="0x5555555555555555555555555555555555555555",
        declared_spend_limit_usd=10.0  # Static limit $10.00
    )

    seller = AP2AgentIdentity(
        agent_id="agent_gpu_node_42",
        agent_name="Decentralized GPU Compute",
        owner_wallet="0x71C839556CB5843181289f816663fe1952a748d7"
    )

    # Sequence of rapid sub-threshold micropayments (all individually under $10.00 cap)
    smurf_sequence = [
        {"desc": "Micro-vector query batch #1", "amount": 4.50, "delay_sec": 0.5},
        {"desc": "Micro-vector query batch #2", "amount": 4.80, "delay_sec": 0.5},
        {"desc": "Micro-vector query batch #3", "amount": 4.90, "delay_sec": 0.5},
        {"desc": "Micro-vector query batch #4", "amount": 4.90, "delay_sec": 0.5}
    ]

    print("Executing rapid sequence of sub-threshold mandates from Red-Team Prober:")
    print("Declared Single Mandate Limit: $10.00 | Baseline Hourly Velocity: $8.00/hr\n")
    print("---------------------------------------------------------------------------------------------------------")
    print(f"{'Step':<5} | {'Attempted':<10} | {'Cumulative (5m)':<17} | {'Risk Score':<11} | {'Status':<10} | {'Action Taken'}")
    print("---------------------------------------------------------------------------------------------------------")

    caught_step = None
    cumulative_amount = 0.0

    for i, step in enumerate(smurf_sequence, 1):
        amt = step["amount"]
        cumulative_amount += amt
        
        mandate = AP2PaymentMandate(
            buyer_agent=prober,
            seller_agent=seller,
            cart_items=[AP2CartItem(description=step["desc"], unit_price_usdc=amt, quantity=1)],
            total_amount_usdc=amt,
            destination_wallet=seller.owner_wallet,
            valid_until=datetime.now(timezone.utc) + timedelta(minutes=15)
        )

        res = root_orchestrator.process_mandate_pipeline(mandate.model_dump(mode="json"))
        dec = res.get("decision", {})
        score = res.get("risk_score")
        status = dec.get("status")
        action = dec.get("action_taken")

        print(f"#{i:<4} | ${amt:<9.2f} | ${cumulative_amount:<15.2f} | {score:<11.1f} | {status:<10} | {action}")

        if status == "HELD" and caught_step is None:
            caught_step = i
            print(f"\n  >>> [CIRCUIT BREAKER TRIPPED ON STEP #{i}] <<<")
            print(f"      Smurfing burst detected! Cumulative short-window amount ${cumulative_amount:.2f} exceeded threshold policy.")
            if res.get("incident"):
                inc = res["incident"]
                print(f"      Forensics Autopsy Summary: {inc.get('anomaly_summary')}")
                print(f"      Remediation: {inc.get('recommended_remediation')}\n")

        time.sleep(step["delay_sec"])

    print("---------------------------------------------------------------------------------------------------------")
    if caught_step is not None:
        print(f"RESULT: PASS — Adversarial prober was successfully intercepted and quarantined on Step #{caught_step}!")
    else:
        print("RESULT: FAIL — Adversarial prober bypassed circuit breaker!")

    return 0 if caught_step is not None else 1


if __name__ == "__main__":
    sys.exit(main())
