"""
Firestore Storage Client for Wardstone AP2
Manages collections: 'mandates', 'agent_profiles', 'incidents'.
Supports live GCP Firestore and local memory persistence fallback for resilient execution.
"""

from typing import Dict, Any, List, Optional
import os
import json
from datetime import datetime, timezone
from src.config import settings

try:
    from google.cloud import firestore
    HAS_GCP_FIRESTORE = True
except ImportError:
    HAS_GCP_FIRESTORE = False


class FirestoreClient:
    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id or settings.google_cloud_project
        self.db = None
        self._local_store: Dict[str, Dict[str, Any]] = {
            "mandates": {},
            "agent_profiles": {},
            "incidents": {}
        }
        self._init_client()

    def _init_client(self):
        if HAS_GCP_FIRESTORE:
            try:
                self.db = firestore.Client(project=self.project_id)
                print(f"[FirestoreClient] Connected to GCP Firestore (Project: {self.project_id})")
                return
            except Exception as e:
                print(f"[FirestoreClient] GCP Firestore connection notice: {e}. Operating in resilient local store mode.")
        self.db = None
        print(f"[FirestoreClient] Operating in local memory store mode.")

    def save_mandate(self, mandate_id: str, data: Dict[str, Any]) -> bool:
        if self.db:
            try:
                self.db.collection("mandates").document(mandate_id).set(data)
                return True
            except Exception as e:
                print(f"[FirestoreClient] Error writing mandate to GCP: {e}")
        self._local_store["mandates"][mandate_id] = data
        return True

    def get_mandate(self, mandate_id: str) -> Optional[Dict[str, Any]]:
        if self.db:
            try:
                doc = self.db.collection("mandates").document(mandate_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                print(f"[FirestoreClient] Error reading mandate from GCP: {e}")
        return self._local_store["mandates"].get(mandate_id)

    def list_mandates(self, limit: int = 50) -> List[Dict[str, Any]]:
        if self.db:
            try:
                docs = self.db.collection("mandates").order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit).stream()
                return [d.to_dict() for d in docs]
            except Exception as e:
                print(f"[FirestoreClient] Error listing mandates: {e}")
        return list(self._local_store["mandates"].values())[-limit:]

    def save_agent_profile(self, agent_id: str, data: Dict[str, Any]) -> bool:
        if self.db:
            try:
                self.db.collection("agent_profiles").document(agent_id).set(data)
                return True
            except Exception as e:
                print(f"[FirestoreClient] Error writing profile to GCP: {e}")
        self._local_store["agent_profiles"][agent_id] = data
        return True

    def get_agent_profile(self, agent_id: str) -> Optional[Dict[str, Any]]:
        if self.db:
            try:
                doc = self.db.collection("agent_profiles").document(agent_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                print(f"[FirestoreClient] Error reading profile: {e}")
        return self._local_store["agent_profiles"].get(agent_id)

    def list_agent_profiles(self) -> List[Dict[str, Any]]:
        if self.db:
            try:
                docs = self.db.collection("agent_profiles").stream()
                return [d.to_dict() for d in docs]
            except Exception as e:
                print(f"[FirestoreClient] Error listing profiles: {e}")
        return list(self._local_store["agent_profiles"].values())

    def save_incident(self, incident_id: str, data: Dict[str, Any]) -> bool:
        if self.db:
            try:
                self.db.collection("incidents").document(incident_id).set(data)
                return True
            except Exception as e:
                print(f"[FirestoreClient] Error writing incident: {e}")
        self._local_store["incidents"][incident_id] = data
        return True

    def list_incidents(self, limit: int = 50) -> List[Dict[str, Any]]:
        if self.db:
            try:
                docs = self.db.collection("incidents").order_by("generated_at", direction=firestore.Query.DESCENDING).limit(limit).stream()
                return [d.to_dict() for d in docs]
            except Exception as e:
                print(f"[FirestoreClient] Error listing incidents: {e}")
        return list(self._local_store["incidents"].values())[-limit:]

    def get_or_init_telemetry(self) -> Dict[str, Any]:
        """Durable persistent telemetry state surviving Cloud Run scale-to-zero cycles."""
        now_iso = datetime.now(timezone.utc).isoformat()
        default_telemetry = {
            "genesis_launch_time": "2026-08-18T18:00:00Z", # Official fleet launch
            "lifetime_mandates_count": 0,
            "lifetime_settled_volume_usdc": 0.0,
            "lifetime_quarantined_count": 0,
            "lifetime_settled_count": 0,
            "lifetime_refused_count": 0,
            "last_heartbeat_time": now_iso
        }
        if self.db:
            try:
                doc = self.db.collection("system_telemetry").document("fleet_uptime").get()
                if doc.exists:
                    data = doc.to_dict()
                    for k, v in default_telemetry.items():
                        if k not in data:
                            data[k] = v
                    return data
                else:
                    try:
                        mandates = list(self.db.collection("mandates").stream())
                        mandates_count = len(mandates)
                        
                        settled = 0
                        refused = 0
                        held = 0
                        for m in mandates:
                            m_dict = m.to_dict()
                            if m_dict.get("status") == "APPROVED":
                                settled += 1
                            elif m_dict.get("status") == "REFUSED":
                                refused += 1
                            elif m_dict.get("status") == "HELD":
                                held += 1

                        default_telemetry["lifetime_mandates_count"] = mandates_count
                        default_telemetry["lifetime_quarantined_count"] = held
                        default_telemetry["lifetime_settled_count"] = settled
                        default_telemetry["lifetime_refused_count"] = refused
                    except Exception:
                        pass
                    self.db.collection("system_telemetry").document("fleet_uptime").set(default_telemetry)
                    return default_telemetry
            except Exception as e:
                print(f"[FirestoreClient] Telemetry read fallback: {e}")
        
        if "fleet_uptime" not in self._local_store.setdefault("system_telemetry", {}):
            self._local_store["system_telemetry"]["fleet_uptime"] = default_telemetry
        return self._local_store["system_telemetry"]["fleet_uptime"]

    def update_telemetry(self, mandates_delta: int = 0, volume_delta: float = 0.0, quarantined_delta: int = 0, settled_delta: int = 0, refused_delta: int = 0) -> Dict[str, Any]:
        telemetry = self.get_or_init_telemetry()
        telemetry["lifetime_mandates_count"] = telemetry.get("lifetime_mandates_count", 0) + mandates_delta
        telemetry["lifetime_settled_volume_usdc"] = round(telemetry.get("lifetime_settled_volume_usdc", 0.0) + volume_delta, 2)
        telemetry["lifetime_quarantined_count"] = telemetry.get("lifetime_quarantined_count", 0) + quarantined_delta
        telemetry["lifetime_settled_count"] = telemetry.get("lifetime_settled_count", 0) + settled_delta
        telemetry["lifetime_refused_count"] = telemetry.get("lifetime_refused_count", 0) + refused_delta
        telemetry["last_heartbeat_time"] = datetime.now(timezone.utc).isoformat()

        if self.db:
            try:
                self.db.collection("system_telemetry").document("fleet_uptime").set(telemetry)
            except Exception as e:
                print(f"[FirestoreClient] Telemetry update fallback: {e}")
        else:
            self._local_store.setdefault("system_telemetry", {})["fleet_uptime"] = telemetry
        return telemetry


firestore_client = FirestoreClient()

