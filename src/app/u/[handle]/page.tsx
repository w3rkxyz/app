"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { evmAddress, useAccount as useLensAccount, useSessionClient } from "@lens-protocol/react";
import { fetchAccount, fetchFollowers, fetchFollowStatus, fetchFollowing, fetchPosts, follow, unfollow } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { CheckIcon, PlusIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useWalletClient } from "wagmi";
import CreatePostModal from "@/views/profile/CreatePostModal";
import ProfilePostCard from "@/components/Cards/ProfilePostCard";
import getLensAccountData from "@/utils/getLensProfile";
import { client, getLensClient } from "@/client";

const LENS_TESTNET_CHAIN_ID = 37111;
const FOLLOW_CONFIRM_TIMEOUT_MS = 120000;
const FOLLOW_POLL_INTERVAL_MS = 1500;
const DEFAULT_LENS_GRAPHQL_ENDPOINT = "https://api.testnet.lens.xyz/graphql";
const DEFAULT_PROFILE_AVATAR = "https://static.hey.xyz/images/default.png";

type ConnectionsTab = "followers" | "following";

function getDomain(url: string) {
  return url.replace(/https?:\/\//, "").replace(/\/$/, "");
}

function toAbsoluteUrl(url: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function readAttributeMap(metadata: any): Record<string, string> {
  const map: Record<string, string> = {};
  const attributes = metadata?.attributes;
  if (!Array.isArray(attributes)) return map;

  attributes.forEach((attribute: any) => {
    if (attribute?.key && typeof attribute?.value === "string") {
      map[attribute.key] = attribute.value;
    }
  });

  return map;
}

type ProfilePost = {
  type: "job" | "service";
  title: string;
  description: string;
  tags: string[];
  paymentAmount: string;
};

type ConnectionAccount = {
  address: string;
  localName: string;
  displayName: string;
  handle: string;
  profilePath: string;
  picture: string;
  bio: string;
  isFollowedByMe: boolean;
  canFollowByProtocol: boolean;
  isSelf: boolean;
};

function shortenAddress(value: string | null | undefined) {
  if (!value) return "Unknown";
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function toConnectionAccount(account: any, observerAddress: string) {
  if (!account?.address) return null;

  const localName = account?.username?.localName || "";
  const displayName = account?.metadata?.name || localName || shortenAddress(account?.address);
  const handle = localName ? `@${localName}` : shortenAddress(account?.address);
  const profilePath = localName ? `/u/${encodeURIComponent(localName)}` : "";
  const picture = account?.metadata?.picture || DEFAULT_PROFILE_AVATAR;
  const bio = account?.metadata?.bio || "";
  const isSelf = Boolean(observerAddress)
    && observerAddress.toLowerCase() === String(account.address).toLowerCase();
  const isFollowedByMe = Boolean(account?.operations?.isFollowedByMe);
  const canFollowTypename = account?.operations?.canFollow?.__typename;
  const canFollowByProtocol = canFollowTypename
    ? canFollowTypename !== "AccountFollowOperationValidationFailed"
    : true;

  return {
    address: String(account.address),
    localName,
    displayName,
    handle,
    profilePath,
    picture,
    bio,
    isFollowedByMe,
    canFollowByProtocol,
    isSelf,
  } satisfies ConnectionAccount;
}

function parseProfilePost(post: any): ProfilePost | null {
  const attributes = readAttributeMap(post?.metadata);
  const rawType = (attributes["post type"] || "").toLowerCase();
  const type: "job" | "service" = rawType === "service" ? "service" : "job";

  const title = attributes["title"] || "Untitled Post";
  const description = attributes["content"] || post?.metadata?.content || "";

  const paymentType = (attributes["payement type"] || attributes["payment type"] || "").toLowerCase();
  const hourly = attributes["hourly"];
  const fixed = attributes["fixed"];

  let paymentAmount = "";
  if (paymentType === "hourly" && hourly) {
    paymentAmount = `$${hourly}/hr`;
  } else if (fixed) {
    paymentAmount = `$${fixed}`;
  } else if (hourly) {
    paymentAmount = `$${hourly}/hr`;
  } else {
    paymentAmount = "$0";
  }

  const tags = Array.isArray(post?.metadata?.tags)
    ? post.metadata.tags.filter((tag: string) => !["w3rk", "job", "service"].includes(tag))
    : [];

  return {
    type,
    title,
    description,
    tags,
    paymentAmount,
  };
}

function getFollowCount(account: any, key: "followers" | "following") {
  const value = account?.graphFollowStats?.[key]
    ?? account?.graphsFollowStats?.[key]
    ?? account?.stats?.graphFollowStats?.[key]
    ?? account?.stats?.graphsFollowStats?.[key]
    ?? account?.stats?.[key]
    ?? 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isFollowingFromStatus(value: any) {
  const state = getFollowStatusState(value);
  return state.optimistic || state.onChain;
}

function isFollowingOnChainFromStatus(value: any) {
  return getFollowStatusState(value).onChain;
}

function getFollowStatusState(value: any) {
  if (typeof value === "boolean") {
    return { optimistic: value, onChain: value };
  }

  if (value && typeof value === "object") {
    return {
      optimistic: Boolean(value.optimistic),
      onChain: Boolean(value.onChain),
    };
  }

  return { optimistic: false, onChain: false };
}

function normalizeHandleValue(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/^@/, "").trim().toLowerCase();
}

function isTxHashIdentifier(value: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDebugLine(event: string, data?: unknown) {
  try {
    return `${new Date().toISOString()} ${event} ${data ? JSON.stringify(data) : ""}`.trim();
  } catch {
    return `${new Date().toISOString()} ${event}`;
  }
}

function isOperationStatusUnsupportedError(errorMessages: string[]) {
  return errorMessages.some((message) => {
    const normalized = message.toLowerCase();
    return normalized.includes("cannot query field \"operationstatus\"")
      || normalized.includes("unknown argument")
      || normalized.includes("unknown type \"operationstatus\"");
  });
}

async function fetchAccountFollowCountsFromNetwork(params: {
  endpoint: string;
  accountAddress: string;
  onLog?: (event: string, data?: Record<string, unknown>) => void;
}) {
  const { endpoint, accountAddress, onLog } = params;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: "query AccountFollowCounts($account: EvmAddress!) { accountStats(request: { account: $account }) { graphFollowStats { followers following } } }",
        variables: { account: accountAddress },
      }),
    });

    const payload = await response.json().catch(() => null);
    const errorMessages = Array.isArray(payload?.errors)
      ? payload.errors.map((error: any) => String(error?.message || "unknown GraphQL error"))
      : [];

    if (errorMessages.length > 0) {
      onLog?.("account follow counts network query returned errors", {
        endpoint,
        accountAddress,
        errors: errorMessages,
      });
      return null;
    }

    const followers = Number(payload?.data?.accountStats?.graphFollowStats?.followers);
    const following = Number(payload?.data?.accountStats?.graphFollowStats?.following);
    if (!Number.isFinite(followers) || !Number.isFinite(following)) {
      onLog?.("account follow counts network query returned non-numeric values", {
        endpoint,
        accountAddress,
        followers: payload?.data?.accountStats?.graphFollowStats?.followers ?? null,
        following: payload?.data?.accountStats?.graphFollowStats?.following ?? null,
      });
      return null;
    }

    return { followers, following };
  } catch (error) {
    onLog?.("account follow counts network query failed", {
      endpoint,
      accountAddress,
      error: String((error as any)?.message || error),
    });
    return null;
  }
}

type LensOperationResolution = {
  status: "confirmed" | "failed" | "timeout";
  source: "tx-hash" | "operation-status" | "follow-status-fallback";
  txHash?: string;
  reason?: string;
};

type FollowToggleExecutionResult = {
  ok: boolean;
  nextFollowing: boolean;
  effectiveObserverAddress: string;
};

async function pollLensOperationStatusEndpoint(params: {
  endpoint: string;
  operationId: string;
  timeoutMs: number;
  pollIntervalMs: number;
  onLog?: (event: string, data?: Record<string, unknown>) => void;
}) {
  const { endpoint, operationId, timeoutMs, pollIntervalMs, onLog } = params;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: "query LensOperationStatus($id: ID!) { operationStatus(request: { id: $id }) { __typename } }",
          variables: { id: operationId },
        }),
      });

      const payload = await response.json().catch(() => null);
      const errorMessages = Array.isArray(payload?.errors)
        ? payload.errors.map((error: any) => String(error?.message || "unknown GraphQL error"))
        : [];

      if (errorMessages.length > 0 && isOperationStatusUnsupportedError(errorMessages)) {
        onLog?.("operation status endpoint not supported on current Lens API", {
          endpoint,
          operationId,
          errors: errorMessages,
        });
        return { status: "unsupported" as const, reason: errorMessages.join(" | ") };
      }

      if (errorMessages.length > 0) {
        onLog?.("operation status endpoint returned errors", {
          endpoint,
          operationId,
          errors: errorMessages,
        });
      }

      const typename = payload?.data?.operationStatus?.__typename;
      onLog?.("operation status poll result", { operationId, typename: typename || null });

      if (typeof typename === "string") {
        if (/fail|reject|error/i.test(typename)) {
          return { status: "failed" as const, reason: `operation status ${typename}` };
        }

        if (/finish|success|complete/i.test(typename)) {
          return { status: "confirmed" as const };
        }
      }
    } catch (error: any) {
      onLog?.("operation status endpoint request failed", {
        operationId,
        error: String(error?.message || error),
      });
    }

    await wait(pollIntervalMs);
  }

  return { status: "timeout" as const, reason: `Timeout waiting for operation ${operationId}` };
}

async function resolveLensOperationToTxHashOrReceipt(params: {
  identifier: string;
  sessionClient: any;
  statusClient: any;
  observerAddress: string;
  profileAddress: string;
  expectedFollowing: boolean;
  endpoint: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
  onLog?: (event: string, data?: Record<string, unknown>) => void;
}): Promise<LensOperationResolution> {
  const {
    identifier,
    sessionClient,
    statusClient,
    observerAddress,
    profileAddress,
    expectedFollowing,
    endpoint,
    timeoutMs = FOLLOW_CONFIRM_TIMEOUT_MS,
    pollIntervalMs = FOLLOW_POLL_INTERVAL_MS,
    onLog,
  } = params;

  if (isTxHashIdentifier(identifier)) {
    onLog?.("confirmation path: tx hash", { identifier });
    const waitResult = await sessionClient.waitForTransaction(identifier);
    if (waitResult.isErr()) {
      return {
        status: "failed",
        source: "tx-hash",
        txHash: identifier,
        reason: waitResult.error?.message || "Failed waiting for transaction confirmation.",
      };
    }

    return {
      status: "confirmed",
      source: "tx-hash",
      txHash: waitResult.value,
    };
  }

  onLog?.("confirmation path: non-hash operation id", { identifier });
  const operationStatus = await pollLensOperationStatusEndpoint({
    endpoint,
    operationId: identifier,
    timeoutMs,
    pollIntervalMs,
    onLog,
  });

  if (operationStatus.status === "confirmed") {
    return {
      status: "confirmed",
      source: "operation-status",
    };
  }

  if (operationStatus.status === "failed") {
    return {
      status: "failed",
      source: "operation-status",
      reason: operationStatus.reason || "Operation failed.",
    };
  }

  onLog?.("operation id unresolved via operation status; fallback to follow-status polling", {
    identifier,
    fallback: "fetchFollowStatus",
  });

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const statusResult = await fetchFollowStatus(statusClient, {
      pairs: [
        {
          account: evmAddress(profileAddress),
          follower: evmAddress(observerAddress),
        },
      ],
    });

    if (statusResult.isErr()) {
      onLog?.("follow-status fallback poll failed", {
        identifier,
        error: statusResult.error?.message || "unknown fetchFollowStatus error",
      });
      await wait(pollIntervalMs);
      continue;
    }

    const currentStatus = statusResult.value?.[0]?.isFollowing;
    const normalizedOnChain = isFollowingOnChainFromStatus(currentStatus);
    const normalizedOptimistic = isFollowingFromStatus(currentStatus);
    onLog?.("follow-status fallback poll result", {
      identifier,
      currentStatus,
      normalizedOnChain,
      normalizedOptimistic,
      expectedFollowing,
    });

    if (normalizedOnChain === expectedFollowing) {
      return {
        status: "confirmed",
        source: "follow-status-fallback",
      };
    }

    await wait(pollIntervalMs);
  }

  return {
    status: "timeout",
    source: "follow-status-fallback",
    reason: `Timeout waiting for operation ${identifier} to reflect in follow status.`,
  };
}

export default function Profile() {
  const params = useParams<{ handle: string }>();
  const searchParams = useSearchParams();
  const routeHandle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle;
  const normalizedHandle = useMemo(
    () => decodeURIComponent(routeHandle || "").replace(/^@/, "").trim(),
    [routeHandle]
  );
  const showFollowDebug = searchParams?.get("followDebug") === "1";

  const { user: loggedInProfile } = useSelector((state: any) => state.app);
  const { data: sessionClient } = useSessionClient();
  const { data: walletClient } = useWalletClient();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followStatusLoading, setFollowStatusLoading] = useState(false);
  const [followSubmitting, setFollowSubmitting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [canFollowByProtocol, setCanFollowByProtocol] = useState(true);
  const [sessionProfileAddress, setSessionProfileAddress] = useState("");
  const [followDebugLines, setFollowDebugLines] = useState<string[]>([]);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [connectionsTab, setConnectionsTab] = useState<ConnectionsTab>("followers");
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionsError, setConnectionsError] = useState("");
  const [connectionAccounts, setConnectionAccounts] = useState<ConnectionAccount[]>([]);
  const [connectionFollowSubmitting, setConnectionFollowSubmitting] = useState<Record<string, boolean>>({});

  const {
    data: lensAccount,
    loading: profileLoading,
    error: profileError,
  } = useLensAccount({
    username: { localName: normalizedHandle },
  });

  const accountData = lensAccount ? getLensAccountData(lensAccount as any) : null;
  const observerAddress = sessionProfileAddress || loggedInProfile?.address || "";
  const profileAddress = lensAccount?.address || "";
  const loggedInHandle = normalizeHandleValue(loggedInProfile?.userLink || loggedInProfile?.handle);
  const viewedHandle = normalizeHandleValue(lensAccount?.username?.localName || normalizedHandle);
  const hasAddressContext = Boolean(observerAddress) && Boolean(profileAddress);
  const canFollowValidationTypename = lensAccount?.operations?.canFollow?.__typename || "";
  const isOwnProfile = hasAddressContext
    ? observerAddress.toLowerCase() === profileAddress.toLowerCase()
    : Boolean(loggedInHandle) && Boolean(viewedHandle) && loggedInHandle === viewedHandle;
  const canCheckFollowStatus = !isOwnProfile && Boolean(observerAddress) && Boolean(profileAddress);
  const lensBackendEndpoint = useMemo(() => {
    const endpoint = (client as any)?.context?.environment?.backend;
    return String(endpoint || process.env.NEXT_PUBLIC_LENS_API_URL || DEFAULT_LENS_GRAPHQL_ENDPOINT);
  }, []);

  const logFollow = useCallback((event: string, data?: Record<string, unknown>, level: "info" | "error" | "warn" = "info") => {
    const line = toDebugLine(event, data);
    setFollowDebugLines((prev) => [...prev.slice(-149), line]);

    if (level === "error") {
      console.error(`[follow] ${event}`, data || {});
      return;
    }
    if (level === "warn") {
      console.warn(`[follow] ${event}`, data || {});
      return;
    }
    console.info(`[follow] ${event}`, data || {});
  }, []);

  const resolveActiveSessionClient = useCallback(async () => {
    if (sessionClient) {
      return sessionClient;
    }

    try {
      const resumedClient = await getLensClient();
      if ((resumedClient as any)?.isSessionClient?.()) {
        return resumedClient as any;
      }
    } catch (error) {
      logFollow("failed to resume session client", {
        error: String((error as any)?.message || error),
      }, "error");
    }

    return null;
  }, [logFollow, sessionClient]);

  const handleOpenJobModal = () => {
    if (isOwnProfile) {
      setIsJobModalOpen(true);
    }
  };
  const handleCloseJobModal = () => setIsJobModalOpen(false);
  const openConnectionsModal = useCallback((tab: ConnectionsTab) => {
    setConnectionsTab(tab);
    setConnectionsError("");
    setIsConnectionsModalOpen(true);
  }, []);
  const closeConnectionsModal = useCallback(() => {
    setIsConnectionsModalOpen(false);
    setConnectionsError("");
  }, []);

  const ensureLensTestnetChain = useCallback(async () => {
    if (!walletClient) {
      toast.error("Wallet not ready. Reconnect and try again.");
      return false;
    }

    const readChainId = async () => {
      try {
        return await walletClient.getChainId();
      } catch {
        return walletClient.chain?.id;
      }
    };

    const currentChainId = await readChainId();
    logFollow("wallet pre-check", {
      walletAddress: walletClient.account?.address,
      chainId: currentChainId,
      requiredChainId: LENS_TESTNET_CHAIN_ID,
    });

    if (currentChainId === LENS_TESTNET_CHAIN_ID) {
      return true;
    }

    try {
      await walletClient.switchChain({ id: LENS_TESTNET_CHAIN_ID });
    } catch (error: any) {
      if (error?.code !== 4902) {
        toast.error("Please switch to Lens Chain Testnet to continue.");
        return false;
      }

      try {
        await walletClient.addChain({
          chain: {
            id: LENS_TESTNET_CHAIN_ID,
            name: "Lens Chain Testnet",
            nativeCurrency: { name: "GHO", symbol: "GHO", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://rpc.testnet.lens.xyz"] },
            },
            blockExplorers: {
              default: {
                name: "Lens Explorer",
                url: "https://block-explorer.testnet.lens.xyz",
              },
            },
          },
        });
        await walletClient.switchChain({ id: LENS_TESTNET_CHAIN_ID });
      } catch {
        toast.error("Could not add Lens Chain Testnet to your wallet.");
        return false;
      }
    }

    const nextChainId = await readChainId();
    logFollow("wallet post-switch", {
      walletAddress: walletClient.account?.address,
      chainId: nextChainId,
      requiredChainId: LENS_TESTNET_CHAIN_ID,
    });

    if (nextChainId !== LENS_TESTNET_CHAIN_ID) {
      toast.error("Lens Testnet switch did not complete.");
      return false;
    }

    return true;
  }, [logFollow, walletClient]);

  const getSessionObserverAddress = useCallback(async (activeSessionClient?: any) => {
    const resolvedSessionClient = activeSessionClient || await resolveActiveSessionClient();
    if (!resolvedSessionClient) {
      return "";
    }

    try {
      const authenticatedUser = await resolvedSessionClient.getAuthenticatedUser().unwrapOr(null);
      return authenticatedUser?.address || "";
    } catch (error) {
      logFollow("failed to resolve session observer address", {
        error: String((error as any)?.message || error),
      }, "error");
      return "";
    }
  }, [logFollow, resolveActiveSessionClient]);

  useEffect(() => {
    let active = true;

    const hydrateSessionProfileAddress = async () => {
      if (!sessionClient) {
        setSessionProfileAddress("");
        return;
      }

      try {
        const authenticatedUser = await sessionClient.getAuthenticatedUser().unwrapOr(null);
        if (!active) return;
        setSessionProfileAddress(authenticatedUser?.address || "");
      } catch (error) {
        if (!active) return;
        logFollow("failed to read authenticated session profile", {
          error: String((error as any)?.message || error),
        }, "error");
        setSessionProfileAddress("");
      }
    };

    void hydrateSessionProfileAddress();

    return () => {
      active = false;
    };
  }, [logFollow, sessionClient]);

  useEffect(() => {
    if (!isConnectionsModalOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeConnectionsModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeConnectionsModal, isConnectionsModalOpen]);

  useEffect(() => {
    if (!canCheckFollowStatus) {
      setIsFollowing(false);
      return;
    }

    const initialFollowState = lensAccount?.operations?.isFollowedByMe;
    if (typeof initialFollowState !== "undefined") {
      setIsFollowing(isFollowingOnChainFromStatus(initialFollowState));
    }
  }, [canCheckFollowStatus, lensAccount?.operations?.isFollowedByMe]);

  useEffect(() => {
    if (!canFollowValidationTypename) {
      return;
    }
    setCanFollowByProtocol(canFollowValidationTypename !== "AccountFollowOperationValidationFailed");
  }, [canFollowValidationTypename]);

  useEffect(() => {
    let active = true;

    async function loadProfilePosts() {
      if (!lensAccount?.address) {
        setProfilePosts([]);
        return;
      }

      setPostsLoading(true);

      try {
        const result = await fetchPosts(client, {
          filter: {
            authors: [lensAccount.address],
          },
        });

        if (!active) return;

        if (result.isErr()) {
          console.error("Failed to load posts:", result.error);
          setProfilePosts([]);
          return;
        }

        const posts = result.value?.items
          ?.map(parseProfilePost)
          .filter((post): post is ProfilePost => Boolean(post)) ?? [];

        setProfilePosts(posts);
      } catch (error) {
        if (!active) return;
        console.error("Failed to load posts:", error);
        setProfilePosts([]);
      } finally {
        if (active) {
          setPostsLoading(false);
        }
      }
    }

    void loadProfilePosts();

    return () => {
      active = false;
    };
  }, [lensAccount?.address]);

  const refreshProfileSnapshot = useCallback(async (reason: string) => {
    if (!profileAddress) {
      return;
    }

    try {
      const queryClient = sessionClient ?? client;
      const [accountResult, networkCounts] = await Promise.all([
        fetchAccount(queryClient, {
          address: evmAddress(profileAddress),
        }),
        fetchAccountFollowCountsFromNetwork({
          endpoint: lensBackendEndpoint,
          accountAddress: profileAddress,
          onLog: (event, data) => logFollow(event, data),
        }),
      ]);

      if (accountResult.isErr() && !networkCounts) {
        logFollow("failed to refresh account snapshot", {
          reason,
          profileAddress,
          error: accountResult.error?.message || "unknown fetchAccount error",
        }, "error");
        return;
      }

      const freshAccount = accountResult.isOk() ? accountResult.value : null;
      const fallbackFollowers = getFollowCount(freshAccount, "followers");
      const fallbackFollowing = getFollowCount(freshAccount, "following");
      const freshFollowers = networkCounts?.followers ?? fallbackFollowers;
      const freshFollowing = networkCounts?.following ?? fallbackFollowing;

      setFollowersCount(freshFollowers);
      setFollowingCount(freshFollowing);

      const freshCanFollowTypename = freshAccount?.operations?.canFollow?.__typename;
      if (freshCanFollowTypename) {
        setCanFollowByProtocol(freshCanFollowTypename !== "AccountFollowOperationValidationFailed");
      }

      logFollow("refreshed account snapshot", {
        reason,
        clientType: sessionClient ? "session" : "public",
        profileAddress,
        followers: freshFollowers,
        following: freshFollowing,
        source: networkCounts ? "network-accountStats" : "account-fallback",
        canFollowTypename: freshCanFollowTypename || null,
      });
    } catch (error) {
      logFollow("account snapshot refresh failed", {
        reason,
        profileAddress,
        error: String((error as any)?.message || error),
      }, "error");
    }
  }, [lensBackendEndpoint, logFollow, profileAddress, sessionClient]);

  const refreshFollowStatus = useCallback(async (options?: { observerAddressOverride?: string; reason?: string }) => {
    const effectiveObserverAddress = options?.observerAddressOverride || observerAddress;
    const canCheckStatusWithObserver = Boolean(profileAddress)
      && Boolean(effectiveObserverAddress)
      && effectiveObserverAddress.toLowerCase() !== profileAddress.toLowerCase();

    if (!canCheckStatusWithObserver) {
      setIsFollowing(false);
      await refreshProfileSnapshot(options?.reason || "follow-status-refresh-skipped");
      return;
    }

    setFollowStatusLoading(true);

    try {
      const queryClient = sessionClient ?? client;
      logFollow("refresh status request", {
        reason: options?.reason || "follow-status-refresh",
        clientType: sessionClient ? "session" : "public",
        observerAddress: effectiveObserverAddress,
        profileAddress,
      });

      const result = await fetchFollowStatus(queryClient, {
        pairs: [
          {
            account: evmAddress(profileAddress),
            follower: evmAddress(effectiveObserverAddress),
          },
        ],
      });

      if (result.isErr()) {
        logFollow("failed to fetch follow status", {
          observerAddress: effectiveObserverAddress,
          profileAddress,
          error: result.error?.message || "unknown fetchFollowStatus error",
        }, "error");
        setIsFollowing(false);
        return;
      }

      const currentStatus = result.value?.[0]?.isFollowing;
      const statusState = getFollowStatusState(currentStatus);
      setIsFollowing(statusState.onChain);
      logFollow("refresh status response", {
        reason: options?.reason || "follow-status-refresh",
        observerAddress: effectiveObserverAddress,
        profileAddress,
        currentStatus,
        normalizedOnChain: statusState.onChain,
        normalizedOptimistic: statusState.optimistic,
      });
    } catch (error) {
      logFollow("failed to fetch follow status", {
        observerAddress: effectiveObserverAddress,
        profileAddress,
        error: String((error as any)?.message || error),
      }, "error");
      setIsFollowing(false);
    } finally {
      setFollowStatusLoading(false);
      await refreshProfileSnapshot(options?.reason || "follow-status-refresh");
    }
  }, [logFollow, observerAddress, profileAddress, refreshProfileSnapshot, sessionClient]);

  const executeFollowToggle = useCallback(async (params: {
    targetAddress: string;
    targetHandleLabel: string;
    targetUsername: string;
    wasFollowing: boolean;
    canFollowByProtocol: boolean;
    context: "profile-page" | "connections-list";
  }): Promise<FollowToggleExecutionResult> => {
    const {
      targetAddress,
      targetHandleLabel,
      targetUsername,
      wasFollowing,
      canFollowByProtocol: canFollowForTarget,
      context,
    } = params;

    const activeSessionClient = await resolveActiveSessionClient();
    if (!activeSessionClient) {
      toast.error("Please connect your wallet and sign in to Lens.");
      return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress: observerAddress };
    }

    if (!walletClient) {
      toast.error("Wallet not ready. Reconnect and try again.");
      return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress: observerAddress };
    }

    const sessionObserverAddress = await getSessionObserverAddress(activeSessionClient);
    const effectiveObserverAddress = sessionObserverAddress || observerAddress;
    const canFollowNow = Boolean(effectiveObserverAddress)
      && Boolean(targetAddress)
      && effectiveObserverAddress.toLowerCase() !== targetAddress.toLowerCase();

    const runtimeChainId = await walletClient.getChainId().catch(() => walletClient.chain?.id);
    logFollow("click", {
      context,
      walletAddress: walletClient.account?.address,
      chainId: runtimeChainId,
      observerAddress: effectiveObserverAddress,
      observerAddressFromSession: sessionObserverAddress || null,
      observerAddressFromState: observerAddress || null,
      targetProfileAddress: targetAddress,
      targetHandle: targetHandleLabel,
      targetUsername,
      canFollowNow,
      canFollowByProtocol: canFollowForTarget,
      isFollowing: wasFollowing,
      lensBackendEndpoint,
    });

    if (sessionObserverAddress && sessionObserverAddress !== sessionProfileAddress) {
      setSessionProfileAddress(sessionObserverAddress);
    }

    if (!canFollowNow) {
      toast.error("Please connect your wallet and sign in to Lens.");
      return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress };
    }

    if (!wasFollowing && !canFollowForTarget) {
      toast.error("This profile cannot be followed right now.");
      return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress };
    }

    const isLensTestnet = await ensureLensTestnetChain();
    if (!isLensTestnet) {
      logFollow("wallet switch failed", {
        context,
        requiredChainId: LENS_TESTNET_CHAIN_ID,
      }, "warn");
      return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress };
    }

    const chainBeforeSigning = await walletClient.getChainId().catch(() => walletClient.chain?.id);
    logFollow("wallet chain before signing", {
      context,
      chainId: chainBeforeSigning,
      requiredChainId: LENS_TESTNET_CHAIN_ID,
    });

    if (chainBeforeSigning !== LENS_TESTNET_CHAIN_ID) {
      toast.error("Wallet is not on Lens Chain Testnet (37111).");
      return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress };
    }

    try {
      const operation = wasFollowing
        ? await unfollow(activeSessionClient, { account: evmAddress(targetAddress) })
        : await follow(activeSessionClient, { account: evmAddress(targetAddress) });

      if (operation.isErr()) {
        toast.error(operation.error.message || "Failed to update follow status.");
        logFollow("mutation response", {
          context,
          action: wasFollowing ? "unfollow" : "follow",
          ok: false,
          error: operation.error?.message || "unknown follow mutation error",
        }, "error");
        return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress };
      }

      const operationValue: any = operation.value;
      logFollow("mutation response", {
        context,
        action: wasFollowing ? "unfollow" : "follow",
        ok: true,
        typename: operationValue?.__typename || null,
        hash: operationValue?.hash || null,
        reason: operationValue?.reason || null,
      });

      if (
        operationValue?.__typename === "SelfFundedTransactionRequest"
        || operationValue?.__typename === "SponsoredTransactionRequest"
      ) {
        logFollow("mutation transaction request", {
          context,
          action: wasFollowing ? "unfollow" : "follow",
          requestType: operationValue.__typename,
          from: operationValue?.raw?.from || null,
          to: operationValue?.raw?.to || null,
          chainId: operationValue?.raw?.chainId || null,
        });
      }

      const chainRightBeforeSigning = await walletClient.getChainId().catch(() => walletClient.chain?.id);
      logFollow("wallet chain right before signing", {
        context,
        chainId: chainRightBeforeSigning,
        requiredChainId: LENS_TESTNET_CHAIN_ID,
      });

      if (chainRightBeforeSigning !== LENS_TESTNET_CHAIN_ID) {
        toast.error("Wallet switched away from Lens Chain Testnet (37111).");
        return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress };
      }

      const operationHandler = handleOperationWith(walletClient as any) as any;
      const txResult = await operationHandler(operationValue);
      logFollow("handleOperationWith return value", txResult.isErr()
        ? {
          context,
          ok: false,
          action: wasFollowing ? "unfollow" : "follow",
          error: txResult.error?.message || "unknown transaction handler error",
        }
        : {
          context,
          ok: true,
          action: wasFollowing ? "unfollow" : "follow",
          identifier: String(txResult.value),
          looksLikeTxHash: isTxHashIdentifier(String(txResult.value)),
        });

      if (txResult.isErr()) {
        toast.error(txResult.error.message || "Failed to submit follow transaction.");
        return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress };
      }

      const txIdentifier = String(txResult.value);
      const nextFollowing = !wasFollowing;
      const resolution = await resolveLensOperationToTxHashOrReceipt({
        identifier: txIdentifier,
        sessionClient: activeSessionClient,
        statusClient: activeSessionClient,
        observerAddress: effectiveObserverAddress,
        profileAddress: targetAddress,
        expectedFollowing: nextFollowing,
        endpoint: lensBackendEndpoint,
        onLog: (event, data) => logFollow(event, { context, ...data }),
      });

      logFollow("operation resolution result", {
        context,
        action: wasFollowing ? "unfollow" : "follow",
        identifier: txIdentifier,
        resolution,
      });

      if (resolution.status !== "confirmed") {
        toast.error(resolution.reason || "Follow operation was not confirmed.");
        return { ok: false, nextFollowing, effectiveObserverAddress };
      }

      return { ok: true, nextFollowing, effectiveObserverAddress };
    } catch (error: any) {
      logFollow("follow toggle exception", {
        context,
        error: error?.message || String(error),
        stack: error?.stack || null,
      }, "error");
      toast.error(error?.message || "Failed to update follow status.");
      return { ok: false, nextFollowing: !wasFollowing, effectiveObserverAddress };
    }
  }, [
    ensureLensTestnetChain,
    getSessionObserverAddress,
    lensBackendEndpoint,
    logFollow,
    observerAddress,
    sessionProfileAddress,
    resolveActiveSessionClient,
    walletClient,
  ]);

  const loadConnections = useCallback(async (tab: ConnectionsTab, reason: string) => {
    if (!profileAddress) {
      setConnectionAccounts([]);
      setConnectionsError("Unable to load this profile's connections.");
      return;
    }

    setConnectionsLoading(true);
    setConnectionsError("");

    try {
      const activeSessionClient = await resolveActiveSessionClient();
      const queryClient = activeSessionClient ?? client;
      const result = tab === "followers"
        ? await fetchFollowers(queryClient, { account: evmAddress(profileAddress) })
        : await fetchFollowing(queryClient, { account: evmAddress(profileAddress) });

      if (result.isErr()) {
        setConnectionAccounts([]);
        setConnectionsError(result.error?.message || `Failed to load ${tab}.`);
        logFollow("connections load failed", {
          reason,
          tab,
          profileAddress,
          error: result.error?.message || "unknown connections query error",
        }, "error");
        return;
      }

      const accounts = (result.value?.items || [])
        .map((item: any) => (tab === "followers" ? item?.follower : item?.following))
        .map((entry: any) => toConnectionAccount(entry, observerAddress))
        .filter((entry: ConnectionAccount | null): entry is ConnectionAccount => Boolean(entry));

      setConnectionAccounts(accounts);
      logFollow("connections loaded", {
        reason,
        tab,
        profileAddress,
        count: accounts.length,
      });
    } catch (error) {
      setConnectionAccounts([]);
      setConnectionsError(`Failed to load ${tab}.`);
      logFollow("connections load exception", {
        reason,
        tab,
        profileAddress,
        error: String((error as any)?.message || error),
      }, "error");
    } finally {
      setConnectionsLoading(false);
    }
  }, [logFollow, observerAddress, profileAddress, resolveActiveSessionClient]);

  useEffect(() => {
    if (!isConnectionsModalOpen) {
      return;
    }
    void loadConnections(connectionsTab, "open-or-tab-change");
  }, [connectionsTab, isConnectionsModalOpen, loadConnections]);

  useEffect(() => {
    void refreshFollowStatus();
  }, [refreshFollowStatus]);

  useEffect(() => {
    void refreshProfileSnapshot("profile-load");
  }, [refreshProfileSnapshot]);

  const displayName = accountData?.displayName || normalizedHandle || "User";
  const handle = accountData?.handle || (normalizedHandle ? `@${normalizedHandle}` : "@user");
  const coverPicture = accountData?.coverPicture || "";
  const profilePicture = accountData?.picture || DEFAULT_PROFILE_AVATAR;
  const about = accountData?.bio || "";
  const jobTitle = accountData?.attributes?.["job title"] || "";
  const website = accountData?.attributes?.website || "";
  const websiteUrl = toAbsoluteUrl(website);
  const location = accountData?.attributes?.location || "";
  const x = accountData?.attributes?.x || "";
  const github = accountData?.attributes?.github || "";
  const linkedin = accountData?.attributes?.linkedin || "";
  const followers = getFollowCount(lensAccount, "followers");
  const score = 23694;
  const createPostHandle = loggedInProfile?.handle || handle;
  const messageUrl = viewedHandle ? `/messages?handle=${encodeURIComponent(viewedHandle)}` : "/messages";

  useEffect(() => {
    setFollowersCount(followers);
  }, [followers]);

  useEffect(() => {
    setFollowingCount(getFollowCount(lensAccount, "following"));
  }, [lensAccount]);

  const handleFollowToggle = async () => {
    setFollowSubmitting(true);
    const wasFollowing = isFollowing;
    let effectiveObserverAddress = observerAddress;

    try {
      const result = await executeFollowToggle({
        targetAddress: profileAddress,
        targetHandleLabel: handle,
        targetUsername: viewedHandle,
        wasFollowing,
        canFollowByProtocol,
        context: "profile-page",
      });

      effectiveObserverAddress = result.effectiveObserverAddress || observerAddress;
      if (!result.ok) {
        return;
      }

      setIsFollowing(result.nextFollowing);
      setFollowersCount((count) => Math.max(0, count + (result.nextFollowing ? 1 : -1)));
      toast.success(result.nextFollowing ? `You are now following ${handle}` : `You unfollowed ${handle}`);
    } finally {
      await refreshFollowStatus({
        observerAddressOverride: effectiveObserverAddress,
        reason: "post-follow-toggle",
      });
      setFollowSubmitting(false);
    }
  };

  const handleConnectionFollowToggle = async (account: ConnectionAccount) => {
    setConnectionFollowSubmitting((prev) => ({ ...prev, [account.address]: true }));
    const wasFollowing = account.isFollowedByMe;

    try {
      const result = await executeFollowToggle({
        targetAddress: account.address,
        targetHandleLabel: account.handle,
        targetUsername: account.localName,
        wasFollowing,
        canFollowByProtocol: account.canFollowByProtocol,
        context: "connections-list",
      });

      if (!result.ok) {
        return;
      }

      setConnectionAccounts((prev) => prev.map((entry) => (
        entry.address === account.address
          ? { ...entry, isFollowedByMe: result.nextFollowing }
          : entry
      )));
      toast.success(result.nextFollowing ? `You are now following ${account.handle}` : `You unfollowed ${account.handle}`);
      await loadConnections(connectionsTab, "post-connections-follow-toggle");
    } finally {
      setConnectionFollowSubmitting((prev) => {
        const next = { ...prev };
        delete next[account.address];
        return next;
      });
    }
  };

  const copyFollowDebug = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(followDebugLines.join("\n"));
      toast.success("Copied follow debug logs.");
    } catch {
      toast.error("Could not copy follow debug logs.");
    }
  }, [followDebugLines]);

  const followButtonLabel = !canFollowByProtocol && !isFollowing
    ? "Cannot Follow"
    : isFollowing
      ? "Following"
      : "Follow";
  const followButtonClassName = isFollowing
    ? "bg-white text-[#212121] border border-[#212121] hover:bg-[#F7F7F7]"
    : "bg-[#212121] text-white hover:bg-[#333]";
  const connectionsModalTitle = connectionsTab === "followers" ? "Followers" : "Following";
  const showConnectionFollowButtons = Boolean(observerAddress);

  if (!normalizedHandle) {
    return (
      <div className="bg-white min-h-screen pt-[120px] px-[24px]">
        <p className="text-[16px] text-[#6C6C6C]">Invalid profile route.</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="bg-white min-h-screen pt-[120px] px-[24px]">
        <p className="text-[16px] text-[#6C6C6C]">Loading profile...</p>
      </div>
    );
  }

  if (profileError || !lensAccount || !accountData) {
    return (
      <div className="bg-white min-h-screen pt-[120px] px-[24px]">
        <p className="text-[16px] text-[#212121] font-semibold">Profile not found</p>
        <p className="text-[14px] text-[#6C6C6C] mt-[6px]">
          Could not load <span className="font-medium">@{normalizedHandle}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-[156px] profile-md:px-[80px] profile-sm:px-[20px] sm:p-[0px] sm:pt-[60px] pt-[90px] sm:w-full mb-[40px]">
        <div className="relative w-full">
          <div className="w-full sm:h-[226] aspect-[1344/201] relative sm:rounded-none rounded-t-[12px] overflow-hidden bg-[#C0E0E7]">
            {coverPicture ? (
              <Image
                src={coverPicture}
                fill
                className="object-cover"
                alt="Cover"
                sizes="(max-width: 1344px) 100vw, 1344px"
              />
            ) : null}
          </div>
          <div className="absolute left-6 sm:left-4 -bottom-20 sm:-bottom-[68px] w-[154px] h-[154px] sm:w-[135px] sm:h-[135px] rounded-full border-[3px] border-white overflow-hidden">
            <div className="relative w-full h-full">
              <Image src={profilePicture} fill className="rounded-full object-cover" alt="Profile" />
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col lg:w-full gap-[30px] pt-[90px] sm:pt-[68px] bg-white px-[32px] sm:px-[0px]">
          <div className="max-w-[350px] sm:max-w-full min-w-[350px] sm:min-w-0 sm:w-full sm:px-[16px]">
            <div className="flex items-center gap-2 mb-[4px]">
              <h1 className="text-[24px] font-bold text-[#212121] leading-[29px]">{displayName}</h1>
              {isOwnProfile ? (
                <Link href="/settings" className="text-[#212121] hover:opacity-80">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.24141 16.8751H3.75C3.58424 16.8751 3.42527 16.8093 3.30806 16.692C3.19085 16.5748 3.125 16.4159 3.125 16.2501V12.7587C3.12508 12.5932 3.19082 12.4344 3.30781 12.3173L12.9422 2.68291C13.0594 2.56579 13.2183 2.5 13.384 2.5C13.5497 2.5 13.7086 2.56579 13.8258 2.68291L17.3172 6.17198C17.4343 6.28917 17.5001 6.44808 17.5001 6.61377C17.5001 6.77946 17.4343 6.93837 17.3172 7.05557L7.68281 16.6923C7.56569 16.8093 7.40695 16.875 7.24141 16.8751Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.625 5L15 9.375"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ) : null}
            </div>
            <span className="block text-[#6C6C6C] text-[14px] font-medium mb-[12px] leading-[20px]">
              {handle}
            </span>
            {jobTitle ? (
              <h2 className="text-[16px] font-semibold text-[#212121] mb-[12px] leading-[22px]">
                {jobTitle}
              </h2>
            ) : null}
            {about ? (
              <p className="text-[14px] text-[#6C6C6C] leading-[20px] mb-[16px]">{about}</p>
            ) : null}

            {showFollowDebug ? (
              <div className="my-[12px] rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] p-[10px]">
                <div className="mb-[8px] flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-[#212121]">Follow Debug</p>
                  <button
                    type="button"
                    onClick={copyFollowDebug}
                    className="rounded-[6px] border border-[#D4D4D8] bg-white px-[8px] py-[4px] text-[11px] font-medium text-[#212121]"
                  >
                    Copy Logs
                  </button>
                </div>
                <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap break-all text-[11px] leading-[16px] text-[#3F3F46]">
                  {followDebugLines.length > 0 ? followDebugLines.join("\n") : "No follow debug logs yet."}
                </pre>
              </div>
            ) : null}

            <div className="flex gap-[16px] mt-[16px] mb-[10px]">
              <button
                type="button"
                onClick={() => openConnectionsModal("followers")}
                className="leading-[20px] text-left cursor-pointer group"
              >
                <span className="font-semibold sm:text-[14px] text-[20px] text-[#212121]">
                  {followersCount}
                </span>
                <span className="font-medium sm:text-[12px] text-[16px] text-[#6C6C6C] ml-1 group-hover:underline">
                  Followers
                </span>
              </button>
              <button
                type="button"
                onClick={() => openConnectionsModal("following")}
                className="leading-[20px] text-left cursor-pointer group"
              >
                <span className="font-semibold sm:text-[14px] text-[20px] text-[#212121]">
                  {followingCount}
                </span>
                <span className="font-medium sm:text-[12px] text-[16px] text-[#6C6C6C] ml-1 group-hover:underline">
                  Following
                </span>
              </button>
            </div>

            {!isOwnProfile ? (
              <div className="flex items-center gap-[8px] mb-[16px]">
                <button
                  className={`h-[34px] inline-flex items-center justify-center gap-1.5 rounded-full px-[12px] text-[13px] font-medium transition-colors ${followButtonClassName}`}
                  onClick={handleFollowToggle}
                  disabled={followSubmitting || followStatusLoading || (!canFollowByProtocol && !isFollowing)}
                >
                  {isFollowing ? <CheckIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                  {followButtonLabel}
                </button>
                <Link
                  href={messageUrl}
                  className="h-[34px] inline-flex items-center justify-center rounded-full border border-[#212121] bg-white text-[#212121] px-[12px] text-[13px] font-medium hover:bg-[#F7F7F7] transition-colors"
                >
                  Message
                </Link>
              </div>
            ) : null}

            <hr className="bg-[##8C8C8C33] h-[1px] mb-0" />

            <div className="flex gap-[12px] my-[16px]">
              {x ? (
                <Link target="_blank" href={toAbsoluteUrl(x)} className="text-[#6C6C6C] hover:text-[#212121]">
                  <Image src="/images/twitter-social.svg" alt="X" width={24} height={24} />
                </Link>
              ) : null}
              {github ? (
                <Link
                  target="_blank"
                  href={toAbsoluteUrl(github)}
                  className="text-[#6C6C6C] hover:text-[#212121]"
                >
                  <Image src="/images/github-social.svg" alt="GitHub" width={24} height={24} />
                </Link>
              ) : null}
              {linkedin ? (
                <Link
                  target="_blank"
                  href={toAbsoluteUrl(linkedin)}
                  className="text-[#6C6C6C] hover:text-[#212121]"
                >
                  <Image src="/images/linkedin-social.svg" alt="LinkedIn" width={24} height={24} />
                </Link>
              ) : null}
            </div>

            <div className="flex flex-col gap-[12px]">
              {website ? (
                <Link
                  href={websiteUrl}
                  target="_blank"
                  className="flex items-center gap-[12px] text-[#212121] hover:opacity-80"
                >
                  <Image src="/icons/globe.svg" alt="" width={20} height={20} />
                  <span className="text-[14px] font-medium">{getDomain(websiteUrl)}</span>
                </Link>
              ) : null}
              {location ? (
                <div className="flex items-center gap-[12px] text-[#212121]">
                  <Image src="/images/MapPin.svg" alt="" width={18} height={24} />
                  <span className="text-[14px] font-medium">{location}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-[12px]">
                <Image
                  src="/images/w.svg"
                  alt="Score"
                  width={24}
                  height={16}
                  className="text-[#351A6B]"
                />
                <span className="text-[14px] font-semibold text-[#212121]">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>
            {isOwnProfile ? (
              <button
                className="w-full sm:flex h-[40px] hidden items-center justify-center gap-2 rounded-full bg-[#212121] text-white py-2 px-4 text-[14px] font-medium hover:bg-[#333] transition-colors shrink-0 mt-[16px]"
                onClick={handleOpenJobModal}
              >
                <PlusIcon className="w-5 h-5" />
                Create Post
              </button>
            ) : null}
          </div>
          <hr className="bg-[#E4E4E7] h-[1px] mb-0 hidden lg:block" />

          <div className="sm:pt-0 pt-[0] flex-1 min-w-0 sm:px-[16px]">
            <div className="flex flex-row items-center justify-between gap-4 mb-[16px]">
              <h2 className="text-[20px] font-semibold text-[#212121] leading-[24px]">All Posts</h2>
              {isOwnProfile ? (
                <button
                  className="order-1 sm:hidden md:order-2 w-full max-w-[153px] md:w-[153px] h-[40px] flex items-center justify-center gap-2 rounded-full bg-[#212121] text-white py-2 px-4 text-[14px] font-medium hover:bg-[#333] transition-colors shrink-0"
                  onClick={handleOpenJobModal}
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Post
                </button>
              ) : null}
            </div>
            <div className="bg-white">
              {postsLoading ? (
                <p className="text-[14px] text-[#6C6C6C] py-[12px]">Loading posts...</p>
              ) : profilePosts.length === 0 ? (
                <p className="text-[14px] text-[#6C6C6C] py-[12px]">No posts yet.</p>
              ) : (
                profilePosts.map((post, index) => (
                  <ProfilePostCard
                    key={`${post.title}-${index}`}
                    profileImage={profilePicture}
                    displayName={displayName}
                    type={post.type}
                    title={post.title}
                    description={post.description}
                    tags={post.tags}
                    paymentAmount={post.paymentAmount}
                    isLast={index === profilePosts.length - 1}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {isConnectionsModalOpen && (
          <div
            className="fixed inset-0 z-[99990] bg-black/35 flex items-center justify-center p-[16px]"
            onClick={closeConnectionsModal}
          >
            <div
              className="w-full max-w-[700px] max-h-[85vh] rounded-[12px] border border-[#E4E4E7] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="px-[20px] py-[14px] border-b border-[#E4E4E7] flex items-center justify-between">
                <h3 className="text-[18px] font-semibold text-[#212121]">{connectionsModalTitle}</h3>
                <button
                  type="button"
                  onClick={closeConnectionsModal}
                  className="h-[34px] px-[12px] rounded-[8px] border border-[#D4D4D8] text-[13px] font-medium text-[#212121] hover:bg-[#F7F7F7]"
                >
                  Close
                </button>
              </div>

              <div className="px-[20px] py-[10px] border-b border-[#E4E4E7] flex gap-[8px]">
                <button
                  type="button"
                  onClick={() => setConnectionsTab("followers")}
                  className={`h-[34px] px-[12px] rounded-[8px] border text-[13px] font-medium ${
                    connectionsTab === "followers"
                      ? "bg-[#212121] text-white border-[#212121]"
                      : "bg-white text-[#212121] border-[#D4D4D8] hover:bg-[#F7F7F7]"
                  }`}
                >
                  Followers
                </button>
                <button
                  type="button"
                  onClick={() => setConnectionsTab("following")}
                  className={`h-[34px] px-[12px] rounded-[8px] border text-[13px] font-medium ${
                    connectionsTab === "following"
                      ? "bg-[#212121] text-white border-[#212121]"
                      : "bg-white text-[#212121] border-[#D4D4D8] hover:bg-[#F7F7F7]"
                  }`}
                >
                  Following
                </button>
              </div>

              <div className="max-h-[58vh] overflow-y-auto">
                {connectionsLoading ? (
                  <p className="px-[20px] py-[22px] text-[14px] text-[#6C6C6C]">
                    Loading {connectionsTab}...
                  </p>
                ) : connectionsError ? (
                  <div className="px-[20px] py-[22px]">
                    <p className="text-[14px] text-[#B91C1C]">{connectionsError}</p>
                    <button
                      type="button"
                      onClick={() => void loadConnections(connectionsTab, "retry")}
                      className="mt-[10px] h-[34px] px-[12px] rounded-[8px] border border-[#D4D4D8] text-[13px] font-medium text-[#212121] hover:bg-[#F7F7F7]"
                    >
                      Retry
                    </button>
                  </div>
                ) : connectionAccounts.length === 0 ? (
                  <p className="px-[20px] py-[22px] text-[14px] text-[#6C6C6C]">
                    No {connectionsTab} found.
                  </p>
                ) : (
                  connectionAccounts.map((account) => {
                    const rowSubmitting = Boolean(connectionFollowSubmitting[account.address]);
                    const rowDisabled = rowSubmitting || (!account.canFollowByProtocol && !account.isFollowedByMe);
                    const rowLabel = rowSubmitting
                      ? account.isFollowedByMe
                        ? "Unfollowing..."
                        : "Following..."
                      : !account.canFollowByProtocol && !account.isFollowedByMe
                        ? "Cannot Follow"
                        : account.isFollowedByMe
                          ? "Unfollow"
                          : "Follow";

                    return (
                      <div
                        key={`${connectionsTab}-${account.address}`}
                        className="px-[20px] py-[14px] border-b border-[#F4F4F5] flex items-start gap-[12px]"
                      >
                        <div className="w-[44px] h-[44px] rounded-full overflow-hidden border border-[#E4E4E7] relative shrink-0 bg-[#F4F4F5]">
                          <Image src={account.picture || DEFAULT_PROFILE_AVATAR} alt={account.displayName} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          {account.profilePath ? (
                            <Link
                              href={account.profilePath}
                              onClick={closeConnectionsModal}
                              className="block hover:opacity-80"
                            >
                              <p className="text-[14px] font-semibold text-[#212121] truncate underline-offset-2 hover:underline">
                                {account.displayName}
                              </p>
                              <p className="text-[13px] text-[#6C6C6C] truncate underline-offset-2 hover:underline">
                                {account.handle}
                              </p>
                            </Link>
                          ) : (
                            <>
                              <p className="text-[14px] font-semibold text-[#212121] truncate">{account.displayName}</p>
                              <p className="text-[13px] text-[#6C6C6C] truncate">{account.handle}</p>
                            </>
                          )}
                          {!account.profilePath ? (
                            <p className="mt-[6px] text-[12px] text-[#A1A1AA]">No handle available</p>
                          ) : null}
                        </div>

                        {showConnectionFollowButtons && !account.isSelf ? (
                          <button
                            type="button"
                            onClick={() => void handleConnectionFollowToggle(account)}
                            disabled={rowDisabled}
                            className={`h-[36px] min-w-[108px] px-[12px] rounded-full text-[13px] font-medium transition-colors ${
                              account.isFollowedByMe
                                ? "bg-white text-[#212121] border border-[#212121] hover:bg-[#F7F7F7]"
                                : "bg-[#212121] text-white hover:bg-[#333]"
                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                          >
                            {rowLabel}
                          </button>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {isJobModalOpen && (
          <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800/50 flex justify-center items-center sm:items-end cursor-auto">
            <div className="w-full flex justify-center items-center sm:items-end min-h-full sm:min-h-0">
              <CreatePostModal handleCloseModal={handleCloseJobModal} handle={createPostHandle} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
