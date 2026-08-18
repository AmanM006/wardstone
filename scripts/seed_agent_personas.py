"""
Seed Agent Personas for Wardstone AP2 Memory Bank
Creates 3 realistic agent personas with distinct spending baselines and transaction histories.
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure src is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.protocols.ap2_schema import AP2AgentIdentity
from src.storage.memory_bank import memory_bank, AgentSpendProfile
from src.storage.firestore_client import firestore_client


def seed():
    print("================================================================")
    print("   WARDSTONE AP2 — SEEDING AGENT MEMORY BANK PERSONAS          ")
    print("================================================================\n")

    now = datetime.now(timezone.utc)
    
    # 1. Steady Worker Agent
    p1 = AgentSpendProfile(
        agent_id="agent_steady_worker",
        agent_name="Autonomous Documentation Indexer",
        baseline_hourly_velocity=15.0,
        max_single_mandate=25.0,
        historical_mandates_count=42,
        total_settled_usdc=210.0,
        reputation_score=98.5
    )
    # Add historical small transactions
    for i in range(10):
        p1.recent_transactions.append({
            "mandate_id": f"mandate_steady_{i}",
            "amount_usdc": 1.5 + (i % 3) * 0.5,
            "timestamp": (now - timedelta(minutes=i * 5)).isoformat(),
            "tx_hash": f"0xsteady{i}abcdef1234567890"
        })
    firestore_client.save_agent_profile(p1.agent_id, p1.to_dict())
    memory_bank.profiles[p1.agent_id] = p1
    print(f"  [SEED] 1. {p1.agent_name} ({p1.agent_id}): Baseline Velocity = ${p1.baseline_hourly_velocity}/hr, Max Single = ${p1.max_single_mandate}")

    # 2. Batch Compute Agent
    p2 = AgentSpendProfile(
        agent_id="agent_batch_processor",
        agent_name="Nightly Model Evaluation Worker",
        baseline_hourly_velocity=50.0,
        max_single_mandate=100.0,
        historical_mandates_count=18,
        total_settled_usdc=750.0,
        reputation_score=94.0
    )
    for i in range(5):
        p2.recent_transactions.append({
            "mandate_id": f"mandate_batch_{i}",
            "amount_usdc": 10.0 + (i % 2) * 5.0,
            "timestamp": (now - timedelta(minutes=i * 12)).isoformat(),
            "tx_hash": f"0xbatch{i}abcdef1234567890"
        })
    firestore_client.save_agent_profile(p2.agent_id, p2.to_dict())
    memory_bank.profiles[p2.agent_id] = p2
    print(f"  [SEED] 2. {p2.agent_name} ({p2.agent_id}): Baseline Velocity = ${p2.baseline_hourly_velocity}/hr, Max Single = ${p2.max_single_mandate}")

    # 3. Compromised Runaway Agent
    p3 = AgentSpendProfile(
        agent_id="agent_compromised_runaway",
        agent_name="Unsupervised Lead Scraper (Compromised)",
        baseline_hourly_velocity=5.0,
        max_single_mandate=10.0,
        historical_mandates_count=4,
        total_settled_usdc=18.0,
        reputation_score=62.0
    )
    p3.recent_transactions.append({
        "mandate_id": "mandate_rogue_0",
        "amount_usdc": 2.5,
        "timestamp": (now - timedelta(minutes=45)).isoformat(),
        "tx_hash": "0xrogue0abcdef1234567890"
    })
    firestore_client.save_agent_profile(p3.agent_id, p3.to_dict())
    memory_bank.profiles[p3.agent_id] = p3
    print(f"  [SEED] 3. {p3.agent_name} ({p3.agent_id}): Baseline Velocity = ${p3.baseline_hourly_velocity}/hr, Max Single = ${p3.max_single_mandate}")

    print("\n[SUCCESS] Memory Bank successfully seeded with 3 active agent profiles.\n")


if __name__ == "__main__":
    seed()
