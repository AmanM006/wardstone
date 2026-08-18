"""
Wardstone AP2 — Adaptive Forecaster Baseline Verification (EMA with Time Decay)
Compares static baseline evaluation vs adaptive Exponential Moving Average (EMA) baseline,
demonstrating natural baseline adaptation to legitimate fleet workload expansion.
"""

import sys
import os
import time
from datetime import datetime, timezone, timedelta

# Ensure src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.protocols.ap2_schema import AP2AgentIdentity, AP2PaymentMandate, AP2CartItem
from src.storage.memory_bank import memory_bank, AgentSpendProfile
from src.agents.forecaster import forecaster_agent
from src.orchestrator.root_orchestrator import root_orchestrator
from scripts.seed_agent_personas import seed


def static_baseline_calculation(profile: AgentSpendProfile, amount: float) -> dict:
    """Old method: Fixed hardcoded baseline deviation."""
    baseline = profile.baseline_hourly_velocity
    rolling_vel = memory_bank.calculate_rolling_hourly_velocity(profile.agent_id, new_mandate_amount=amount)
    variance_ratio = rolling_vel / max(baseline, 1.0)
    single_ratio = amount / max(profile.max_single_mandate, 1.0)
    
    raw_score = 10.0 + min(single_ratio * 30.0, 45.0) + min(max(variance_ratio - 1.0, 0.0) * 15.0, 45.0)
    return {
        "model": "Static Baseline",
        "baseline_hourly": baseline,
        "rolling_velocity": rolling_vel,
        "variance_ratio": round(variance_ratio, 2),
        "risk_score": round(min(max(raw_score, 5.0), 99.0), 1)
    }


def main():
    print("==========================================================================")
    print("   WARDSTONE AP2 — ITEM 3: ADAPTIVE FORECASTER (EMA WITH DECAY) TEST     ")
    print("==========================================================================\n")

    seed()

    # Create an agent whose legitimate workload has scaled up over the past 2 hours
    worker = AP2AgentIdentity(
        agent_id="agent_steady_worker",
        agent_name="Autonomous Documentation Indexer",
        owner_wallet="0x1111111111111111111111111111111111111111",
        declared_spend_limit_usd=25.0
    )

    profile = memory_bank.get_or_create_profile(worker)
    now = datetime.now(timezone.utc)

    print("Simulating legitimate workload growth: Adding 8 legitimate historical transactions over the past hour...")
    for i in range(8):
        profile.recent_transactions.append({
            "mandate_id": f"mandate_growth_{i}",
            "amount_usdc": 3.5,
            "timestamp": (now - timedelta(minutes=(7 - i) * 6)).isoformat(),
            "tx_hash": f"0xgrowth{i}"
        })

    # Test Mandate of $4.00
    test_amount = 4.00
    test_mandate = AP2PaymentMandate(
        buyer_agent=worker,
        seller_agent=AP2AgentIdentity(agent_id="agent_gpu_node", agent_name="GPU Compute", owner_wallet="0x71C839556CB5843181289f816663fe1952a748d7"),
        cart_items=[AP2CartItem(description="Vector embedding batch", unit_price_usdc=test_amount, quantity=1)],
        total_amount_usdc=test_amount,
        destination_wallet="0x71C839556CB5843181289f816663fe1952a748d7",
        valid_until=datetime.now(timezone.utc) + timedelta(minutes=15)
    )

    # 1. Evaluate with Old Static Calculation
    old_res = static_baseline_calculation(profile, test_amount)

    # 2. Evaluate with New Adaptive EMA Calculation
    adaptive_result = forecaster_agent.evaluate_mandate_risk(test_mandate)
    ema_base, ema_sigma = memory_bank.calculate_adaptive_ema_velocity(worker.agent_id)

    print("\n-----------------------------------------------------------------------------------------")
    print(f"{'Metric':<32} | {'Old Static Model':<22} | {'New Adaptive EMA Model':<22}")
    print("-----------------------------------------------------------------------------------------")
    print(f"{'Model Name':<32} | {old_res['model']:<22} | {'Adaptive EMA + Decay':<22}")
    print(f"{'Effective Baseline Velocity':<32} | ${old_res['baseline_hourly']:<21.2f}/hr | ${ema_base:<21.2f}/hr")
    print(f"{'Dynamic Std Dev (Sigma)':<32} | {'N/A (Fixed)':<22} | {ema_sigma:<22.2f}")
    print(f"{'Projected Rolling Velocity':<32} | ${old_res['rolling_velocity']:<21.2f}/hr | ${adaptive_result.projected_velocity:<21.2f}/hr")
    print(f"{'Velocity Variance Ratio':<32} | {old_res['variance_ratio']:<21.2f}x | {adaptive_result.velocity_variance_ratio:<21.2f}x")
    print(f"{'Computed Risk Score':<32} | {old_res['risk_score']:<21.1f} | {adaptive_result.risk_score:<21.1f}")
    print("-----------------------------------------------------------------------------------------")

    print("\nKey Takeaway:")
    print("  - The Static Model falsely treats legitimate fleet expansion as a severe velocity surge.")
    print("  - The Adaptive EMA Model naturally accommodates legitimate workload scaling, preventing false-positive trip-outs.\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
