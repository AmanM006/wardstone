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
        if HAS_GCP_FIRESTORE and os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
            try:
                self.db = firestore.Client(project=self.project_id)
                print(f"[FirestoreClient] Connected to GCP Firestore (Project: {self.project_id})")
                return
            except Exception as e:
                print(f"[FirestoreClient] GCP Firestore connection warning: {e}. Utilizing persistent local store.")
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


firestore_client = FirestoreClient()
