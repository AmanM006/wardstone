"""
AP2 & x402 Protocol Data Models
Defines typed schemas for Agent Payment Protocol (AP2) mandates and governance evaluations.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid


class AP2AgentIdentity(BaseModel):
    agent_id: str = Field(description="Unique A2A Agent Identifier")
    agent_name: str = Field(description="Display name of the agent")
    owner_wallet: str = Field(description="Controller Ethereum/Base wallet address")
    declared_capabilities: List[str] = Field(default_factory=list, description="Capabilities declared in A2A Agent Card")
    declared_spend_limit_usd: float = Field(default=100.0, description="Declared max single mandate spend limit")


class AP2CartItem(BaseModel):
    item_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    description: str = Field(description="Description of computation, API call, or service purchased")
    unit_price_usdc: float = Field(description="Unit price in USDC")
    quantity: int = Field(default=1, description="Quantity of service units")


class AP2PaymentMandate(BaseModel):
    mandate_id: str = Field(default_factory=lambda: f"mandate_{uuid.uuid4().hex[:12]}")
    buyer_agent: AP2AgentIdentity
    seller_agent: AP2AgentIdentity
    cart_items: List[AP2CartItem]
    total_amount_usdc: float
    currency: str = Field(default="USDC")
    destination_wallet: str = Field(description="Seller recipient address on Base Sepolia")
    nonce: int = Field(default_factory=lambda: int(datetime.now(timezone.utc).timestamp() * 1000))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    valid_until: datetime = Field(description="Expiration timestamp for the payment mandate")
    signature: Optional[str] = Field(default=None, description="Buyer agent cryptographic signature")
    context_metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata e.g. task_id, tool_name, caller_trace_id")


class RiskScoreResult(BaseModel):
    mandate_id: str
    agent_id: str
    risk_score: float = Field(ge=0.0, le=100.0, description="Blast-radius score (0 = safe, 100 = critical danger)")
    baseline_hourly_velocity: float
    projected_velocity: float
    velocity_variance_ratio: float
    anomaly_flags: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SettlementDecision(BaseModel):
    decision_id: str = Field(default_factory=lambda: f"dec_{uuid.uuid4().hex[:8]}")
    mandate_id: str
    agent_id: str
    status: str = Field(description="APPROVED | HELD | REJECTED")
    risk_score: float
    action_taken: str = Field(description="SETTLED_ON_CHAIN | QUARANTINED_CIRCUIT_BREAKER | ESCALATED_HUMAN")
    tx_hash: Optional[str] = Field(default=None, description="Base Sepolia transaction hash if settled")
    block_number: Optional[int] = Field(default=None)
    gas_used: Optional[int] = Field(default=None)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ForensicIncidentReport(BaseModel):
    incident_id: str = Field(default_factory=lambda: f"inc_{uuid.uuid4().hex[:10]}")
    mandate_id: str
    agent_id: str
    agent_name: str
    risk_score: float
    attempted_amount_usdc: float
    anomaly_summary: str
    root_cause_explanation: str
    affected_components: List[str] = Field(default_factory=list)
    recommended_remediation: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field(default="ACTIVE_HOLD", description="ACTIVE_HOLD | RESOLVED | OVERRIDDEN")
