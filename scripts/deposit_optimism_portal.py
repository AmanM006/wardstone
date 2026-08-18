import os
import sys
from web3 import Web3
from eth_account import Account

sepolia_rpc = "https://ethereum-sepolia-rpc.publicnode.com"
w3 = Web3(Web3.HTTPProvider(sepolia_rpc))

pk = os.environ.get("SETTLEMENT_PRIVATE_KEY", "0x6b44278d7b4ca5402e11b136fa54c38a61aea9bb0f282dc3bb8b9271bde4852a")
account = Account.from_key(pk)

print("Sender Address:", account.address)
bal = w3.eth.get_balance(account.address)
print(f"Current Sepolia Balance: {w3.from_wei(bal, 'ether')} ETH")

# Base Sepolia OptimismPortalProxy on Ethereum Sepolia
OPTIMISM_PORTAL = Web3.to_checksum_address("0x49fd5650b620b7359739ec12c180fe29962a2130")

portal_abi = [
    {
        "inputs": [
            {"internalType": "address", "name": "_to", "type": "address"},
            {"internalType": "uint256", "name": "_value", "type": "uint256"},
            {"internalType": "uint64", "name": "_gasLimit", "type": "uint64"},
            {"internalType": "bool", "name": "_isCreation", "type": "bool"},
            {"internalType": "bytes", "name": "_data", "type": "bytes"}
        ],
        "name": "depositTransaction",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
]

portal_contract = w3.eth.contract(address=OPTIMISM_PORTAL, abi=portal_abi)

amount = w3.to_wei(0.015, 'ether')
nonce = w3.eth.get_transaction_count(account.address)
gas_price = w3.eth.gas_price

print(f"Calling OptimismPortal.depositTransaction to mint 0.015 ETH on Base Sepolia...")

tx = portal_contract.functions.depositTransaction(
    account.address, # _to (recipient on Base Sepolia)
    amount,          # _value (amount to mint)
    100000,          # _gasLimit on L2
    False,           # _isCreation
    b''              # _data
).build_transaction({
    'from': account.address,
    'value': amount,
    'gas': 120000,
    'gasPrice': int(gas_price * 1.3),
    'nonce': nonce,
    'chainId': 11155111
})

signed_tx = w3.eth.account.sign_transaction(tx, private_key=pk)
tx_hash_bytes = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
tx_hash = w3.to_hex(tx_hash_bytes)

print(f"=== DEPOSIT TRANSACTION BROADCASTED TO OPTIMISM PORTAL ===")
print(f"Tx Hash: {tx_hash}")
print(f"Sepolia Explorer: https://sepolia.etherscan.io/tx/{tx_hash}")
