# Frontend Migration Guide: Lens Account & On-Chain Data

## Overview

The W3RK platform has been updated to use **Lens Account addresses** (smart contracts) instead of EOA addresses, and all contract data is now stored **on-chain** (no IPFS dependency).

## Key Changes

### 1. Contract Address (Lens Chain Testnet)
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x7d2c2d6ab1F08a081E9EbCDFD8d97C42e7AF73f8
NEXT_PUBLIC_TOKEN_ADDRESS=0x0dEA5852CB2F3106C05DAc1582Da93659833A746
```

### 2. Network Configuration
- **Network**: Lens Chain Testnet
- **Chain ID**: 37111 (0x9117)
- **RPC URL**: https://rpc.testnet.lens.xyz
- **Block Explorer**: https://block-explorer.testnet.lens.xyz

### 3. Function Signature Changes

#### `createProposal` - Updated Signature
**Old**:
```typescript
createProposal(amount, freelancerAddress, ipfsHash)
```

**New**:
```typescript
createProposal(
  amount,           // BigNumber (6 decimals)
  freelancerAccount, // Lens Account address (smart contract)
  title,            // string (on-chain)
  description,      // string (on-chain)
  dueDate,          // uint256 (Unix timestamp)
  tokenAddress      // address
)
```

#### `get_all_contracts` - Updated Signature
**Old**: Reads IPFS data via `axios.get(proposal.data)`

**New**: Reads on-chain data directly via `contract.getProposal(id)` and `contract.getContract(id)`

**Parameter**: Now expects Lens Account address (not EOA address)

### 4. Lens Account Address Usage

**Important**: All contract interactions must use **Lens Account addresses** (smart contract addresses), not EOA wallet addresses.

#### Getting Lens Account Address
```typescript
// From Redux store (user profile)
const { user: userProfile } = useSelector((state: any) => state.app);
const lensAccountAddress = userProfile?.address; // This is the Lens Account address
```

#### From Lens Account Object
```typescript
const accountData = getLensAccountData(account);
// accountData.address is the Lens Account address (smart contract)
// accountData.address uses account.address || account.owner (fallback)
```

### 5. Token Decimal Handling

**MockPaymentToken uses 6 decimals** (not 18):

```typescript
// ❌ OLD (18 decimals)
ethers.parseEther(amount)

// ✅ NEW (6 decimals)
ethers.parseUnits(amount, 6)
ethers.formatUnits(balance, 6)
```

### 6. IPFS Removal

**Removed**:
- `uploadJsonToIPFS()` calls
- `axios.get(proposal.data)` for fetching IPFS data
- IPFS dependencies (optional - can remove Lighthouse SDK)

**Replaced with**:
- Direct on-chain data reading via `getProposal()` and `getContract()`
- Title, description, dueDate passed directly as parameters

### 7. Updated Files

#### Core API (`src/api.ts`)
- ✅ Network: Arbitrum Sepolia → Lens Chain Testnet
- ✅ Contract ABI: Updated to new interface
- ✅ `create_proposal`: Now accepts title, description, dueDate
- ✅ `get_all_contracts`: Reads on-chain data directly
- ✅ Token decimals: 6 instead of 18
- ✅ All functions: Use Lens Account addresses

#### Contract Modals
- ✅ `reviewContractModal.tsx`: Removed IPFS, updated function signature
- ✅ `creatContractModal.tsx`: Uses Lens Account addresses

#### Utils
- ✅ `getLensProfile.ts`: Returns `account.address` (Lens Account) instead of `account.owner` (EOA)

### 8. Environment Variables

Required environment variables:

```bash
# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0x7d2c2d6ab1F08a081E9EbCDFD8d97C42e7AF73f8
NEXT_PUBLIC_TOKEN_ADDRESS=0x0dEA5852CB2F3106C05DAc1582Da93659833A746

# Network
NEXT_PUBLIC_LENS_RPC_URL=https://rpc.testnet.lens.xyz

# Lens Chain Configuration
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_APP_ADDRESS_TESTNET=your_app_address
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 9. Critical Implementation Notes

#### ⚠️ Transaction Signing from Lens Account

The contract expects `msg.sender` to be a **Lens Account address** (smart contract). Currently, the frontend uses `ethers.BrowserProvider(window.ethereum)` which signs from the EOA wallet.

**For Lens Chain v3**, transactions should be sent through the Lens Account smart contract using account abstraction. You may need to:

1. **Use Lens Account's execute function** to forward transactions
2. **Use Lens Protocol's account abstraction** to send transactions on behalf of the Account
3. **Check Lens SDK documentation** for account abstraction patterns

**Example Pattern** (may need adjustment):
```typescript
// Instead of direct contract call:
await contract.createProposal(...)

// May need to use Lens Account's execute:
await lensAccount.execute({
  to: contractsManagerAddress,
  value: 0,
  data: contract.interface.encodeFunctionData("createProposal", [...])
})
```

#### Token Approvals from Lens Account

Since Lens Accounts hold tokens directly, approvals must be done **from the Lens Account**, not the EOA. This requires:

1. Check balance on Lens Account: `tokenContract.balanceOf(lensAccountAddress)`
2. Approval transaction must be sent **through the Lens Account** (not directly from EOA)

### 10. Testing Checklist

- [ ] Update `.env` file with new contract addresses
- [ ] Test creating proposal with Lens Account address
- [ ] Verify transactions are sent from Lens Account (not EOA)
- [ ] Test token approvals from Lens Account
- [ ] Verify on-chain data is displayed correctly (title, description, dueDate)
- [ ] Test reading contracts/proposals (no IPFS fetch errors)
- [ ] Verify network switch to Lens Chain Testnet works
- [ ] Test full workflow: create → accept → request → release

### 11. Known Issues / TODOs

1. **Transaction Signing**: Currently uses EOA signer - may need Lens Account abstraction
2. **Token Approvals**: Need to ensure approvals are done from Lens Account
3. **Event Listeners**: May need to update event names/filters for new contract
4. **Balance Checks**: Should check balance on Lens Account, not EOA

### 12. Block Explorer

View transactions on Lens Chain Block Explorer:
- Contract: https://block-explorer.testnet.lens.xyz/address/0x7d2c2d6ab1F08a081E9EbCDFD8d97C42e7AF73f8
- Transactions: https://block-explorer.testnet.lens.xyz/tx/{hash}

---

**Last Updated**: October 2024
**Migration Status**: ✅ Core updates complete, ⚠️ Lens Account transaction signing needs verification

