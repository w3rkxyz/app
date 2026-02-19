# AGENTS.md

This file is a quick operating manual for future coding agents working in the `w3rkxyz/app` repo.

## 1) Product Context

`w3rk` is a Web3-native freelancing platform on Lens Chain.

Core product goals:
- Decentralized identity and profiles via Lens.
- Job and service posts as Lens publications.
- Wallet-based encrypted messaging via XMTP.
- Crypto escrow contracts for work agreements and payouts.
- Minimal platform custody and no Web2-style account lock-in.

Current product reality:
- The app is in active migration and integration mode.
- Frontend redesign and protocol upgrades have happened in parallel.
- Some flows are complete, some are transitional, and some are intentionally deferred.

## 2) Delivery Priorities

Priority order for implementation work:
1. Keep the latest UI functional (no static-only dead ends).
2. Keep auth/login/profile flows reliable.
3. Keep XMTP messaging functional end-to-end.
4. Keep contract workflows functional on Lens testnet.
5. Preserve UX continuity while replacing legacy logic.

Out of scope unless explicitly requested:
- Dispute/challenge/arbitration logic for escrow contracts.
- Major product redesign beyond the approved UI direction.

## 3) Tech Stack

- Next.js App Router (`src/app`)
- React 19
- TypeScript
- Tailwind CSS
- Redux Toolkit
- wagmi + ConnectKit for wallet connection
- Lens SDK (`@lens-protocol/client`, `@lens-protocol/react`)
- Apollo GraphQL client (Lens API)
- XMTP browser SDK
- Ethers.js for contract interactions

Build/runtime notes:
- Webpack is forced for builds (`next build --webpack`).
- Vercel build command is configured in `vercel.json`.
- CI runs `npm ci`, `npm run lint`, and `npm run build`.

## 4) Repo Map

Top-level docs worth reading:
- `FRONTEND_MIGRATION_GUIDE.md`
- `WORKFLOW_EXPLANATION.md`
- `UPDATE_SUMMARY.md`
- `CONTRACT_INTEGRATION_CHECKLIST.md`
- `TODO_IMPLEMENTATION.md`

Key source areas:
- `src/app`: Next.js routes and app shell.
- `src/components`: reusable and page-level UI components.
- `src/views`: main page/view implementations.
- `src/hooks`: Lens, XMTP, and app workflow hooks.
- `src/redux`: global state slices (`app`, `alerts`, `xmtp`).
- `src/api.ts`: smart contract and token interaction layer.
- `src/utils/getLensProfile.ts`: normalization of Lens account data.
- `src/app/XMTPContext.tsx`: global XMTP client context.

Route directories:
- `src/app/find-work`
- `src/app/find-talent`
- `src/app/messages`
- `src/app/contracts`
- `src/app/onboarding`
- `src/app/settings`
- `src/app/wallet`
- `src/app/u/[handle]`

Important naming quirk:
- Messaging view folder is `src/views/my-massage` (typo kept in repo naming).

## 5) Critical Architecture Notes

### Identity and Accounts

- Lens accounts are the app-level identity surface.
- Lens account address can differ from wallet owner EOA.
- Contract and messaging code must be explicit about which address is being used.

### Lens Data

- Posts and profile data come from Lens APIs.
- App defaults to Lens testnet API unless overridden.
- `NEXT_PUBLIC_LENS_API_URL` is used by Lens client and Apollo client.

### XMTP

- XMTP identity is wallet-based, not Lens-profile-based.
- One wallet identity maps to one XMTP inbox.
- Do not assume per-profile inboxes for multiple profiles on one wallet.
- For SCW identities, chain/env/signer alignment is critical during registration.

### Contracts and Payments

- Contract workflows are handled in `src/api.ts`.
- Lens testnet chain is the default runtime target.
- Contract layer migrated away from old IPFS-based payload dependency.
- Token decimals are fetched dynamically from token contracts.

## 6) Required Environment Variables

Minimum needed for normal local dev:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_TOKEN_ADDRESS`
- `NEXT_PUBLIC_LENS_API_URL` (recommended explicit value)
- `NEXT_PUBLIC_LENS_RPC_URL` (recommended explicit value)

Messaging-related:
- `NEXT_PUBLIC_XMTP_ENV` or `NEXT_PUBLIC_XMTP_ENVIRONMENT` (`dev`, `production`, or `local`)
- `NEXT_PUBLIC_LENS_CHAIN_ID` (optional override)

There are legacy/optional vars in `.env` that may not be active in current code paths.

## 7) Local Development Commands

- Install: `npm ci`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Start production build: `npm run start`
- Format: `npm run format`

## 8) Working Agreements for Agents

Before coding:
1. Read this file and skim the migration docs listed above.
2. Confirm target branch and PR base with the requester.
3. Identify whether task touches Lens auth, XMTP, contracts, or pure UI.

When coding:
1. Preserve current UI look unless explicitly asked to redesign.
2. Avoid reintroducing mock data where real data flow exists.
3. Keep XMTP and chain env handling explicit in logs and errors.
4. Avoid breaking `main` build/lint checks.

Before opening/updating PR:
1. Run `npm run lint`.
2. Run `npm run build`.
3. Summarize exactly what was changed and what remains unverified.
4. Call out manual wallet-dependent tests that cannot be run headlessly.

## 9) Manual QA Checklist (High Value)

Auth and onboarding:
1. Connect wallet.
2. Resolve Lens account/profile.
3. Navigate app without dead-end screens.

Messaging:
1. `/messages` loads.
2. Enable flow works for new account.
3. Returning account restores conversations.
4. Start conversation with real Lens user.
5. Send and receive messages across two accounts.

Contracts:
1. Create proposal.
2. Accept proposal.
3. Request payment.
4. Release payment.

## 10) Common Failure Modes

- Address mismatch between Lens account address and wallet owner address.
- Chain mismatch during SCW signature validation.
- XMTP env mismatch (`dev` vs `production`) causing lookup/register failures.
- UI update accidentally removing buttons/hooks needed for core logic.
- Vercel/CI issues from dependency resolution or build mode drift.

Keep fixes pragmatic and incremental. Maintain shipping momentum while protecting core flows.
