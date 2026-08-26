import requests, json

r = requests.get('http://127.0.0.1:8080/api/v1/mandates?limit=60')
data = r.json()
mandates = data.get('mandates', [])
print(f'Total mandates returned: {len(mandates)}')
for m in mandates:
    rp = m.get('raw_payload') or m
    mid = m.get('mandate_id') or rp.get('mandate_id', '?')
    amt = rp.get('total_amount_usdc', 0)
    status = m.get('status', '?')
    created = rp.get('created_at', '?')
    print(f'  {mid} | {status} | ${amt} | {created}')
