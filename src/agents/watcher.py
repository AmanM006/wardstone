"""
Watcher Agent (Google ADK)
Sole Responsibility: Ingest incoming AP2 payment mandates from Pub/Sub, validate schemas,
persist normalized records to Firestore 'mandates' collection, and forward to Forecaster Agent.
Does NOT compute risk scores. Does NOT execute settlement.
"""

from typing import Dict, Any, Optional, Tuple
import json
from datetime import datetime, timezone
from src.protocols.ap2_schema import AP2PaymentMandate
from src.storage.firestore_client import firestore_client


class WatcherAgent:
    def __init__(self, name: str = "WatcherAgent"):
        self.name = name

    def process_incoming_event(self, raw_event_data: Dict[str, Any]) -> Tuple[bool, Optional[AP2PaymentMandate], str]:
        """
        Validates AP2 mandate structure, writes to Firestore, and emits for forecasting.
        """
        try:
            # Parse & validate strictly against AP2PaymentMandate schema
            if isinstance(raw_event_data, str):
                raw_event_data = json.loads(raw_event_data)
                
            mandate = AP2PaymentMandate(**raw_event_data)
            
            # Store in Firestore collection 'mandates'
            mandate_record = {
                "mandate_id": mandate.mandate_id,
                "buyer_agent_id": mandate.buyer_agent.agent_id,
                "buyer_agent_name": mandate.buyer_agent.agent_name,
                "seller_agent_id": mandate.seller_agent.agent_id,
                "total_amount_usdc": mandate.total_amount_usdc,
                "currency": mandate.currency,
                "destination_wallet": mandate.destination_wallet,
                "created_at": mandate.created_at.isoformat(),
                "valid_until": mandate.valid_until.isoformat(),
                "status": "INGESTED_PENDING_GOVERNANCE",
                "raw_payload": mandate.model_dump(mode="json")
            }
            
            firestore_client.save_mandate(mandate.mandate_id, mandate_record)
            print(f"[{self.name}] Ingested & normalized mandate {mandate.mandate_id} (Buyer: {mandate.buyer_agent.agent_name}, Amount: {mandate.total_amount_usdc} USDC)")
            return True, mandate, "Mandate ingested successfully"
            
        except Exception as e:
            err_msg = f"Schema validation error in Watcher: {str(e)}"
            print(f"[{self.name}] {err_msg}")
            return False, None, err_msg


watcher_agent = WatcherAgent()
