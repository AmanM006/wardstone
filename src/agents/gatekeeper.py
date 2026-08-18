"""
Gatekeeper Agent (Google ADK)
Sole Responsibility: Enforces governance policy thresholds on evaluated risk scores.
Low-risk (<60) -> Authorizes on-chain Base Sepolia x402 settlement.
High-risk (>=60) -> Trips Circuit Breaker, locks transaction (zero funds moved), and forwards to Forensics.
Exposes A2A Agent Card pre-clearance query interface for external buyer agents.
"""

from typing import Dict, Any, Tuple, Optional
import json
from datetime import datetime, timezone
from src.config import settings
from src.protocols.ap2_schema import (
    AP2PaymentMandate,
    RiskScoreResult,
    SettlementDecision
)
from src.protocols.x402_settler import x402_settler
from src.storage.memory_bank import memory_bank
from src.storage.firestore_client import firestore_client


class GatekeeperAgent:
    def __init__(self, name: str = "GatekeeperAgent"):
        self.name = name
        self.threshold_hold = settings.risk_threshold_hold

    def query_pre_clearance(self, buyer_agent_id: str, amount_usdc: float, intended_service: str = "") -> Dict[str, Any]:
        """
        A2A RPC endpoint allowing external buyer agents to query pre-clearance
        prior to signing and committing an expensive payment mandate.
        """
        profile = memory_bank.profiles.get(buyer_agent_id)
        if not profile:
            return {
                "pre_clearance_status": "REQUIRES_REVIEW",
                "projected_risk_score": 50.0,
                "max_allowable_instant_mandate": 25.0,
                "message": "Unregistered agent identity. Initial mandates subjected to standard review."
            }

        # Projected velocity
        projected_vel = memory_bank.calculate_rolling_hourly_velocity(buyer_agent_id, new_mandate_amount=amount_usdc)
        variance_ratio = projected_vel / max(profile.baseline_hourly_velocity, 1.0)
        single_ratio = amount_usdc / max(profile.max_single_mandate, 1.0)

        projected_score = 10.0 + min(single_ratio * 30.0, 45.0) + min(max(variance_ratio - 1.0, 0.0) * 15.0, 45.0)
        if single_ratio > 3.0 or variance_ratio > 5.0:
            projected_score = max(projected_score, 85.0)

        if projected_score < self.threshold_hold:
            status = "PRE_APPROVED"
            msg = "Mandate parameters within normal baseline limits. Instant settlement available."
        else:
            status = "BLOCKED"
            msg = f"Projected mandate risk score ({projected_score:.1f}) exceeds policy threshold ({self.threshold_hold}). Mandate would be quarantined."

        return {
            "buyer_agent_id": buyer_agent_id,
            "intended_amount_usdc": amount_usdc,
            "pre_clearance_status": status,
            "projected_risk_score": round(projected_score, 1),
            "max_allowable_instant_mandate": round(profile.max_single_mandate * 1.5, 2),
            "message": msg
        }

    def evaluate_and_settle(
        self,
        mandate: AP2PaymentMandate,
        risk_result: RiskScoreResult
    ) -> Tuple[bool, SettlementDecision]:
        """
        Applies policy threshold:
        - If score < 60: settles on Base Sepolia and updates Memory Bank.
        - If score >= 60: halts settlement immediately (circuit breaker quarantine).
        """
        score = risk_result.risk_score
        
        # Policy Check: Circuit Breaker Trip Condition
        if score >= self.threshold_hold:
            print(f"[{self.name}] [CIRCUIT BREAKER TRIPPED] Mandate {mandate.mandate_id} Risk: {score}/100 >= Threshold: {self.threshold_hold}")
            decision = SettlementDecision(
                mandate_id=mandate.mandate_id,
                agent_id=mandate.buyer_agent.agent_id,
                status="HELD",
                risk_score=score,
                action_taken="QUARANTINED_CIRCUIT_BREAKER",
                tx_hash=None
            )
            # Update Firestore record
            firestore_client.save_mandate(mandate.mandate_id, {
                "status": "HELD",
                "governance_decision": decision.model_dump(mode="json"),
                "risk_analysis": risk_result.model_dump(mode="json")
            })
            return False, decision

        # Low-Risk: Proceed with Real Base Sepolia On-Chain Settlement
        print(f"[{self.name}] [APPROVED] Mandate {mandate.mandate_id} Risk: {score}/100 < Threshold: {self.threshold_hold}. Proceeding to x402 settlement...")
        settle_ok, decision = x402_settler.execute_settlement(mandate)
        
        decision.risk_score = score
        decision.status = "APPROVED" if settle_ok else "HELD"
        
        # Update Memory Bank with settled transaction
        if settle_ok and decision.tx_hash:
            memory_bank.record_settled_mandate(mandate, tx_hash=decision.tx_hash)

        firestore_client.save_mandate(mandate.mandate_id, {
            "status": decision.status,
            "governance_decision": decision.model_dump(mode="json"),
            "risk_analysis": risk_result.model_dump(mode="json")
        })

        return settle_ok, decision


gatekeeper_agent = GatekeeperAgent()
