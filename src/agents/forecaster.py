"""
Forecaster Agent (Google ADK)
Sole Responsibility: Query Memory Bank for agent spend history, compute statistical
blast-radius risk score (0-100) using Adaptive Exponential Moving Average (EMA) and
short-window smurfing burst density detection, and emit risk analysis to Gatekeeper Agent.
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
        Computes blast-radius score using adaptive EMA baseline deviation, rolling hourly velocity,
        and high-frequency short-window smurfing density detection.
        """
        buyer_id = mandate.buyer_agent.agent_id
        profile = memory_bank.get_or_create_profile(mandate.buyer_agent)
        
        # ITEM 1: Check for structurally missing data (brand new agent with zero prior record)
        # Note: root_orchestrator calls record_mandate_attempt BEFORE forecaster, so len is 1.
        if profile.historical_mandates_count == 0 and len(profile.recent_transactions) <= 1:
            return RiskScoreResult(
                mandate_id=mandate.mandate_id,
                agent_id=buyer_id,
                risk_score=0.0,
                baseline_hourly_velocity=0.0,
                projected_velocity=0.0,
                velocity_variance_ratio=0.0,
                anomaly_flags=["MISSING_AGENT_HISTORY"],
                confidence=0.0
            )

        amount = mandate.total_amount_usdc
        declared_limit = max(mandate.buyer_agent.declared_spend_limit_usd, 1.0)
        
        # 1. Calculate adaptive EMA baseline and dynamic sigma (Item 3)
        ema_baseline, ema_sigma = memory_bank.calculate_adaptive_ema_velocity(buyer_id)
        effective_baseline = max(ema_baseline, 1.0)
        
        # 2. Calculate projected rolling hourly velocity
        projected_velocity = memory_bank.calculate_rolling_hourly_velocity(buyer_id, new_mandate_amount=amount)
        velocity_variance_ratio = projected_velocity / effective_baseline
        single_mandate_ratio = amount / declared_limit
        
        # 3. Calculate short-window burst density for Smurfing Detection (Item 2)
        short_count, short_sum = memory_bank.calculate_short_window_burst_density(
            buyer_id, window_seconds=300, new_mandate_amount=amount
        )
        
        anomaly_flags: List[str] = []
        
        # 4. Anomaly Detection Conditions
        # Single mandate limit checks
        if single_mandate_ratio > 1.0:
            anomaly_flags.append(f"EXCEEDS_DECLARED_LIMIT_{single_mandate_ratio:.1f}X")
        if single_mandate_ratio > 3.0:
            anomaly_flags.append("CRITICAL_SINGLE_MANDATE_SPIKE")
            
        # Velocity burst checks
        if velocity_variance_ratio > 2.0:
            anomaly_flags.append(f"HOURLY_VELOCITY_BURST_{velocity_variance_ratio:.1f}X")
        if velocity_variance_ratio > 5.0:
            anomaly_flags.append("RUNAWAY_RECURSIVE_LOOP_DETECTED")

        # Smurfing & High-Frequency Probe Detection (Item 2)
        if short_count >= 3:
            anomaly_flags.append(f"HIGH_FREQUENCY_BURST_{short_count}TX_5MIN")
            if short_sum > (declared_limit * 1.2):
                anomaly_flags.append("SUB_THRESHOLD_SMURFING_ATTEMPT")

        # Adaptive EMA Statistical Deviation (Item 3)
        z_score = max((projected_velocity - ema_baseline) / ema_sigma, 0.0)
        if z_score >= 3.0:
            anomaly_flags.append(f"ADAPTIVE_EMA_DEVIATION_{z_score:.1f}SIGMA")
            
        # 5. Multi-factor Risk Score Formula (0 to 100)
        single_component = min(single_mandate_ratio * 30.0, 45.0)
        velocity_component = min(max(velocity_variance_ratio - 1.0, 0.0) * 15.0, 45.0)
        smurf_component = min(max((short_sum / declared_limit) - 1.0, 0.0) * 30.0, 40.0) if short_count >= 3 else 0.0
        
        raw_score = 10.0 + single_component + velocity_component + smurf_component
        
        # Penalties for critical anomaly flags
        if "RUNAWAY_RECURSIVE_LOOP_DETECTED" in anomaly_flags:
            raw_score = max(raw_score, 88.0)
        if "CRITICAL_SINGLE_MANDATE_SPIKE" in anomaly_flags:
            raw_score = max(raw_score, 82.0)
        if "SUB_THRESHOLD_SMURFING_ATTEMPT" in anomaly_flags:
            raw_score = max(raw_score, 74.0) # Elevated above the 60.0 HOLD threshold
            
        final_score = min(max(round(raw_score, 1), 5.0), 99.0)
        
        # Pillar 1: Zero-Trust Penalty (Fixing the Risk Math)
        # Instead of artificially lowering risk for unknown agents, we penalize them until they establish a baseline.
        approvals = profile.historical_mandates_count
        if approvals < 5:
            # 1.5x risk multiplier for unproven agents
            effective_risk_score = min(final_score * 1.5, 99.0)
            anomaly_flags.append("ZERO_TRUST_PENALTY")
            print(f"[{self.name}] Applying Zero-Trust Penalty (History: {approvals} < 5). Adjusted Score: {effective_risk_score:.1f}")
        else:
            # Stable baseline achieved
            effective_risk_score = final_score

        result = RiskScoreResult(
            mandate_id=mandate.mandate_id,
            agent_id=buyer_id,
            risk_score=effective_risk_score,
            baseline_hourly_velocity=round(effective_baseline, 2),
            projected_velocity=round(projected_velocity, 2),
            velocity_variance_ratio=round(velocity_variance_ratio, 2),
            anomaly_flags=anomaly_flags,
            confidence=round((approvals + 2) / (approvals + profile.historical_rejected_count + 3), 3)
        )
        
        print(f"[{self.name}] Evaluated {mandate.mandate_id} -> Risk Score: {final_score}/100 (EMA Baseline: ${effective_baseline:.1f}/hr, Variance: {velocity_variance_ratio:.2f}x, Flags: {anomaly_flags})")
        return result


forecaster_agent = ForecasterAgent()
