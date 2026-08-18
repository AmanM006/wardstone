import {
  SystemHealth,
  AgentSpendProfile,
  AP2PaymentMandate,
  ForensicIncidentReport,
  PreClearanceResponse
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

export async function fetchHealth(): Promise<SystemHealth | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch health:', err);
    return null;
  }
}

export async function fetchAgents(): Promise<AgentSpendProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.agents || [];
  } catch (err) {
    console.error('Failed to fetch agents:', err);
    return [];
  }
}

export async function fetchMandates(limit = 40): Promise<AP2PaymentMandate[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/mandates?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.mandates || [];
  } catch (err) {
    console.error('Failed to fetch mandates:', err);
    return [];
  }
}

export async function fetchIncidents(limit = 25): Promise<ForensicIncidentReport[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/incidents?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.incidents || [];
  } catch (err) {
    console.error('Failed to fetch incidents:', err);
    return [];
  }
}

export async function fetchAgentCard(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/a2a/agent-card`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch agent card:', err);
    return null;
  }
}

export async function queryPreClearance(
  buyerAgentId: string,
  amountUsdc: number,
  intendedService = ''
): Promise<PreClearanceResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/a2a/pre-clearance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_agent_id: buyerAgentId,
        amount_usdc: amountUsdc,
        intended_service: intendedService
      })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to query pre-clearance:', err);
    return null;
  }
}

export async function triggerSimulation(scenario: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/simulate/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Simulation error');
    }
    return await res.json();
  } catch (err) {
    console.error('Failed to trigger simulation:', err);
    throw err;
  }
}
