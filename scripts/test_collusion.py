import sys
import os
import time
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.protocols.ap2_schema import AP2AgentIdentity, AP2PaymentMandate, AP2CartItem
from src.orchestrator.root_orchestrator import root_orchestrator
from scripts.seed_agent_personas import seed

def test_collusion():
    print("=== CROSS-AGENT COLLUSION TEST ===")
    seed()
    
    # Same destination
    destination = "0x0000000000000000000000000000000000000001"
    
    agents = [
        AP2AgentIdentity(agent_id="agent_steady_worker", agent_name="Sybil Node A", owner_wallet="0x1111"),
        AP2AgentIdentity(agent_id="agent_batch_processor", agent_name="Sybil Node B", owner_wallet="0x2222"),
        AP2AgentIdentity(agent_id="agent_subagent_coordinator", agent_name="Sybil Node C", owner_wallet="0x3333")
    ]
    
    # Each agent sends a tiny amount (e.g., $40) that normally wouldn't trip a $50 static limit
    for i, ag in enumerate(agents):
        amt = 40.0
        print(f"Step {i+1}: {ag.agent_name} sends ${amt} to target...")
        mandate = AP2PaymentMandate(
            buyer_agent=ag,
            seller_agent=AP2AgentIdentity(agent_id="target_node", agent_name="Target", owner_wallet="0xTARGET"),
            cart_items=[AP2CartItem(description="Data fragment", unit_price_usdc=amt, quantity=1)],
            total_amount_usdc=amt,
            destination_wallet=destination,
            valid_until=(datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
        )
        
        res = root_orchestrator.process_mandate_pipeline(mandate.model_dump(mode="json"))
        dec = res.get("decision", {})
        score = res.get("risk_score")
        print(f" -> Score: {score} | Status: {dec.get('status')} | Action: {dec.get('action_taken')}")
        
        if res.get("incident"):
            print(" -> Incident generated! Summary:", res["incident"].get("anomaly_summary"))

if __name__ == "__main__":
    test_collusion()
