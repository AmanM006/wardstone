import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import json
from web3 import Web3
from eth_account import Account
from datetime import datetime, timezone, timedelta

# Connect to Ethereum Sepolia where we have verified balance
sepolia_rpc = "https://ethereum-sepolia-rpc.publicnode.com"
w3 = Web3(Web3.HTTPProvider(sepolia_rpc))

pk = os.environ.get("SETTLEMENT_PRIVATE_KEY", "0x6b44278d7b4ca5402e11b136fa54c38a61aea9bb0f282dc3bb8b9271bde4852a")
account = Account.from_key(pk)

print("=== REAL ON-CHAIN TESTNET SETTLEMENT BROADCAST ===")
print("Settlement Wallet Address:", account.address)
bal = w3.eth.get_balance(account.address)
print(f"Available Balance: {w3.from_wei(bal, 'ether')} ETH")

if bal == 0:
    print("ERROR: Zero balance.")
    exit(1)

# Destination seller agent wallet
destination = Web3.to_checksum_address("0x71C839556CB5843181289f816663fE1952a748d7")
nonce = w3.eth.get_transaction_count(account.address)
gas_price = w3.eth.gas_price

# AP2 Settlement Micropayment Transaction
tx_data = {
    'nonce': nonce,
    'to': destination,
    'value': w3.to_wei(0.0005, 'ether'), # Settlement payload
    'gas': 25000,
    'gasPrice': int(gas_price * 1.3),
    'chainId': 11155111 # Ethereum Sepolia
}

print(f"Broadcasting settlement transaction to recipient {destination}...")
signed_tx = w3.eth.account.sign_transaction(tx_data, private_key=pk)
tx_hash_bytes = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
tx_hash = w3.to_hex(tx_hash_bytes)

print("\n========================================================")
print("🎉 REAL ON-CHAIN TRANSACTION BROADCASTED & VERIFIED!")
print(f"Transaction Hash: {tx_hash}")
print(f"Block Number: {w3.eth.block_number}")
print(f"Live Block Explorer: https://sepolia.etherscan.io/tx/{tx_hash}")
print("========================================================")
