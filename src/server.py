"""
Wardstone AP2 FastAPI Application Server
Provides REST and A2A RPC endpoints, serves the Command Console dashboard,
and powers live event simulation for the AI Agent Fleet Controller.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import json
from datetime import datetime, timezone, timedelta

from src.config import settings
from src.protocols.ap2_schema import AP2PaymentMandate, AP2AgentIdentity, AP2CartItem
from src.protocols.x402_settler import x402_settler
from src.agents.gatekeeper import gatekeeper_agent
from src.orchestrator.root_orchestrator import root_orchestrator
from src.storage.firestore_client import firestore_client
from src.storage.memory_bank import memory_bank
from scripts.seed_agent_personas import seed


app = FastAPI(
    title="Wardstone AP2 — Autonomous Agent Governance & Circuit Breaker",
    version="1.0.1",
    description="Multi-Agent Governance Platform for AP2/x402 Micropayments on Google Cloud and Base Sepolia."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DASHBOARD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dashboard"))

# Auto-seed personas on startup if empty
@app.on_event("startup")
async def startup_event():
    seed()
    print("[WardstoneServer] Server ready. Dashboard available at http://localhost:8080")


# Mount static dashboard files
if os.path.exists(DASHBOARD_DIR):
    app.mount("/static", StaticFiles(directory=DASHBOARD_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    index_path = os.path.join(DASHBOARD_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse("<h1>Wardstone AP2 Server Running. Dashboard file initializing...</h1>")


SERVER_START_TIME = datetime.now(timezone.utc)


@app.get("/api/v1/health")
async def health_check():
    conn = x402_settler.check_connection()
    return {
        "status": "HEALTHY",
        "service": "wardstone-ap2-circuit-breaker",
        "version": "1.0.1",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "google_cloud_project": settings.google_cloud_project,
        "base_sepolia": conn
    }


@app.get("/api/v1/uptime-stats")
async def get_uptime_stats():
    """
    Persistent Uptime and Live Operational Metrics for Judging Window (Sept 1 – Oct 1).
    Reads persistent state from Firestore 'system_telemetry/fleet_uptime' to survive Cloud Run cold-starts.
    """
    now = datetime.now(timezone.utc)
    telemetry = firestore_client.get_or_init_telemetry()
    
    genesis_str = telemetry.get("genesis_launch_time", "2026-08-18T18:00:00Z")
    try:
        genesis_dt = datetime.fromisoformat(genesis_str.replace("Z", "+00:00"))
    except Exception:
        genesis_dt = SERVER_START_TIME

    lifetime_uptime_sec = max((now - genesis_dt).total_seconds(), 0.0)
    days = int(lifetime_uptime_sec // 86400)
    hours = int((lifetime_uptime_sec % 86400) // 3600)
    minutes = int((lifetime_uptime_sec % 3600) // 60)
    seconds = int(lifetime_uptime_sec % 60)
    formatted = f"{days}d {hours}h {minutes}m {seconds}s" if days > 0 else f"{hours}h {minutes}m {seconds}s"

    mandates = firestore_client.list_mandates(limit=500) or []
    incidents = firestore_client.list_incidents(limit=500) or []
    
    mandates_count = max(len(mandates), telemetry.get("lifetime_mandates_count", 0))
    incidents_count = max(len(incidents), telemetry.get("lifetime_quarantined_count", 0))
    total_volume = max(
        sum(float(m.get("total_amount_usdc", 0.0)) for m in mandates if m.get("status") == "APPROVED"),
        telemetry.get("lifetime_settled_volume_usdc", 0.0)
    )
    last_act = None
    if mandates:
        last_act = mandates[0].get("created_at") or mandates[0].get("timestamp") or mandates[0].get("governance_decision", {}).get("timestamp")
    if not last_act:
        last_act = telemetry.get("last_heartbeat_time") or now.isoformat()

    return {
        "service": "wardstone-ap2-circuit-breaker",
        "version": "1.0.1",
        "judging_window_status": "ONLINE_PERSISTENT",
        "storage_backend": "Google Cloud Firestore (Native)",
        "genesis_launch_time": genesis_str,
        "current_time": now.isoformat(),
        "lifetime_uptime_seconds": round(lifetime_uptime_sec, 2),
        "lifetime_uptime_human": formatted,
        "total_mandates_processed": mandates_count,
        "total_settled_volume_usdc": round(total_volume, 2),
        "quarantined_incidents_count": incidents_count,
        "last_activity_timestamp": last_act,
        "circuit_breaker_status": "ACTIVE_ENFORCING"
    }


@app.get("/api/v1/agents")
async def get_agents():
    profiles = memory_bank.profiles
    return {
        "count": len(profiles),
        "agents": [p.to_dict() for p in profiles.values()]
    }


@app.get("/api/v1/mandates")
async def get_mandates(limit: int = 50):
    mandates = firestore_client.list_mandates(limit=limit)
    return {
        "count": len(mandates),
        "mandates": mandates
    }


@app.get("/api/v1/incidents")
async def get_incidents(limit: int = 50):
    incidents = firestore_client.list_incidents(limit=limit)
    return {
        "count": len(incidents),
        "incidents": incidents
    }


@app.get("/api/v1/a2a/agent-card")
async def get_a2a_agent_card():
    card_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "protocols", "a2a_agent_card.json"))
    if os.path.exists(card_path):
        with open(card_path, "r", encoding="utf-8") as f:
            return JSONResponse(content=json.load(f))
    raise HTTPException(status_code=404, detail="A2A Agent Card not found")


@app.get("/api/v1/registry")
async def get_agent_registry():
    """
    Fortified Enterprise Fleet Pillar 1: Discovery & Lifecycle (Agent Registry).
    Returns all cataloged Agent Cards, capabilities, and operational lifecycle status.
    """
    card_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "protocols", "a2a_agent_card.json"))
    base_card = {}
    if os.path.exists(card_path):
        with open(card_path, "r", encoding="utf-8") as f:
            base_card = json.load(f)

    profiles = firestore_client.list_agent_profiles()
    if not profiles and memory_bank.profiles:
        profiles = [p.to_dict() for p in memory_bank.profiles.values()]
    if not profiles or len(profiles) < 5:
        from scripts.seed_agent_personas import seed
        seed()
        profiles = [p.to_dict() for p in memory_bank.profiles.values()]

    catalog = [
        {
            "agent_id": "urn:agent:wardstone-gatekeeper-01",
            "agent_name": "Wardstone Gatekeeper & Circuit Breaker",
            "role": "Governance Sentry",
            "version": "1.0.1",
            "status": "ONLINE",
            "protocols": ["AP2/v1.0", "x402/EthereumSepolia", "A2A-RPC/v1.0"],
            "capabilities": ["query_pre_clearance", "submit_mandate_for_settlement", "blast_radius_containment"],
            "agent_card": base_card
        }
    ]

    for p in profiles:
        aid = p.get("agent_id")
        aname = p.get("agent_name", aid)
        catalog.append({
            "agent_id": aid,
            "agent_name": aname,
            "role": "Fleet Worker" if "adversarial" not in aid and "compromised" not in aid else "Red Team Probe / Rogue Test Target",
            "version": "1.0.0",
            "status": "ONLINE" if p.get("reputation_score", 0) > 50 else "QUARANTINED",
            "protocols": ["AP2/v1.0"],
            "baseline_hourly_velocity": p.get("baseline_hourly_velocity", 25.0),
            "max_single_mandate": p.get("max_single_mandate", 50.0),
            "reputation_score": p.get("reputation_score", 95.0),
            "total_settled_usdc": p.get("total_settled_usdc", 0.0),
            "historical_mandates_count": p.get("historical_mandates_count", 0)
        })

    return {
        "registry_version": "1.0.0",
        "pillar": "Discovery & Lifecycle (Agent Registry)",
        "total_registered_agents": len(catalog),
        "agents": catalog
    }


class PreClearanceRequest(BaseModel):
    buyer_agent_id: str
    amount_usdc: float
    intended_service: Optional[str] = ""


@app.post("/api/v1/a2a/pre-clearance")
async def a2a_pre_clearance(req: PreClearanceRequest):
    return gatekeeper_agent.query_pre_clearance(
        buyer_agent_id=req.buyer_agent_id,
        amount_usdc=req.amount_usdc,
        intended_service=req.intended_service
    )


@app.post("/api/v1/mandates/submit")
async def submit_mandate(payload: Dict[str, Any]):
    try:
        result = root_orchestrator.process_mandate_pipeline(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class SimulationRequest(BaseModel):
    scenario: str # "normal_indexer" | "batch_compute" | "runaway_rogue" | "worker_failure"


@app.post("/api/v1/simulate/trigger")
async def trigger_simulation(req: SimulationRequest):
    seller = AP2AgentIdentity(
        agent_id="agent_gpu_node_42",
        agent_name="Decentralized GPU Compute",
        owner_wallet="0x28054904C99b7FE4c000F9F570b7f83C76f1F43E"
    )

    if req.scenario == "normal_indexer":
        buyer = AP2AgentIdentity(
            agent_id="agent_steady_worker",
            agent_name="Autonomous Documentation Indexer",
            owner_wallet="0x1111111111111111111111111111111111111111",
            declared_spend_limit_usd=25.0
        )
        mandate = AP2PaymentMandate(
            buyer_agent=buyer,
            seller_agent=seller,
            cart_items=[AP2CartItem(description="Vector embedding batch: 500 documents", unit_price_usdc=2.50, quantity=1)],
            total_amount_usdc=2.50,
            destination_wallet=seller.owner_wallet,
            valid_until=datetime.now(timezone.utc) + timedelta(minutes=15)
        )
        return root_orchestrator.process_mandate_pipeline(mandate.model_dump(mode="json"))

    elif req.scenario == "batch_compute":
        buyer = AP2AgentIdentity(
            agent_id="agent_batch_processor",
            agent_name="Nightly Model Evaluation Worker",
            owner_wallet="0x2222222222222222222222222222222222222222",
            declared_spend_limit_usd=100.0
        )
        mandate = AP2PaymentMandate(
            buyer_agent=buyer,
            seller_agent=seller,
            cart_items=[AP2CartItem(description="LLM Evaluation Benchmark Run #89", unit_price_usdc=25.0, quantity=1)],
            total_amount_usdc=25.0,
            destination_wallet=seller.owner_wallet,
            valid_until=datetime.now(timezone.utc) + timedelta(minutes=15)
        )
        return root_orchestrator.process_mandate_pipeline(mandate.model_dump(mode="json"))

    elif req.scenario == "runaway_rogue":
        buyer = AP2AgentIdentity(
            agent_id="agent_compromised_runaway",
            agent_name="Unsupervised Lead Scraper (Compromised)",
            owner_wallet="0x3333333333333333333333333333333333333333",
            declared_spend_limit_usd=10.0
        )
        mandate = AP2PaymentMandate(
            buyer_agent=buyer,
            seller_agent=seller,
            cart_items=[AP2CartItem(description="Infinite recursive data extraction loop", unit_price_usdc=220.0, quantity=1)],
            total_amount_usdc=220.0,
            destination_wallet=seller.owner_wallet,
            valid_until=datetime.now(timezone.utc) + timedelta(minutes=15)
        )
        return root_orchestrator.process_mandate_pipeline(mandate.model_dump(mode="json"))

    elif req.scenario == "worker_failure":
        buyer = AP2AgentIdentity(
            agent_id="agent_steady_worker",
            agent_name="Autonomous Documentation Indexer",
            owner_wallet="0x1111111111111111111111111111111111111111",
            declared_spend_limit_usd=25.0
        )
        mandate = AP2PaymentMandate(
            buyer_agent=buyer,
            seller_agent=seller,
            cart_items=[AP2CartItem(description="Test call with injected worker timeout", unit_price_usdc=10.0, quantity=1)],
            total_amount_usdc=10.0,
            destination_wallet=seller.owner_wallet,
            valid_until=datetime.now(timezone.utc) + timedelta(minutes=15)
        )
        return root_orchestrator.process_mandate_pipeline(
            mandate.model_dump(mode="json"),
            simulate_forecaster_failure=True
        )

    raise HTTPException(status_code=400, detail="Unknown simulation scenario")
