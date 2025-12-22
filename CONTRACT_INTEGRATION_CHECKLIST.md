# Contract Integration Checklist

**Date**: December 2024
**New Contract Proxy**: `0xb27288722f4bF33CE962Bdcc0D993d15230070B0`
**New Implementation**: `0xf45CcB874Cb1dd290a877133520b5c9F011cE941`
**Token Address**: `0xfa0b2925eC86370DCA72cF9e4D78e0b8E6B60a82` (unchanged)

---

## Critical Changes

### 1. Contract Address Update

The old proxy (`0x7d2c2d6ab1F08a081E9EbCDFD8d97C42e7AF73f8`) had **corrupted storage** from an upgrade. A new proxy was deployed.

| File | Current Value | New Value |
|------|---------------|-----------|
| `.env` | `0x7d2c2d6ab1F08a081E9EbCDFD8d97C42e7AF73f8` | `0xb27288722f4bF33CE962Bdcc0D993d15230070B0` |

**Action**:
```bash
# Update .env
sed -i '' 's/0x7d2c2d6ab1F08a081E9EbCDFD8d97C42e7AF73f8/0xb27288722f4bF33CE962Bdcc0D993d15230070B0/g' .env
```

---

### 2. ABI Update

Copy the updated ABI from the contracts repo:

```bash
cp /Users/mennaaboelnaga/Downloads/w3rk/recent-repos/contracts/artifacts-zk/contracts/ContractsManager.sol/ContractsManager.json \
   /Users/mennaaboelnaga/Downloads/w3rk/recent-repos/app/src/contracts/ContractsManager.json
```

**Key ABI Changes**:
- `createProposal` now takes 6 arguments (was 4 in some versions)
- Proposal struct has `tokenAddress` field
- ContractDetails struct has `tokenAddress` field
- Field names: `clientAccount`, `freelancerAccount` (not `client`, `freelancer`)

---

### 3. Code Review - Already Updated

The following files appear **already updated** for the new contract:

| File | Status | Notes |
|------|--------|-------|
| `src/api.ts` | ✅ Good | Uses 6-arg `createProposal`, reads `clientAccount`/`freelancerAccount` |
| `src/views/my-contract/modals/reviewContractModal.tsx` | ✅ Good | Passes all 6 args to `create_proposal` |
| `src/views/my-contract/modals/creatContractModal.tsx` | ✅ Good | Uses Lens Account addresses |
| `src/types/types.ts` | ✅ Good | Types match expected structure |

---

### 4. Documentation Updates Required

| File | Action |
|------|--------|
| `WORKFLOW_EXPLANATION.md` | Update contract address on line 116 |
| `FRONTEND_MIGRATION_GUIDE.md` | Update all contract addresses |
| `UPDATE_SUMMARY.md` | Update contract addresses |

**Automated fix**:
```bash
# Update all docs
find . -name "*.md" -exec sed -i '' 's/0x7d2c2d6ab1F08a081E9EbCDFD8d97C42e7AF73f8/0xb27288722f4bF33CE962Bdcc0D993d15230070B0/g' {} \;
```

---

### 5. Fallback Token Address

In `reviewContractModal.tsx:72`, there's a hardcoded fallback:

```typescript
const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x0dEA5852CB2F3106C05DAc1582Da93659833A746";
```

This fallback is the **Unicrow address**, not a token. Should be:

```typescript
const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xfa0b2925eC86370DCA72cF9e4D78e0b8E6B60a82";
```

---

## Integration Steps

### Step 1: Update Environment Variables

```env
# .env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xb27288722f4bF33CE962Bdcc0D993d15230070B0
NEXT_PUBLIC_TOKEN_ADDRESS=0xfa0b2925eC86370DCA72cF9e4D78e0b8E6B60a82
```

### Step 2: Copy New ABI

```bash
cp ../contracts/artifacts-zk/contracts/ContractsManager.sol/ContractsManager.json \
   src/contracts/ContractsManager.json
```

### Step 3: Fix Hardcoded Fallback

In `src/views/my-contract/modals/reviewContractModal.tsx`:

```typescript
// Line 72 - Change from:
const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x0dEA5852CB2F3106C05DAc1582Da93659833A746";

// To:
const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xfa0b2925eC86370DCA72cF9e4D78e0b8E6B60a82";
```

### Step 4: Update Documentation

Run the sed command above or manually update:
- `WORKFLOW_EXPLANATION.md`
- `FRONTEND_MIGRATION_GUIDE.md`
- `UPDATE_SUMMARY.md`

### Step 5: Test

1. Start the app: `npm run dev`
2. Connect wallet
3. Create a contract proposal
4. Verify transaction succeeds on block explorer

---

## Contract Function Signatures

### createProposal (6 arguments)

```typescript
createProposal(
  amount: BigInt,           // Token amount in wei
  freelancerAccount: string, // Lens Account address (smart contract)
  title: string,            // On-chain title
  description: string,      // On-chain description
  dueDate: number,          // Unix timestamp
  tokenAddress: string      // Payment token address
)
```

### acceptProposal

```typescript
acceptProposal(
  proposalId: number,
  contractParams: {
    buyer: string,          // Client Lens Account
    seller: string,         // Freelancer Lens Account
    challengePeriod: number, // Seconds (e.g., 86400 = 1 day)
    amount: BigInt,
    paymentReference: string
  },
  amount: BigInt
)
```

### Struct Field Names

| Old Name | New Name |
|----------|----------|
| `client` | `clientAccount` |
| `freelancer` | `freelancerAccount` |

---

## Block Explorer Links

- **Proxy**: https://block-explorer.testnet.lens.xyz/address/0xb27288722f4bF33CE962Bdcc0D993d15230070B0
- **Implementation**: https://block-explorer.testnet.lens.xyz/address/0xf45CcB874Cb1dd290a877133520b5c9F011cE941
- **Token**: https://block-explorer.testnet.lens.xyz/address/0xfa0b2925eC86370DCA72cF9e4D78e0b8E6B60a82

---

## Verification Checklist

- [x] `.env` updated with new contract address
- [x] ABI file copied from contracts repo
- [x] Fallback token address fixed in `reviewContractModal.tsx`
- [x] Documentation updated
- [x] App builds without errors (`npm run build`)
- [ ] Contract calls work (create proposal, accept, etc.)
