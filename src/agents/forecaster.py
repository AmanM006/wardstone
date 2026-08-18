"""
Forecaster Agent (Google ADK)
Sole Responsibility: Query Memory Bank for agent spend history, compute statistical
blast-radius risk score (0-100), and emit risk analysis to Gatekeeper Agent.
Does NOT make policy decisions (approve/deny). Does NOT execute settlement.
"""

from typing import Dict, Any, List, Optional
import math
from datetime import datetime, timezone
from src.protocols.ap2_schema import AP2PaymentMandate, RiskScoreResult
from src.storage.memory_bank import memory_bank


class ForecasterAgent:
    def __init__(self, name: str = "ForecasterAgent"):
        self.name = name

    def evaluate_mandate_risk(self, mandate: AP2PaymentMandate) -> RiskScoreResult:
        """
        Computes blast-radius score using statistical baseline deviation and velocity projections.
        """
        buyer_id = mandate.buyer_agent.agent_id
        profile = memory_bank.get_or_create_profile(mandate.buyer_agent)
        
        amount = mandate.total_amount_usdc
        baseline_velocity = max(profile.baseline_hourly_velocity, 1.0)
        declared_limit = max(mandate.buyer_agent.declared_spend_limit_usd, 1.0)
        
        # 1. Calculate projected rolling hourly velocity
        projected_velocity = memory_bank.calculate_rolling_hourly_velocity(buyer_id, new_mandate_amount=amount)
        
        # 2. Compute variance ratios
        velocity_variance_ratio = projected_velocity / baseline_velocity
        single_mandate_ratio = amount / declared_limit
        
        anomaly_flags: List[str] = []
        
        # 3. Detect anomaly conditions
        if single_mandate_ratio > 1.0:
            anomaly_flags.append(f"EXCEEDS_DECLARED_LIMIT_{single_mandate_ratio:.1f}X")
        if single_mandate_ratio > 3.0:
            anomaly_flags.append("CRITICAL_SINGLE_MANDATE_SPIKE")
            
        if velocity_variance_ratio > 2.0:
            anomaly_flags.append(f"HOURLY_VELOCITY_BURST_{velocity_variance_ratio:.1f}X")
        if velocity_variance_ratio > 5.0:
            anomaly_flags.append("RUNAWAY_RECURSIVE_LOOP_DETECTED")
            
        # 4. Multi-factor Risk Score Formula (0 to 100)
        # Base factor: 20 points
        # Single mandate impact: up to 40 points
        # Velocity acceleration: up to 40 points
        single_component = min(single_mandate_ratio * 30.0, 45.0)
        velocity_component = min(max(velocity_variance_ratio - 1.0, 0.0) * 15.0, 45.0)
        
        raw_score = 10.0 + single_component + velocity_component
        
        # Severe penalty for critical anomalies
        if "RUNAWAY_RECURSIVE_LOOP_DETECTED" in anomaly_flags:
            raw_score = max(raw_score, 88.0)
        if "CRITICAL_SINGLE_MANDATE_SPIKE" in anomaly_flags:
            raw_score = max(raw_score, 82.0)
            
        final_score = min(max(round(raw_score, 1), 5.0), 99.0)
        
        result = RiskScoreResult(
            mandate_id=mandate.mandate_id,
            agent_id=buyer_id,
            risk_score=final_score,
            baseline_hourly_velocity=round(baseline_velocity, 2),
            projected_velocity=round(projected_velocity, 2),
            velocity_variance_ratio=round(velocity_variance_ratio, 2),
            anomaly_flags=anomaly_flags,
            confidence=0.96
        )
        
        print(f"[{self.name}] Evaluated {mandate.mandate_id} -> Risk Score: {final_score}/100 (Variance: {velocity_variance_ratio:.2f}x, Flags: {anomaly_flags})")
        return result


forecaster_agent = ForecasterAgent()
