import os
import json
from google.cloud import firestore, pubsub_v1

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'C:\Users\aman\Downloads\agent-505917-96712a8c42b2.json'
PROJECT_ID = 'agent-505917'

print("--- 1. TESTING REAL GCP FIRESTORE ---")
db = firestore.Client(project=PROJECT_ID)
doc_ref = db.collection('wardstone_verification').document('live_check')
doc_ref.set({
    'status': 'VERIFIED_REAL_GCP',
    'project': PROJECT_ID,
    'timestamp': '2026-08-18T23:38:00Z'
})
snap = doc_ref.get()
print("Firestore Read Document:", snap.to_dict())

print("\n--- 2. TESTING REAL GCP PUBSUB ---")
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, 'mandate-events')
try:
    topic = publisher.create_topic(request={'name': topic_path})
    print("Created Pub/Sub Topic:", topic.name)
except Exception as e:
    print("Pub/Sub Topic Status:", str(e))

future = publisher.publish(topic_path, b'{"event": "wardstone_live_check"}')
msg_id = future.result()
print("Pub/Sub Real Message Published! Message ID:", msg_id)
