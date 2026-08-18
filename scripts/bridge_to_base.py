import os
from web3 import Web3
from eth_account import Account

# Connect to Ethereum Sepolia RPC where we have 0.059 ETH
sepolia_rpc = "https://ethereum-sepolia-rpc.publicnode.com"
w3 = Web3(Web3.HTTPProvider(sepolia_rpc))

pk = os.environ.get("SETTLEMENT_PRIVATE_KEY", "0x6b44278d7b4ca5402e11b136fa54c38a61aea9bb0f282dc3bb8b9271bde4852a")
account = Account.from_key(pk)

print("Sender Address:", account.address)
bal = w3.eth.get_balance(account.address)
print(f"Sepolia Balance: {w3.from_wei(bal, 'ether')} ETH")

# Base Sepolia L1StandardBridge contract on Sepolia
BRIDGE_ADDRESS = Web3.to_checksum_address("0xfd064A18f3BF24E5037DeB2b4DA87f74360f2d5A")

# depositETH(uint32 _minGasLimit, bytes _extraData)
# Function selector: 0xb1a1a882
amount_to_bridge = w3.to_wei(0.03, 'ether')

# ABI for depositETH
bridge_abi = [
    {
        "inputs": [
            {"internalType": "uint32", "name": "_minGasLimit", "type": "uint32"},
            {"internalType": "bytes", "name": "_extraData", "type": "bytes"}
        ],
        "name": "depositETH",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
]

bridge_contract = w3.eth.contract(address=BRIDGE_ADDRESS, abi=bridge_abi)

nonce = w3.eth.get_transaction_count(account.address)
gas_price = w3.eth.gas_price

print(f"Depositing 0.03 ETH to Base Sepolia Bridge ({BRIDGE_ADDRESS})...")

tx = bridge_contract.functions.depositETH(200000, b'').build_transaction({
    'from': account.address,
    'value': amount_to_bridge,
    'gas': 150000,
    'gasPrice': int(gas_price * 1.3),
    'nonce': nonce,
    'chainId': 11155111 # Sepolia Chain ID
})

signed_tx = w3.eth.account.sign_transaction(tx, private_key=pk)
tx_hash_bytes = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
tx_hash = w3.to_hex(tx_hash_bytes)

print(f"=== BRIDGE TRANSACTION BROADCASTED ON SEPOLIA ===")
print(f"Tx Hash: {tx_hash}")
print(f"Explorer: https://sepolia.etherscan.io/tx/{tx_hash}")
print("Waiting for Base Sepolia sequencer to mint on L2 (~1-2 minutes)...")
