import requests, time

time.sleep(5)

# Trigger normal simulation
r = requests.post('http://127.0.0.1:8080/api/v1/simulate/trigger', json={'scenario': 'normal_indexer'}, timeout=30)
result = r.json()
new_id = result.get('mandate_id')
print('Sim result:', new_id, result.get('buyer_agent'), result.get('risk_score'))

# Check mandates
r2 = requests.get('http://127.0.0.1:8080/api/v1/mandates?limit=60')
mandates = r2.json().get('mandates', [])
print(f'Mandate count after sim: {len(mandates)}')

# Check if new mandate appears with full data
for m in mandates[:4]:
    rp = m.get('raw_payload') or {}
    mid = m.get('mandate_id') or rp.get('mandate_id', 'unknown')
    status = m.get('status', '?')
    ba = rp.get('buyer_agent', {})
    name = ba.get('agent_name', '?') if isinstance(ba, dict) else '?'
    amt = m.get('total_amount_usdc') or rp.get('total_amount_usdc', 0)
    risk = (m.get('risk_analysis') or {}).get('risk_score', 'null')
    print(f'  {mid} | {status} | {name} | ${amt} | risk={risk}')
