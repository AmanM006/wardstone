"""
Root Orchestrator (Google ADK Root Agent)
Supervises the Multi-Agent Nexus workflow:
1. Watcher Agent -> Ingests & normalizes
2. Forecaster Agent -> Evaluates blast radius (with Failure Recovery)
3. Gatekeeper Agent -> Applies policy & triggers settlement or hold
4. Forensics Agent -> Writes incident postmortem if held
"""

from typing import Dict, Any, Tuple, Optional
from datetime import datetime, timezone
from src.protocols.ap2_schema import (
    AP2PaymentMandate,
    RiskScoreResult,
    SettlementDecision,
    ForensicIncidentReport
)
from src.agents.watcher import watcher_agent
from src.agents.forecaster import forecaster_agent
from src.agents.gatekeeper import gatekeeper_agent
from src.agents.forensics import forensics_agent
from src.orchestrator.recovery import recovery_manager


class RootOrchestrator:
    def __init__(self, name: str = "WardstoneRootOrchestrator"):
        self.name = name

    def process_mandate_pipeline(
        self,
        raw_event: Dict[str, Any],
        simulate_forecaster_failure: bool = False
    ) -> Dict[str, Any]:
        """
        Executes the end-to-end multi-agent governance pipeline.
        """
        start_time = datetime.now(timezone.utc)
        
        # Step 1: Watcher Ingestion
        ingest_ok, mandate, msg = watcher_agent.process_incoming_event(raw_event)
        if not ingest_ok or not mandate:
            return {
                "success": False,
                "stage": "WATCHER",
                "error": msg,
                "decision": None,
                "incident": None
            }

        # Record attempt into active memory window for short-horizon burst tracking
        from src.storage.memory_bank import memory_bank
        memory_bank.record_mandate_attempt(mandate)

        # Step 2: Forecaster Evaluation (with Resilience & Recovery wrapper)
        if simulate_forecaster_failure:
            def broken_forecaster(m):
                raise TimeoutError("Simulated Forecaster worker timeout / malformed output injection")
            forecaster_func = broken_forecaster
        else:
            forecaster_func = forecaster_agent.evaluate_mandate_risk

        risk_result = recovery_manager.execute_with_fallback(
            worker_name="ForecasterAgent",
            worker_func=forecaster_func,
            mandate=mandate
        )

        # Step 3: Gatekeeper Policy Enforcement & Settlement Rail
        settled, decision = gatekeeper_agent.evaluate_and_settle(mandate, risk_result)

        # Step 4: Forensics Autopsy (if held by circuit breaker)
        incident_report = None
        if decision.status == "HELD":
            incident_report = forensics_agent.generate_incident_report(mandate, risk_result, decision)

        # Step 5: Update persistent telemetry counters in Firestore
        vol_delta = mandate.total_amount_usdc if decision.status == "APPROVED" else 0.0
        quarantined_delta = 1 if decision.status == "HELD" else 0
        from src.storage.firestore_client import firestore_client
        firestore_client.update_telemetry(
            mandates_delta=1,
            volume_delta=vol_delta,
            quarantined_delta=quarantined_delta
        )

        end_time = datetime.now(timezone.utc)
        elapsed_ms = (end_time - start_time).total_seconds() * 1000.0

        return {
            "success": True,
            "mandate_id": mandate.mandate_id,
            "buyer_agent": mandate.buyer_agent.agent_name,
            "amount_usdc": mandate.total_amount_usdc,
            "risk_score": risk_result.risk_score,
            "decision": decision.model_dump(mode="json"),
            "incident": incident_report.model_dump(mode="json") if incident_report else None,
            "elapsed_ms": round(elapsed_ms, 2)
        }


root_orchestrator = RootOrchestrator()
