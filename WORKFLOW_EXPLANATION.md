# W3RK Platform Workflow Explanation

## Current Architecture Overview

The W3RK platform currently has **TWO SEPARATE SYSTEMS** that are not directly connected:

### 1. **Lens Protocol Posts** (Social Discovery Layer)
- **What it is**: Social posts on Lens Chain (like tweets/posts)
- **Where**: Stored on Lens Chain via Lens Protocol
- **Purpose**: Discovery/marketing - shows job opportunities and services
- **How it works**:
  - User posts a job/service via `ProfileModal` → Creates a Lens Protocol post
  - Post appears in "Find Work" feed (filtered by tags `["w3rk", "job"]`)
  - Post contains metadata (title, description, payment info) in attributes
  - Clicking on a post opens `ViewJobModal` which shows details

### 2. **ContractsManager Contracts** (Smart Contract Layer)
- **What it is**: On-chain work agreements with escrow payments
- **Where**: Stored in `ContractsManager` smart contract on Lens Chain
- **Purpose**: Actual work contracts with payment guarantees
- **How it works**:
  - Client creates a contract proposal via "My Contracts" → "Create Contract"
  - Proposal stored on-chain in `ContractsManager`
  - Freelancer accepts → Contract created → Tokens locked in Unicrow escrow
  - Work progresses → Payment released

## Current Workflow (Disconnected)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Post Job/Service (Lens Protocol)                    │
│                                                             │
│ User → ProfileModal → useCreatePost() → Lens Chain Post    │
│                                                             │
│ Result: Social post visible in "Find Work" feed            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Discover Job (Find Work Page)                      │
│                                                             │
│ User → Find Work → View Posts → Click Job → ViewJobModal   │
│                                                             │
│ Options:                                                    │
│ - "Contact" → Opens messages (NO CONTRACT CREATION)        │
│ - "Delete" (if owner) → Removes post                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Create Contract (MANUAL - SEPARATE FLOW)           │
│                                                             │
│ User → "My Contracts" → "Create Contract" →                 │
│        → Enter freelancer address manually →               │
│        → reviewContractModal → create_proposal() →          │
│        → ContractsManager.createProposal()                 │
│                                                             │
│ Result: Contract proposal stored on-chain                   │
└─────────────────────────────────────────────────────────────┘
```

## The Problem

**These two systems are NOT connected!**

- Posting a job on Lens does NOT create a contract
- Viewing a job post does NOT allow you to "Get Started" with a contract
- Creating a contract requires manually entering the freelancer's address
- There's no way to automatically create a contract from a job post

## What Should Happen (Connected Workflow)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Post Job/Service (Lens Protocol)                    │
│                                                             │
│ User → ProfileModal → useCreatePost() → Lens Chain Post    │
│                                                             │
│ Result: Social post visible in "Find Work" feed            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Discover & Accept Job                               │
│                                                             │
│ User → Find Work → View Posts → Click Job → ViewJobModal   │
│                                                             │
│ Options:                                                    │
│ - "Get Started" → Auto-fill contract details from post →     │
│   → Create proposal in ContractsManager                     │
│ - "Contact" → Opens messages                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Contract Created Automatically                      │
│                                                             │
│ Auto-filled from post:                                      │
│ - Title, description, payment amount                         │
│ - Freelancer Lens Account address                          │
│ - Client Lens Account address                              │
│                                                             │
│ → reviewContractModal → create_proposal() →                 │
│   → ContractsManager.createProposal()                      │
│                                                             │
│ Result: Contract proposal created from job post            │
└─────────────────────────────────────────────────────────────┘
```

## Where Data is Stored

### Lens Protocol Posts
- **Chain**: Lens Chain (via Lens Protocol)
- **Storage**: Lens Protocol's social graph
- **Data**: Post content, metadata attributes (title, description, payment type)
- **Access**: Via Lens Protocol SDK (`usePosts`, `useCreatePost`)

### ContractsManager Contracts
- **Chain**: Lens Chain (direct smart contract)
- **Storage**: `ContractsManager.sol` contract at `0x7d2c2d6ab1F08a081E9EbCDFD8d97C42e7AF73f8`
- **Data**: Proposal/contract structs (title, description, dueDate, amounts, accounts)
- **Access**: Via `ethers.Contract` instance in `api.ts`

## Current Implementation Details

### Posting a Job (`profileModal.tsx`)
```typescript
const handlePost = async () => {
  // Creates Lens Protocol metadata
  const heyMetadata = textOnly({
    content: publicContent,
    tags: updatedTags,
    attributes: [
      { key: "title", value: title },
      { key: "content", value: description },
      { key: "payement type", value: payementType },
      // ... more attributes
    ],
  });
  
  // Converts to data URI and posts to Lens
  const heyMetadataURI = await uploadJsonToIPFS(heyMetadata);
  const heyResult = await execute({ contentUri: heyMetadataURI });
  
  // ✅ This creates a LENS POST, NOT a contract!
};
```

### Viewing Jobs (`find-work.tsx`)
```typescript
// Fetches Lens Protocol posts
const { data: publications } = usePosts({
  filter: { metadata: { tags: { all: ["w3rk", "job"] } } },
});

// Displays posts in feed
// Clicking opens ViewJobModal
```

### Creating Contract (`reviewContractModal.tsx`)
```typescript
const handleSubmit = async () => {
  // Manually creates contract proposal
  const hash = await create_proposal(
    contractDetails.paymentAmount.toString(),
    contractDetails.freelancerAddress,  // Manual entry required!
    contractDetails.title,
    contractDetails.description,
    contractDetails.dueDate,
    tokenAddress,
    dispatch,
    senderHandle,
    clientLensAccountAddress
  );
  
  // ✅ This creates a CONTRACT PROPOSAL in ContractsManager
  // ❌ But it's NOT connected to the job post!
};
```

## Recommendations

To connect these flows, you should:

1. **Add "Get Started" button to `ViewJobModal`**:
   - Extract job details from post attributes
   - Extract freelancer Lens Account address from `publication.author.address`
   - Auto-fill `CreateContractModal` with post data
   - Allow user to review and create contract proposal

2. **Or simplify to single flow**:
   - When posting a job, also create a contract proposal
   - Store proposal ID in post attributes
   - Link posts to contracts bidirectionally

3. **Update `ViewJobModal`**:
   - Add "Get Started" button (not just "Contact")
   - Navigate to contract creation with pre-filled data

