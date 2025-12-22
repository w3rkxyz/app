# W3RK Implementation TODO

**Contract**: `0xb27288722f4bF33CE962Bdcc0D993d15230070B0`
**Token**: `0xfa0b2925eC86370DCA72cF9e4D78e0b8E6B60a82`

---

## Priority 1: Connect Lens Posts to Contracts

### 1.1 Add "Get Started" Button to ViewJobModal
**File**: `src/views/view-job-modal/view-job-modal.tsx`
**Lines**: 395-408 (button section)

Current code (line 402-407):
```tsx
<Link href={`/messages?handle=${profileData.handle}`} className="mx-auto ">
  <button className="...">Contact</button>
</Link>
```

Add "Get Started" button:
```tsx
{address && address !== profileData.address && (
  <div className="flex gap-[10px] mx-auto">
    <button
      className="w-fit py-[9px] px-[26px] text-white bg-[#351A6B] hover:bg-[#1a0d35] rounded-[9px] font-semibold"
      onClick={() => onGetStarted?.({
        title: attributes["title"],
        description: attributes["content"],
        paymentAmount: attributes["payement type"] === "hourly"
          ? attributes["hourly"]
          : attributes["fixed"],
        paymentType: attributes["payement type"],
        freelancerAddress: profileData.address, // Lens Account address
        freelancerHandle: profileData.handle,
      })}
    >
      Get Started
    </button>
    <Link href={`/messages?handle=${profileData.handle}`}>
      <button className="...">Contact</button>
    </Link>
  </div>
)}
```

Props to add:
```tsx
type Props = {
  handleCloseModal?: () => void;
  type: string;
  publication: ExtendedPost;
  onGetStarted?: (jobData: JobData) => void; // NEW
};

type JobData = {
  title: string;
  description: string;
  paymentAmount: string;
  paymentType: string;
  freelancerAddress: string;
  freelancerHandle: string;
};
```

### 1.2 Update Find Work Page
**File**: `src/views/find-work/find-work.tsx`

Add state:
```tsx
const [showContractModal, setShowContractModal] = useState(false);
const [selectedJobData, setSelectedJobData] = useState<JobData | null>(null);

const handleGetStarted = (jobData: JobData) => {
  setSelectedJobData(jobData);
  setShowContractModal(true);
  setIsModalOpen(false); // Close view job modal
};
```

Update ViewJobModal call (line 309-313):
```tsx
<ViewJobModal
  handleCloseModal={handleCloseModal}
  type="job"
  publication={selectedPublication}
  onGetStarted={handleGetStarted}
/>
```

Add contract creation modal:
```tsx
{showContractModal && selectedJobData && (
  <CreateContractFromPostModal
    jobData={selectedJobData}
    onClose={() => setShowContractModal(false)}
  />
)}
```

### 1.3 Create Contract From Post Modal
**File**: `src/views/find-work/CreateContractFromPostModal.tsx` (NEW)

```tsx
"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { create_proposal } from "@/api";
import { openLoader, openAlert, closeAlert } from "@/redux/alerts";

type JobData = {
  title: string;
  description: string;
  paymentAmount: string;
  paymentType: string;
  freelancerAddress: string;
  freelancerHandle: string;
};

type Props = {
  jobData: JobData;
  onClose: () => void;
};

const CreateContractFromPostModal = ({ jobData, onClose }: Props) => {
  const dispatch = useDispatch();
  const { user: userProfile } = useSelector((state: any) => state.app);
  const [dueDate, setDueDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default: 1 week
  );

  const handleSubmit = async () => {
    dispatch(openLoader({ displaytransactionLoader: true, text: "Creating Contract Proposal" }));

    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xfa0b2925eC86370DCA72cF9e4D78e0b8E6B60a82";
    const clientLensAccountAddress = userProfile?.address;
    const senderHandle = userProfile?.userLink;

    const hash = await create_proposal(
      jobData.paymentAmount,
      jobData.freelancerAddress,
      jobData.title,
      jobData.description,
      dueDate,
      tokenAddress,
      dispatch,
      senderHandle,
      clientLensAccountAddress
    );

    if (hash) {
      dispatch(openAlert({
        displayAlert: true,
        data: {
          variant: "Successful",
          title: "Proposal Created",
          tag1: `Contract proposal sent to ${jobData.freelancerHandle}`,
          hash,
        },
      }));
      setTimeout(() => dispatch(closeAlert()), 10000);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99992] bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-[12px] p-[24px] w-[500px] max-w-[90vw]">
        <h2 className="text-[18px] font-semibold mb-[16px]">Create Contract Proposal</h2>

        {/* Pre-filled fields (read-only display) */}
        <div className="mb-[12px]">
          <label className="text-[14px] font-medium">Title</label>
          <p className="text-[14px] text-gray-700">{jobData.title}</p>
        </div>

        <div className="mb-[12px]">
          <label className="text-[14px] font-medium">Freelancer</label>
          <p className="text-[14px] text-gray-700">{jobData.freelancerHandle}</p>
          <p className="text-[12px] text-gray-500 truncate">{jobData.freelancerAddress}</p>
        </div>

        <div className="mb-[12px]">
          <label className="text-[14px] font-medium">Payment</label>
          <p className="text-[14px] text-gray-700">
            ${jobData.paymentAmount} {jobData.paymentType === "hourly" ? "/hr" : "(Fixed)"}
          </p>
        </div>

        {/* Editable due date */}
        <div className="mb-[24px]">
          <label className="text-[14px] font-medium">Due Date</label>
          <input
            type="date"
            value={dueDate.toISOString().split("T")[0]}
            onChange={(e) => setDueDate(new Date(e.target.value))}
            className="w-full border rounded-[8px] p-[8px] mt-[4px]"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="flex gap-[12px] justify-end">
          <button
            onClick={onClose}
            className="py-[10px] px-[20px] bg-gray-200 rounded-[8px] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="py-[10px] px-[20px] bg-[#351A6B] text-white rounded-[8px] font-semibold"
          >
            Send Proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContractFromPostModal;
```

---

## Priority 2: Contract Indexing

### 2.1 Option A: The Graph Subgraph

**Location**: `/subgraph` or separate repo

Schema (`schema.graphql`):
```graphql
type Proposal @entity {
  id: ID!
  proposalId: BigInt!
  clientAccount: Bytes!
  freelancerAccount: Bytes!
  title: String!
  description: String!
  amount: BigInt!
  tokenAddress: Bytes!
  dueDate: BigInt!
  status: ProposalStatus!
  createdAt: BigInt!
  createdTx: Bytes!
}

type Contract @entity {
  id: ID!
  contractId: BigInt!
  proposal: Proposal!
  escrowId: BigInt!
  status: ContractStatus!
  createdAt: BigInt!
  completedAt: BigInt
}

enum ProposalStatus {
  PENDING
  ACCEPTED
  CANCELLED
}

enum ContractStatus {
  IN_PROGRESS
  AWAITING_APPROVAL
  COMPLETED
  CANCELLED
}
```

Mapping (`src/mapping.ts`):
```typescript
import { ProposalCreated, ProposalAccepted, ProposalCancelled } from "../generated/ContractsManager/ContractsManager";
import { Proposal, Contract } from "../generated/schema";

export function handleProposalCreated(event: ProposalCreated): void {
  let proposal = new Proposal(event.params.proposalId.toString());
  proposal.proposalId = event.params.proposalId;
  proposal.clientAccount = event.params.client;
  proposal.freelancerAccount = event.params.freelancer;
  proposal.status = "PENDING";
  proposal.createdAt = event.block.timestamp;
  proposal.createdTx = event.transaction.hash;
  // Fetch additional data from contract call
  proposal.save();
}

export function handleProposalAccepted(event: ProposalAccepted): void {
  let proposal = Proposal.load(event.params.proposalId.toString());
  if (proposal) {
    proposal.status = "ACCEPTED";
    proposal.save();
  }

  let contract = new Contract(event.params.contractId.toString());
  contract.contractId = event.params.contractId;
  contract.proposal = event.params.proposalId.toString();
  contract.escrowId = event.params.escrowId;
  contract.status = "IN_PROGRESS";
  contract.createdAt = event.block.timestamp;
  contract.save();
}
```

### 2.2 Option B: Simple Backend Cache (Faster to implement)

**File**: `src/lib/contractCache.ts` (NEW)

```typescript
// In-memory cache with localStorage persistence
const CACHE_KEY = "w3rk_contracts_cache";
const CACHE_TTL = 60000; // 1 minute

interface CacheEntry {
  data: any[];
  timestamp: number;
  userAddress: string;
}

export function getCachedContracts(userAddress: string): any[] | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const entry: CacheEntry = JSON.parse(cached);
  if (entry.userAddress !== userAddress) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) return null;

  return entry.data;
}

export function setCachedContracts(userAddress: string, data: any[]): void {
  const entry: CacheEntry = {
    data,
    timestamp: Date.now(),
    userAddress,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export function invalidateCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
```

Update `src/api.ts`:
```typescript
import { getCachedContracts, setCachedContracts } from "@/lib/contractCache";

export async function get_all_contracts(userLensAccountAddress: string) {
  // Check cache first
  const cached = getCachedContracts(userLensAccountAddress);
  if (cached) return cached;

  // Fetch from blockchain
  const contracts = await fetchContractsFromChain(userLensAccountAddress);

  // Update cache
  setCachedContracts(userLensAccountAddress, contracts);

  return contracts;
}
```

### 2.3 Update My Contracts Page for Real-time Updates
**File**: `src/views/my-contract/contracts.tsx`

Current event listeners (lines 116-149) refetch all contracts on every event. Add debouncing:

```typescript
import { invalidateCache } from "@/lib/contractCache";

// Debounce refetch
const debouncedRefetch = useMemo(() => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      invalidateCache();
      fetchContracts();
    }, 1000);
  };
}, [fetchContracts]);

// Use in event handlers
contract.on("ProposalCreated", debouncedRefetch);
contract.on("ProposalAccepted", debouncedRefetch);
```

---

## Priority 3: Performance Fixes

### 3.1 Cache Token Decimals
**File**: `src/api.ts`

Add at top:
```typescript
const tokenDecimalsCache: Record<string, number> = {};

async function getTokenDecimalsCached(tokenAddress: string): Promise<number> {
  if (tokenDecimalsCache[tokenAddress]) {
    return tokenDecimalsCache[tokenAddress];
  }

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const decimals = await tokenContract.decimals();
  tokenDecimalsCache[tokenAddress] = decimals;
  return decimals;
}
```

Replace all `tokenContract.decimals()` calls with `getTokenDecimalsCached(tokenAddress)`.

### 3.2 Batch Contract Reads
**File**: `src/api.ts` - `get_all_contracts` function (lines 419-490)

Current: Sequential reads in a loop
```typescript
for (let i = 0; i < proposalIds.length; i++) {
  const proposal = await contract.getProposal(proposalIds[i]);
  // ...
}
```

Better: Parallel reads
```typescript
const proposalPromises = proposalIds.map(id => contract.getProposal(id));
const proposals = await Promise.all(proposalPromises);
```

---

## Priority 4: Error Handling

### 4.1 User-Friendly Errors
**File**: `src/api.ts`

Add error mapping:
```typescript
const CONTRACT_ERRORS: Record<string, string> = {
  "InsufficientBalance": "Your Lens Account doesn't have enough tokens",
  "NotAuthorized": "You're not authorized for this action",
  "InvalidProposal": "This proposal no longer exists",
  "AlreadyAccepted": "This proposal was already accepted",
  "ProposalExpired": "This proposal has expired",
  "execution reverted": "Transaction failed - check your balance",
};

function getErrorMessage(error: any): string {
  const message = error?.reason || error?.message || "";
  for (const [key, value] of Object.entries(CONTRACT_ERRORS)) {
    if (message.includes(key)) return value;
  }
  return "Transaction failed. Please try again.";
}
```

Update all catch blocks to use `getErrorMessage(error)`.

---

## Priority 5: Validation

### 5.1 Validate Lens Account Address
**File**: `src/views/my-contract/modals/creatContractModal.tsx`

Before submitting:
```typescript
async function validateLensAccount(address: string): Promise<boolean> {
  if (!ethers.isAddress(address)) return false;
  const code = await provider.getCode(address);
  return code !== "0x"; // Must be a contract, not EOA
}

// In form validation
if (!await validateLensAccount(freelancerAddress)) {
  setError("Enter a valid Lens Account address (not a wallet address)");
  return;
}
```

---

## Files Summary

| File | Action | Priority |
|------|--------|----------|
| `src/views/view-job-modal/view-job-modal.tsx` | Add "Get Started" button | P1 |
| `src/views/find-work/find-work.tsx` | Handle Get Started, show contract modal | P1 |
| `src/views/find-work/CreateContractFromPostModal.tsx` | NEW - Create contract from job | P1 |
| `src/lib/contractCache.ts` | NEW - Local cache layer | P2 |
| `src/api.ts` | Add caching, batch reads, error handling | P2-P4 |
| `src/views/my-contract/contracts.tsx` | Debounce event handlers | P2 |
| `src/views/my-contract/modals/creatContractModal.tsx` | Add address validation | P5 |

---

## Contract Events (for indexing reference)

```solidity
event ProposalCreated(uint256 indexed proposalId, address indexed client, address indexed freelancer);
event ProposalAccepted(uint256 indexed proposalId, uint256 indexed contractId, uint256 escrowId);
event ProposalCancelled(uint256 indexed proposalId);
event PaymentRequested(uint256 indexed contractId);
event PaymentReleased(uint256 indexed contractId);
event ContractCancelled(uint256 indexed contractId);
```

---

## Testing Checklist

- [ ] Create job post via Profile Modal
- [ ] View job in Find Work feed
- [ ] Click "Get Started" → Contract modal opens with pre-filled data
- [ ] Submit proposal → Transaction succeeds
- [ ] Proposal appears in "My Contracts" for both client and freelancer
- [ ] Freelancer accepts → Contract created
- [ ] Full flow: create → accept → request payment → release
