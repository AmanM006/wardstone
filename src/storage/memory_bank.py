"""
Agent Engine Memory Bank Module
Provides durable cross-session memory for agent spend patterns, baseline models,
short-window burst density tracking, and adaptive Exponential Moving Average (EMA) velocity calculations.
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone, timedelta
import math
from src.protocols.ap2_schema import AP2PaymentMandate, AP2AgentIdentity
from src.storage.firestore_client import firestore_client


class AgentSpendProfile:
    def __init__(
        self,
        agent_id: str,
        agent_name: str,
        baseline_hourly_velocity: float = 25.0, # Normal average spend per hour
        max_single_mandate: float = 50.0,
        historical_mandates_count: int = 0,
        total_settled_usdc: float = 0.0,
        reputation_score: float = 95.0
    ):
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.baseline_hourly_velocity = baseline_hourly_velocity
        self.max_single_mandate = max_single_mandate
        self.historical_mandates_count = historical_mandates_count
        self.total_settled_usdc = total_settled_usdc
        self.reputation_score = reputation_score
        self.recent_transactions: List[Dict[str, Any]] = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "baseline_hourly_velocity": self.baseline_hourly_velocity,
            "max_single_mandate": self.max_single_mandate,
            "historical_mandates_count": self.historical_mandates_count,
            "total_settled_usdc": self.total_settled_usdc,
            "reputation_score": self.reputation_score,
            "recent_transactions": self.recent_transactions[-30:]
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AgentSpendProfile":
        profile = cls(
            agent_id=data["agent_id"],
            agent_name=data.get("agent_name", "Unknown Agent"),
            baseline_hourly_velocity=data.get("baseline_hourly_velocity", 25.0),
            max_single_mandate=data.get("max_single_mandate", 50.0),
            historical_mandates_count=data.get("historical_mandates_count", 0),
            total_settled_usdc=data.get("total_settled_usdc", 0.0),
            reputation_score=data.get("reputation_score", 95.0)
        )
        profile.recent_transactions = data.get("recent_transactions", [])
        return profile


class MemoryBank:
    def __init__(self):
        self.profiles: Dict[str, AgentSpendProfile] = {}
        self._load_profiles()

    def _load_profiles(self):
        records = firestore_client.list_agent_profiles()
        for rec in records:
            agent_id = rec.get("agent_id")
            if agent_id:
                self.profiles[agent_id] = AgentSpendProfile.from_dict(rec)

    def get_or_create_profile(self, identity: AP2AgentIdentity) -> AgentSpendProfile:
        if identity.agent_id not in self.profiles:
            profile = AgentSpendProfile(
                agent_id=identity.agent_id,
                agent_name=identity.agent_name,
                baseline_hourly_velocity=max(identity.declared_spend_limit_usd * 0.25, 20.0),
                max_single_mandate=identity.declared_spend_limit_usd
            )
            self.profiles[identity.agent_id] = profile
            firestore_client.save_agent_profile(identity.agent_id, profile.to_dict())
        return self.profiles[identity.agent_id]

    def record_mandate_attempt(self, mandate: AP2PaymentMandate):
        """Records an attempted/evaluated mandate into the sliding activity window."""
        profile = self.get_or_create_profile(mandate.buyer_agent)
        profile.recent_transactions.append({
            "mandate_id": mandate.mandate_id,
            "amount_usdc": mandate.total_amount_usdc,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tx_hash": None
        })
        profile.recent_transactions = profile.recent_transactions[-50:]

    def record_settled_mandate(self, mandate: AP2PaymentMandate, tx_hash: Optional[str] = None):
        profile = self.get_or_create_profile(mandate.buyer_agent)
        profile.historical_mandates_count += 1
        profile.total_settled_usdc += mandate.total_amount_usdc
        # Update existing record with tx_hash if present
        updated = False
        for tx in reversed(profile.recent_transactions):
            if tx.get("mandate_id") == mandate.mandate_id:
                tx["tx_hash"] = tx_hash
                updated = True
                break
        if not updated:
            profile.recent_transactions.append({
                "mandate_id": mandate.mandate_id,
                "amount_usdc": mandate.total_amount_usdc,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "tx_hash": tx_hash
            })
        profile.recent_transactions = profile.recent_transactions[-50:]
        firestore_client.save_agent_profile(profile.agent_id, profile.to_dict())

    def calculate_rolling_hourly_velocity(self, agent_id: str, new_mandate_amount: float = 0.0) -> float:
        profile = self.profiles.get(agent_id)
        if not profile or not profile.recent_transactions:
            return new_mandate_amount
        
        now = datetime.now(timezone.utc)
        one_hour_ago = now - timedelta(hours=1)
        
        spent_last_hour = 0.0
        for tx in profile.recent_transactions:
            try:
                tx_time = datetime.fromisoformat(tx["timestamp"])
                if tx_time >= one_hour_ago:
                    spent_last_hour += float(tx.get("amount_usdc", 0.0))
            except Exception:
                continue
                
        return spent_last_hour + new_mandate_amount

    def calculate_short_window_burst_density(
        self,
        agent_id: str,
        window_seconds: int = 300,
        new_mandate_amount: float = 0.0
    ) -> Tuple[int, float]:
        """
        Calculates transaction frequency and cumulative amount over a tight short window (e.g. 5 minutes)
        to identify adversarial 'smurfing' or rapid sub-threshold probing loops.
        """
        profile = self.profiles.get(agent_id)
        if not profile or not profile.recent_transactions:
            return 1, new_mandate_amount

        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=window_seconds)

        tx_count = 0
        tx_sum = 0.0
        for tx in profile.recent_transactions:
            try:
                tx_time = datetime.fromisoformat(tx["timestamp"])
                if tx_time >= cutoff:
                    tx_count += 1
                    tx_sum += float(tx.get("amount_usdc", 0.0))
            except Exception:
                continue

        return tx_count + 1, tx_sum + new_mandate_amount

    def calculate_adaptive_ema_velocity(
        self,
        agent_id: str,
        alpha: float = 0.25
    ) -> Tuple[float, float]:
        """
        Adaptive Forecaster Baseline: Computes standard recursive Exponential Moving Average (EMA)
        across chronologically ordered historical transaction intervals.
        Returns: (adaptive_ema_baseline, variance_sigma)
        """
        profile = self.profiles.get(agent_id)
        if not profile or len(profile.recent_transactions) < 2:
            base = profile.baseline_hourly_velocity if profile else 20.0
            return base, max(base * 0.25, 2.0)

        # Sort chronologically
        valid_txs = []
        for tx in profile.recent_transactions:
            try:
                t = datetime.fromisoformat(tx["timestamp"])
                amt = float(tx.get("amount_usdc", 0.0))
                valid_txs.append((t, amt))
            except Exception:
                continue

        valid_txs.sort(key=lambda x: x[0])
        if len(valid_txs) < 2:
            return profile.baseline_hourly_velocity, max(profile.baseline_hourly_velocity * 0.25, 2.0)

        # Compute instantaneous hourly velocity samples bounded by minimum interval of 300s (5m)
        samples = []
        for i in range(1, len(valid_txs)):
            delta_sec = max((valid_txs[i][0] - valid_txs[i-1][0]).total_seconds(), 300.0)
            amt = valid_txs[i][1]
            hourly_rate = (amt / delta_sec) * 3600.0
            samples.append(hourly_rate)

        if not samples:
            return profile.baseline_hourly_velocity, max(profile.baseline_hourly_velocity * 0.25, 2.0)

        # Recursive Exponential Moving Average (EMA)
        current_ema = profile.baseline_hourly_velocity
        for s in samples:
            current_ema = (alpha * s) + ((1.0 - alpha) * current_ema)

        # Standard deviation across samples
        variance = sum((s - current_ema) ** 2 for s in samples) / len(samples)
        sigma = math.sqrt(max(variance, 1.0))

        return round(current_ema, 2), round(sigma, 2)


memory_bank = MemoryBank()
