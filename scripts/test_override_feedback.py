import os
import sys
import time
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.protocols.ap2_schema import AP2AgentIdentity, AP2PaymentMandate, AP2CartItem
from src.orchestrator.root_orchestrator import root_orchestrator
from scripts.seed_agent_personas import seed

def test_override_feedback():
    print("=== OVERRIDE FEEDBACK LOOP TEST ===")
    seed()
    
    ag = AP2AgentIdentity(agent_id="agent_steady_worker", agent_name="Sybil Node A", owner_wallet="0x1111")
    from src.storage.memory_bank import memory_bank
    p = memory_bank.get_or_create_profile(ag)
    
    # Send a runaway mandate to trip circuit breaker
    print("Step 1: Send large mandate to trip circuit breaker...")
    mandate = AP2PaymentMandate(
        buyer_agent=ag,
        seller_agent=AP2AgentIdentity(agent_id="target", agent_name="Target", owner_wallet="0xTARGET"),
        cart_items=[AP2CartItem(description="Data fragment", unit_price_usdc=200.0, quantity=1)],
        total_amount_usdc=200.0,
        destination_wallet="0xTARGET",
        valid_until=(datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    )
    
    res1 = root_orchestrator.process_mandate_pipeline(mandate.model_dump(mode="json"))
    incident_id = res1.get("incident", {}).get("incident_id")
    print(f" -> Incident generated! ID: {incident_id}")
    
    # Step 2: Force Approve it
    print("Step 2: Fleet Controller Force-Approves the incident...")
    from src.server import override_incident, OverrideRequest
    import asyncio
    
    req = OverrideRequest(
        incident_id=incident_id,
        mandate_id=mandate.mandate_id,
        action="FORCE_APPROVE"
    )
    asyncio.run(override_incident(req))
    print(" -> Override saved to Institutional Memory.")
    
    # Step 3: Send another similar mandate
    print("Step 3: Send second large mandate to trigger Forensics again...")
    mandate2 = AP2PaymentMandate(
        buyer_agent=ag,
        seller_agent=AP2AgentIdentity(agent_id="target", agent_name="Target", owner_wallet="0xTARGET"),
        cart_items=[AP2CartItem(description="Data fragment", unit_price_usdc=200.0, quantity=1)],
        total_amount_usdc=200.0,
        destination_wallet="0xTARGET",
        valid_until=(datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    )
    
    res2 = root_orchestrator.process_mandate_pipeline(mandate2.model_dump(mode="json"))
    print(" -> Incident generated!")
    print(" -> Raw Anomaly Summary:", res2["incident"].get("anomaly_summary"))
    print(" -> Note: The Forensics Agent (LLM) should have incorporated the override context. Check the logs above for the prompt.")
    
if __name__ == "__main__":
    test_override_feedback()
