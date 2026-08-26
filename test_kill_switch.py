import requests, json

payload_rogue = {
    'buyer_agent': {'agent_id': 'agent_rogue_test_2', 'agent_name': 'Rogue Agent 2', 'owner_wallet': '0x111', 'declared_spend_limit_usd': 1.0},
    'seller_agent': {'agent_id': 'seller', 'agent_name': 'Seller', 'owner_wallet': '0x222'},
    'cart_items': [{'description': 'Test', 'unit_price_usdc': 1000.0, 'quantity': 1}],
    'total_amount_usdc': 1000.0,
    'destination_wallet': '0x222',
    'valid_until': '2027-01-01T00:00:00Z'
}

print('=== 1. TRIGGER REFUSAL (Missing Data) ===')
r1 = requests.post('http://localhost:8080/api/v1/mandates/submit', json=payload_rogue)
print(f'Status: {r1.json().get("decision", {}).get("status")}')

print('\n=== 2. TRIGGER REVOCATION (Massive Spike, score > 95) ===')
r2 = requests.post('http://localhost:8080/api/v1/mandates/submit', json=payload_rogue)
print(json.dumps(r2.json(), indent=2))

print('\n=== 3. THIRD ATTEMPT (Should 403 Forbidden) ===')
r3 = requests.post('http://localhost:8080/api/v1/mandates/submit', json=payload_rogue)
print(f'Status Code: {r3.status_code}')
try:
    print(json.dumps(r3.json(), indent=2))
except:
    print(r3.text)
