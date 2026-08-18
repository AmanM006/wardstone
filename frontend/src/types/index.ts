export interface AP2AgentIdentity {
  agent_id: string;
  agent_name: string;
  owner_wallet: string;
  declared_capabilities?: string[];
  declared_spend_limit_usd?: number;
}

export interface AP2CartItem {
  item_id: string;
  description: string;
  unit_price_usdc: number;
  quantity: number;
}

export interface AP2PaymentMandate {
  mandate_id: string;
  buyer_agent: AP2AgentIdentity;
  seller_agent: AP2AgentIdentity;
  cart_items: AP2CartItem[];
  total_amount_usdc: number;
  currency: string;
  destination_wallet: string;
  created_at: string;
  valid_until: string;
  status?: string;
  governance_decision?: SettlementDecision;
  risk_analysis?: RiskScoreResult;
  raw_payload?: any;
}

export interface RiskScoreResult {
  mandate_id: string;
  agent_id: string;
  risk_score: number;
  baseline_hourly_velocity: number;
  projected_velocity: number;
  velocity_variance_ratio: number;
  anomaly_flags: string[];
  confidence: number;
  calculated_at?: string;
}

export interface SettlementDecision {
  decision_id: string;
  mandate_id: string;
  agent_id: string;
  status: 'APPROVED' | 'HELD' | 'REJECTED';
  risk_score: number;
  action_taken: 'SETTLED_ON_CHAIN' | 'QUARANTINED_CIRCUIT_BREAKER' | 'ESCALATED_HUMAN';
  tx_hash?: string | null;
  block_number?: number | null;
  timestamp?: string;
}

export interface ForensicIncidentReport {
  incident_id: string;
  mandate_id: string;
  agent_id: string;
  agent_name: string;
  risk_score: number;
  attempted_amount_usdc: number;
  anomaly_summary: string;
  root_cause_explanation: string;
  affected_components: string[];
  recommended_remediation: string;
  diagram_svg?: string;
  generated_at: string;
  status: string;
}

export interface AgentSpendProfile {
  agent_id: string;
  agent_name: string;
  baseline_hourly_velocity: number;
  max_single_mandate: number;
  historical_mandates_count: number;
  total_settled_usdc: number;
  reputation_score: number;
  recent_transactions?: any[];
}

export interface BaseSepoliaHealth {
  connected: boolean;
  chain_id?: number;
  block_number?: number;
  gas_price_wei?: number;
  rpc_url?: string;
  wallet_address?: string;
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  google_cloud_project: string;
  base_sepolia: BaseSepoliaHealth;
}

export interface PreClearanceResponse {
  buyer_agent_id: string;
  intended_amount_usdc: number;
  pre_clearance_status: 'PRE_APPROVED' | 'REQUIRES_REVIEW' | 'BLOCKED';
  projected_risk_score: number;
  max_allowable_instant_mandate: number;
  message: string;
}
