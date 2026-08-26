from src.storage.firestore_client import firestore_client
import hashlib
inc = firestore_client.db.collection('incidents').document('inc_02d0dc0885').get().to_dict()
hash_input = f"{inc.get('incident_id')}:{inc.get('mandate_id')}:{inc.get('risk_score')}:{inc.get('anomaly_summary')}"
print('Actual hash_input:')
print(hash_input)
print('Recomputed hash:')
print(hashlib.sha256(hash_input.encode('utf-8')).hexdigest())
