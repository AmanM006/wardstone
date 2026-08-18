import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import json
from web3 import Web3
from eth_account import Account
from datetime import datetime, timezone, timedelta

from src.protocols.ap2_schema import AP2PaymentMandate, AP2AgentIdentity, AP2CartItem
from src.protocols.x402_settler import x402_settler

print("=== WARDSTONE AP2 REAL BASE SEPOLIA SETTLEMENT TEST ===")

conn = x402_settler.check_connection()
print("RPC Connection:", conn)

if not conn.get("connected"):
    print("ERROR: Not connected to Base Sepolia RPC.")
    exit(1)

wallet_addr = conn.get("wallet_address")
bal = x402_settler.w3.eth.get_balance(wallet_addr)
bal_eth = x402_settler.w3.from_wei(bal, 'ether')
print(f"Settlement Wallet: {wallet_addr}")
print(f"Base Sepolia Balance: {bal_eth} ETH")

if bal == 0:
    print("\n[WAITING] Balance is still 0 ETH on Base Sepolia.")
    print("Waiting for bridge / faucet transaction to finalize...")
    exit(2)

# Create a genuine AP2 Payment Mandate
now = datetime.now(timezone.utc)
mandate = AP2PaymentMandate(
    buyer_agent=AP2AgentIdentity(
        agent_id="agent_rag_indexer",
        agent_name="Autonomous RAG Indexer",
        owner_wallet="0x28054904C99b7FE4c000F9F570b7f83C76f1F43E"
    ),
    seller_agent=AP2AgentIdentity(
        agent_id="agent_vector_seller",
        agent_name="Vector DB Compute Node",
        owner_wallet="0x71C839556CB5843181289f816663fE1952a748d7"
    ),
    cart_items=[
        AP2CartItem(
            item_id="item_chunk_500",
            description="500 Document Embeddings (1536 dim)",
            unit_price_usdc=2.50,
            quantity=1
        )
    ],
    total_amount_usdc=2.50,
    destination_wallet="0x71C839556CB5843181289f816663fE1952a748d7",
    valid_until=(now + timedelta(minutes=15)).isoformat()
)

print(f"\nBroadcasting real on-chain transaction for Mandate {mandate.mandate_id}...")
success, decision = x402_settler.execute_settlement(mandate)

print(f"\n=== REAL BROADCAST RESULT ===")
print("Success:", success)
print("Status:", decision.status)
print("Block Number:", decision.block_number)
print("Transaction Hash:", decision.tx_hash)
if decision.tx_hash:
    print(f"\n🚀 VERIFIABLE BASESCAN LINK:\nhttps://sepolia.basescan.org/tx/{decision.tx_hash}")
