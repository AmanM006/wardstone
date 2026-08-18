"""
Forensics Agent (Google ADK & Real Gemini Flash Integration)
Sole Responsibility: Ingest quarantined/held payment mandates and risk telemetry,
and prompt Gemini Flash to generate a plain-English, executive-ready Causal Incident Report.
Records exact API round-trip wall-clock latency.
"""

from typing import Dict, Any, List, Optional
import os
import json
import time
from datetime import datetime, timezone
from src.config import settings
from src.protocols.ap2_schema import (
    AP2PaymentMandate,
    RiskScoreResult,
    SettlementDecision,
    ForensicIncidentReport
)
from src.storage.firestore_client import firestore_client

try:
    from google import genai
    from google.genai import types
    HAS_GENAI_SDK = True
except ImportError:
    HAS_GENAI_SDK = False


class ForensicsAgent:
    def __init__(self, name: str = "ForensicsAgent"):
        self.name = name
        self.model_name = settings.gemini_model or "gemini-2.5-flash-lite"
        self.client = None
        self._init_gemini()

    def _init_gemini(self):
        api_key = settings.gemini_api_key or os.environ.get("GEMINI_API_KEY")
        if HAS_GENAI_SDK and api_key:
            try:
                self.client = genai.Client(api_key=api_key)
                print(f"[{self.name}] Initialized Gemini Client with real API key (Model: {self.model_name})")
            except Exception as e:
                print(f"[{self.name}] Gemini Client init error: {e}")
                self.client = None
        else:
            print(f"[{self.name}] WARNING: No GEMINI_API_KEY configured.")
            self.client = None

    def generate_incident_report(
        self,
        mandate: AP2PaymentMandate,
        risk_result: RiskScoreResult,
        decision: SettlementDecision
    ) -> ForensicIncidentReport:
        """
        Calls Gemini API with live wall-clock timing and retry resiliency.
        """
        buyer_name = mandate.buyer_agent.agent_name
        buyer_id = mandate.buyer_agent.agent_id
        amount = mandate.total_amount_usdc
        risk_score = risk_result.risk_score
        flags = risk_result.anomaly_flags

        prompt = f"""
You are the Wardstone Autonomous Forensics Agent for an AI Agent Payments Fleet.
A payment mandate was quarantined by the active circuit breaker. Generate an executive, plain-English incident postmortem.

Incident Telemetry:
- Mandate ID: {mandate.mandate_id}
- Buyer Agent: {buyer_name} ({buyer_id})
- Seller Destination: {mandate.destination_wallet}
- Attempted Amount: {amount} USDC
- Baseline Hourly Velocity: ${risk_result.baseline_hourly_velocity}/hr
- Projected Velocity: ${risk_result.projected_velocity}/hr ({risk_result.velocity_variance_ratio}x baseline)
- Risk Score: {risk_score}/100
- Anomaly Flags: {', '.join(flags)}

Generate a structured JSON response with:
1. "anomaly_summary": A one-sentence executive summary of what went wrong.
2. "root_cause_explanation": A concise 2-3 paragraph plain-English breakdown of why this mandate was quarantined, explaining the statistical velocity spike, single-mandate ratio, and potential rogue loop behavior.
3. "affected_components": List of affected agent tools or wallet resources.
4. "recommended_remediation": Specific corrective action for the AI Agent Fleet Controller.

Respond strictly with valid JSON.
"""
        if not self.client:
            raise ValueError("Cannot generate forensic autopsy: GEMINI_API_KEY is not configured or client failed to initialize.")

        start_time = time.perf_counter()
        
        # Prioritize compliant Gemini 3.5 series with resilient cascade fallbacks
        models_to_try = [self.model_name, "gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash"]
        # deduplicate while preserving order
        seen = set()
        models = [m for m in models_to_try if not (m in seen or seen.add(m))]

        last_error = None
        for m in models:
            try:
                response = self.client.models.generate_content(
                    model=m,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2
                    )
                )
                elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                print(f"[{self.name}] Real Gemini API ({m}) Call Completed in {elapsed_ms:.1f}ms (Wall-clock latency)")

                if not response or not response.text:
                    raise ValueError(f"Empty response received from Gemini API ({m})")

                parsed = json.loads(response.text)
                summary = parsed.get("anomaly_summary", "Quarantined by automated circuit breaker.")
                explanation = parsed.get("root_cause_explanation", "Velocity limit exceeded.")
                remediation = parsed.get("recommended_remediation", "Throttle agent spend cap.")
                affected = parsed.get("affected_components", [buyer_id, mandate.destination_wallet])

                if isinstance(remediation, list):
                    remediation = " ".join(str(x) for x in remediation)
                if isinstance(explanation, list):
                    explanation = " ".join(str(x) for x in explanation)
                if isinstance(summary, list):
                    summary = " ".join(str(x) for x in summary)

                report = ForensicIncidentReport(
                    mandate_id=mandate.mandate_id,
                    agent_id=buyer_id,
                    agent_name=buyer_name,
                    risk_score=risk_score,
                    attempted_amount_usdc=amount,
                    anomaly_summary=summary,
                    root_cause_explanation=explanation,
                    affected_components=affected,
                    recommended_remediation=remediation,
                    status="ACTIVE_HOLD"
                )

                # Save incident to Firestore collection 'incidents'
                firestore_client.save_incident(report.incident_id, report.model_dump(mode="json"))
                return report

            except Exception as err:
                print(f"[{self.name}] Notice: model {m} attempt encountered: {err}. Trying resilient backup...")
                last_error = err

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        raise last_error or RuntimeError(f"All Gemini models failed after {elapsed_ms:.1f}ms")


forensics_agent = ForensicsAgent()
