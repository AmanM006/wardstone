import os
import sys

# Ensure the app context is available
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.storage.firestore_client import firestore_client

def test_ledger_closure_invariant():
    """
    Verifies that total_mandates_processed == total_settled + total_held + total_refused
    based on the current Firestore / local store state.
    """
    telemetry = firestore_client.get_or_init_telemetry()
    
    total_processed = telemetry.get("lifetime_mandates_count", 0)
    total_settled = telemetry.get("lifetime_settled_count", 0)
    total_held = telemetry.get("lifetime_quarantined_count", 0)
    total_refused = telemetry.get("lifetime_refused_count", 0)
    
    print(f"Total Processed: {total_processed}")
    print(f"Total Settled: {total_settled}")
    print(f"Total Held: {total_held}")
    print(f"Total Refused: {total_refused}")
    
    assert total_processed == total_settled + total_held + total_refused, (
        f"Invariant violation: {total_processed} != {total_settled} + {total_held} + {total_refused}"
    )
