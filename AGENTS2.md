# AGENTS2.md

Implementation handbook for coding agents working in `w3rkxyz/app`.

## 1) Project Snapshot

`w3rk` is a Lens-native Web3 freelance marketplace.

Core user journey:
1. Connect wallet.
2. Authenticate with Lens.
3. Select one Lens profile (if multiple are owned by the wallet).
4. Use marketplace features: discover jobs/talent, messaging, contracts, profile + settings.

Primary product areas in this repo:
- Wallet + Lens login and session persistence.
- Dynamic Lens profiles (`/u/[handle]`).
- Job discovery and posting surfaces.
- Messaging (XMTP + Lens identity glue).
- Contracts/jobs workflow pages.
- Profile settings editing.

## 2) Stack and Runtime

- Next.js App Router (`src/app`)
- React 19 + TypeScript
- Tailwind CSS
- Redux Toolkit (`src/redux`)
- Lens SDK:
  - `@lens-protocol/client`
  - `@lens-protocol/react`
- Wallet stack:
  - wagmi
  - ConnectKit
  - viem
- Apollo Client (GraphQL layer)
- XMTP SDK

Lens endpoint/runtime notes:
- `src/client.ts` sets Lens testnet backend to `https://api.testnet.lens.xyz/graphql` by default.
- Session resume is handled via `client.resumeSession()` and cookie-backed storage (`src/storage.ts`).

## 3) App Shell and Provider Composition

Entry layout: `src/app/layout.tsx`

Global wrappers (in order):
1. `ExtensionErrorBoundary`
2. `HydrationFix`
3. `AppProvider` (`src/app/AppProvider.tsx`)
4. `ClientProvider` (Redux)
5. `ModalWrapper`
6. `ConditionalNav`
7. Route content
8. `Toaster`

`AppProvider` wiring:
- Apollo
- React Query
- Wagmi
- ConnectKit
- Lens Provider
- XMTP Provider

## 4) Route Map

Main routes:
- `/` -> landing/home (`src/views/home/homeMvpLuanch`)
- `/find-work` -> find work view
- `/find-talent` -> find talent view
- `/contracts` -> my jobs/contracts view
- `/messages` -> messaging view
- `/notifications` -> notifications UI
- `/settings` -> account settings editor
- `/u/[handle]` -> dynamic profile page
- `/wallet` -> wallet page
- `/onboarding` -> onboarding flow

Important naming quirk:
- Messaging view folder is `src/views/my-massage` (typo in folder name is intentional in current repo structure).

## 5) Auth + Session Model (Critical)

Auth state is not only Redux; it is Lens-session backed.

Key files:
- Login UI: `src/components/auth/login-landing.tsx`
- Login flow modal: `src/components/common/header/loginForm.tsx`
- Session-aware nav switching: `src/components/common/header/conditionalNav.tsx`
- Profile normalization: `src/utils/getLensProfile.ts`
- Lens client/session resume: `src/client.ts`
- Cookie storage bridge: `src/storage.ts`

How it works:
1. Wallet connects via ConnectKit/wagmi.
2. `loginForm.tsx` authenticates to Lens and enforces Lens testnet chain (`37111`).
3. Available Lens accounts for the wallet are loaded (`useAccountsAvailable`).
4. If 1 profile: auto-select/login.
5. If multiple profiles: user selects one.
6. Selected Lens profile is normalized (`getLensAccountData`) and saved to Redux (`setLensProfile`).
7. On refresh, `ConditionalNav` rehydrates from Lens authenticated user + `fetchAccount`, then restores authenticated navbar.

Guardrails:
- Do not rely on in-memory React state alone for auth UI decisions.
- Keep session revalidation logic in `ConditionalNav` intact.
- Avoid hardcoded profile handles; always derive from authenticated Lens account / route handle.

## 6) Navbar and Header Behavior

Public navbar: `src/components/common/header/navbar.tsx`
Authenticated navbar: `src/components/common/header/secondNav.tsx`
Switcher: `src/components/common/header/conditionalNav.tsx`

`secondNav.tsx` currently handles:
- Search icon expanding to search input.
- Lens user search (via `useSearchAccounts`) and jump to `/u/[handle]`.
- Notifications button route push to `/notifications`.
- Profile dropdown with profile/settings actions.

When touching nav:
- Keep search open/close animation and icon centering behavior stable.
- Ensure behavior is consistent across routes (state resets on route change if needed).
- Do not regress authenticated-vs-public navbar switching.

## 7) Profile and Settings Data Flow

Dynamic profile page:
- Route: `src/app/u/[handle]/page.tsx`
- Loads account by handle with `useAccount` from Lens.
- Renders dynamic data (name, handle, bio, cover, avatar, attributes, followers/following).
- Loads profile posts with `fetchPosts`.

Settings page:
- View: `src/views/settings/settings.tsx`
- Reads authenticated account and pre-fills form.
- Updates account metadata via `setAccountMetadata`.
- Uses helper functions to convert files/json to data URIs.

When editing settings/profile features:
- Preserve metadata key conventions (`job title`, `x`, `github`, `linkedin`, `website`, `location`).
- Keep form-to-metadata mapping explicit and reversible.
- Ensure file upload controls are actually wired (button + hidden file input).

## 8) State and Data Layers

Redux slices (`src/redux`):
- `app`: login modal, switch modal, current Lens profile.
- `alerts`: global UI alerts.
- `xmtp`: messaging-related state.

Lens data access:
- Hooks + actions from Lens SDK.
- Search hook: `src/hooks/useSearchAccounts.ts`.

Normalization:
- Use `getLensAccountData(account)` as canonical map for UI-facing profile fields.

## 9) Environment Variables

Common required values:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_LENS_API_URL` (optional override; defaults in `src/client.ts`)
- `NEXT_PUBLIC_APP_ADDRESS_TESTNET` (Lens app address for login flow)
- Contract/token env vars for contracts pages (project-specific, see `.env` usage)
- XMTP environment vars where messaging is enabled

Operational note:
- Wallet/Lens behaviors differ by chain; ensure Lens testnet chain handling remains explicit.

## 10) Where to Edit for Common Tasks

Login screen layout/responsive:
- `src/components/auth/login-landing.tsx`
- `src/components/auth/login-landing.module.css`

Lens login/profile picker behavior:
- `src/components/common/header/loginForm.tsx`
- `src/components/common/header/switchProfileModal.tsx`

Navbar authenticated actions/search/dropdown:
- `src/components/common/header/secondNav.tsx`
- `src/components/common/header/conditionalNav.tsx`

Profile rendering:
- `src/app/u/[handle]/page.tsx`
- `src/utils/getLensProfile.ts`

Settings editing:
- `src/views/settings/settings.tsx`

## 11) QA Smoke Checklist

Auth/session:
1. Connect wallet.
2. If multiple Lens profiles exist, verify profile selection appears.
3. Complete login and redirect to `/u/[handle]`.
4. Refresh on protected pages and confirm authenticated navbar remains.

Navbar:
1. Search icon expands/collapses correctly on every route where shown.
2. Search results navigate to selected user profile.
3. Notifications icon routes to `/notifications`.
4. Profile dropdown routes to profile/settings correctly.

Profile/settings:
1. `/u/[handle]` loads dynamic Lens data (not placeholder).
2. Own profile vs other profile behavior is correct.
3. Settings save updates metadata and appears on profile.

## 12) Git/PR Workflow for This Repo

Expected workflow used in recent work:
1. Branch off latest `main`.
2. Keep changes scoped to one feature/fix theme.
3. Push branch and open/update the corresponding PR.
4. Merge PR to `main` before starting next PR stream.

If user asks to maintain a running PR series (`PR19`, `PR21`, etc.), continue pushing incremental updates to the named branch until told otherwise.

## 13) Known Risks / Gotchas

- Auth desync can occur if Redux state is treated as source of truth instead of Lens session.
- Chain mismatch (not on Lens testnet) can silently break login signing.
- Hardcoded mock profile fallbacks can accidentally reappear if route data fetching is bypassed.
- Some components still contain legacy or commented logic; verify what is active before refactoring.
- Folder naming inconsistencies exist (e.g., `my-massage`) and are referenced by routes; renaming requires coordinated updates.

---

If you are a future coding agent, start with:
1. `src/app/layout.tsx`
2. `src/app/AppProvider.tsx`
3. `src/components/common/header/conditionalNav.tsx`
4. `src/components/common/header/loginForm.tsx`
5. `src/app/u/[handle]/page.tsx`

These files explain most of the app’s runtime behavior and user identity flow.
