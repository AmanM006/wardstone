import requests, json

print('=== 1. FETCH INCIDENTS ===')
r0 = requests.get('http://localhost:8080/api/v1/incidents')
incidents = r0.json().get('incidents', [])
if not incidents:
    print('No incidents found.')
    exit()
    
target_inc = incidents[0]['incident_id']
target_mand = incidents[0]['mandate_id']
print(f'Target Incident: {target_inc}')

print('\n=== 2. RAW REQUEST ===')
payload = {'incident_id': target_inc, 'mandate_id': target_mand, 'action': 'FORCE_APPROVE'}
print(json.dumps(payload, indent=2))

print('\n=== 3. RAW RESPONSE ===')
r1 = requests.post('http://localhost:8080/api/v1/incidents/override', json=payload)
print(json.dumps(r1.json(), indent=2))

print('\n=== 4. READ-BACK (Verify Status Change) ===')
r2 = requests.get('http://localhost:8080/api/v1/incidents')
updated_incs = r2.json().get('incidents', [])
for i in updated_incs:
    if i['incident_id'] == target_inc:
        print(f'Incident {target_inc} status: {i.get("status")}')
