"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import {
  Client,
  IdentifierKind,
  getInboxIdForIdentifier,
  type EOASigner,
  type Identifier,
  type SCWSigner,
} from "@xmtp/browser-sdk";
import { hexToBytes, stringToHex, type Address } from "viem";
import { useSignMessage, useWalletClient } from "wagmi";
import { setError, setInitializing } from "@/redux/xmtp";
import { RootState } from "@/redux/store";
import { useXMTP } from "@/app/XMTPContext";

const LENS_TESTNET_CHAIN_ID = 37111n;
const LENS_MAINNET_CHAIN_ID = 232n;
const XMTP_MAX_INSTALLATIONS = 10;

const XMTP_SESSION_STORE_KEY = "w3rk:xmtp:session-store:v3";
const XMTP_RESTORE_DEBUG_KEY = "w3rk:xmtp:restore-debug:last";

type UseXMTPClientParams = {
  walletAddress?: string;
  lensAccountAddress?: string;
  lensProfileId?: string;
  lensHandle?: string;
};

export type XMTPConnectStage =
  | "idle"
  | "prompt_signature"
  | "restore_session"
  | "build_failed_fallback_create"
  | "create_client"
  | "check_registration"
  | "register_account"
  | "connected"
  | "failed";

type XMTPConnectOptions = {
  onStage?: (stage: XMTPConnectStage) => void;
};

type XMTPEnv = "local" | "dev" | "production";

type PersistedSession = {
  env: XMTPEnv;
  identifier: string;
  dbEncryptionKey?: string;
  inboxId?: string;
  installationId?: string;
  signerType?: "EOA" | "SCW";
  updatedAt: string;
};

type SessionStore = {
  version: 1;
  records: Record<string, PersistedSession>;
};

type RestoreAttemptDebug = {
  env: XMTPEnv;
  identifier: string;
  usedDbEncryptionKey: boolean;
  build: "ok" | "failed";
  inboxId: string | null;
  installationId: string | null;
  matchesPersistedInstallation: boolean | null;
  registrationCheckFailed: boolean;
  installationInInbox: boolean | null;
  conversationAccess: boolean | null;
  isRegistered: boolean | null;
  canMessageReady: boolean | null;
  error?: string;
};

type RestoreDebugSnapshot = {
  timestamp: string;
  result: "restored" | "not_restored" | "error";
  identity: {
    walletAddress: string | null;
    lensAccountAddress: string | null;
    lensProfileId: string | null;
    lensHandle: string | null;
    xmtpAddress: string | null;
    isScwIdentity: boolean;
  };
  envCandidates: XMTPEnv[];
  identifierCandidates: string[];
  attempts: RestoreAttemptDebug[];
  restoredEnv?: XMTPEnv;
  restoredIdentifier?: string;
  reason?: string;
  error?: string;
};

const isValidEnv = (value: string | null | undefined): value is XMTPEnv =>
  value === "local" || value === "dev" || value === "production";

const normalizeAddress = (value?: string | null) => value?.toLowerCase() ?? "";

const isAddress = (value: string) => value.startsWith("0x") && value.length === 42;

const unique = <T,>(values: T[]) => Array.from(new Set(values));

const stringifyError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const toBase64 = (bytes: Uint8Array): string => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return window.btoa(binary);
  }

  return "";
};

const fromBase64 = (value: string): Uint8Array => {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  return new Uint8Array();
};

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const isInstallationLimitError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes("cannot register a new installation") && message.includes("installations");
};

const extractInboxIdFromError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return undefined;
  }

  const match =
    error.message.match(/inboxid\s+([a-f0-9]{64})/i) ??
    error.message.match(/inbox\s+([a-f0-9]{64})/i);

  return match?.[1]?.toLowerCase();
};

export function useXMTPClient(params?: UseXMTPClientParams) {
  const dispatch = useDispatch();
  const { client, setClient } = useXMTP();
  const xmtpState = useSelector((state: RootState) => state.xmtp);

  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();

  const [connectingXMTP, setConnectingXMTP] = useState(false);
  const [connectStage, setConnectStage] = useState<XMTPConnectStage>("idle");

  const walletAddress = normalizeAddress(params?.walletAddress);
  const lensAccountAddress = normalizeAddress(params?.lensAccountAddress);
  const lensProfileId = params?.lensProfileId;
  const lensHandle = params?.lensHandle;

  const xmtpAddress = (lensAccountAddress || walletAddress || "").toLowerCase();
  const walletClientAddress = normalizeAddress(walletClient?.account?.address);
  const isScwIdentity = Boolean(lensAccountAddress && walletAddress && lensAccountAddress !== walletAddress);

  const identityKeys = useMemo(() => {
    const keys = [
      lensProfileId ? `lens:id:${lensProfileId}` : null,
      lensHandle ? `lens:handle:${lensHandle.toLowerCase().replace(/^@/, "")}` : null,
      lensAccountAddress ? `lens:address:${lensAccountAddress}` : null,
      walletAddress ? `wallet:${walletAddress}` : null,
      walletClientAddress ? `walletClient:${walletClientAddress}` : null,
      xmtpAddress ? `xmtp:${xmtpAddress}` : null,
    ].filter((value): value is string => Boolean(value));

    return unique(keys);
  }, [lensProfileId, lensHandle, lensAccountAddress, walletAddress, walletClientAddress, xmtpAddress]);

  const identifierCandidates = useMemo(() => {
    return unique([xmtpAddress, walletAddress, walletClientAddress].filter(isAddress));
  }, [xmtpAddress, walletAddress, walletClientAddress]);

  const primaryIdentifier = identifierCandidates[0] ?? "";

  const getConfiguredEnv = useCallback((): XMTPEnv | null => {
    const configuredEnv =
      process.env.NEXT_PUBLIC_XMTP_ENV ?? process.env.NEXT_PUBLIC_XMTP_ENVIRONMENT;
    return isValidEnv(configuredEnv) ? configuredEnv : null;
  }, []);

  const resolveEnv = useCallback((): XMTPEnv => {
    const configuredEnv = getConfiguredEnv();
    if (configuredEnv) {
      return configuredEnv;
    }

    const walletChainId =
      typeof walletClient?.chain?.id === "number" ? BigInt(walletClient.chain.id) : null;
    const configuredLensChainId =
      process.env.NEXT_PUBLIC_LENS_CHAIN_ID && Number.isFinite(Number(process.env.NEXT_PUBLIC_LENS_CHAIN_ID))
        ? BigInt(process.env.NEXT_PUBLIC_LENS_CHAIN_ID)
        : null;

    const chainId = walletChainId ?? configuredLensChainId ?? LENS_TESTNET_CHAIN_ID;
    return chainId === LENS_MAINNET_CHAIN_ID ? "production" : "dev";
  }, [getConfiguredEnv, walletClient?.chain?.id]);

  const logDebug = useCallback(
    (event: string, details?: Record<string, unknown>) => {
      console.info("[XMTP_DEBUG]", {
        event,
        walletAddress: walletAddress || null,
        lensAccountAddress: lensAccountAddress || null,
        xmtpAddress: xmtpAddress || null,
        lensProfileId: lensProfileId ?? null,
        lensHandle: lensHandle ?? null,
        isScwIdentity,
        ...details,
      });
    },
    [walletAddress, lensAccountAddress, xmtpAddress, lensProfileId, lensHandle, isScwIdentity]
  );

  const logError = useCallback(
    (event: string, error: unknown, details?: Record<string, unknown>) => {
      console.error("[XMTP_DEBUG_ERROR]", {
        event,
        walletAddress: walletAddress || null,
        lensAccountAddress: lensAccountAddress || null,
        xmtpAddress: xmtpAddress || null,
        lensProfileId: lensProfileId ?? null,
        lensHandle: lensHandle ?? null,
        isScwIdentity,
        error: stringifyError(error),
        ...details,
      });
    },
    [walletAddress, lensAccountAddress, xmtpAddress, lensProfileId, lensHandle, isScwIdentity]
  );

  const persistRestoreDebug = useCallback(
    (payload: Omit<RestoreDebugSnapshot, "timestamp" | "identity">) => {
      if (typeof window === "undefined") {
        return;
      }

      const snapshot: RestoreDebugSnapshot = {
        timestamp: new Date().toISOString(),
        identity: {
          walletAddress: walletAddress || null,
          lensAccountAddress: lensAccountAddress || null,
          lensProfileId: lensProfileId ?? null,
          lensHandle: lensHandle ?? null,
          xmtpAddress: xmtpAddress || null,
          isScwIdentity,
        },
        ...payload,
      };

      window.localStorage.setItem(XMTP_RESTORE_DEBUG_KEY, JSON.stringify(snapshot));
    },
    [walletAddress, lensAccountAddress, lensProfileId, lensHandle, xmtpAddress, isScwIdentity]
  );

  const readSessionStore = useCallback((): SessionStore => {
    if (typeof window === "undefined") {
      return { version: 1, records: {} };
    }

    try {
      const raw = window.localStorage.getItem(XMTP_SESSION_STORE_KEY);
      if (!raw) {
        return { version: 1, records: {} };
      }

      const parsed = JSON.parse(raw) as Partial<SessionStore>;
      const records = parsed?.records;
      if (!records || typeof records !== "object") {
        return { version: 1, records: {} };
      }

      const normalizedRecords: Record<string, PersistedSession> = {};
      for (const [key, value] of Object.entries(records as Record<string, unknown>)) {
        if (!value || typeof value !== "object") {
          continue;
        }

        const candidate = value as Partial<PersistedSession>;
        if (
          !isValidEnv(candidate.env) ||
          typeof candidate.identifier !== "string" ||
          !isAddress(candidate.identifier.toLowerCase())
        ) {
          continue;
        }

        normalizedRecords[key] = {
          env: candidate.env,
          identifier: candidate.identifier.toLowerCase(),
          dbEncryptionKey:
            typeof candidate.dbEncryptionKey === "string" && candidate.dbEncryptionKey.length > 0
              ? candidate.dbEncryptionKey
              : undefined,
          inboxId:
            typeof candidate.inboxId === "string" && candidate.inboxId.length > 0
              ? candidate.inboxId
              : undefined,
          installationId:
            typeof candidate.installationId === "string" && candidate.installationId.length > 0
              ? candidate.installationId
              : undefined,
          signerType:
            candidate.signerType === "EOA" || candidate.signerType === "SCW"
              ? candidate.signerType
              : undefined,
          updatedAt:
            typeof candidate.updatedAt === "string" && candidate.updatedAt.length > 0
              ? candidate.updatedAt
              : new Date().toISOString(),
        };
      }

      return {
        version: 1,
        records: normalizedRecords,
      };
    } catch {
      return { version: 1, records: {} };
    }
  }, []);

  const writeSessionStore = useCallback((store: SessionStore) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(XMTP_SESSION_STORE_KEY, JSON.stringify(store));
  }, []);

  const findPersistedSession = useCallback(
    (env: XMTPEnv): PersistedSession | null => {
      const store = readSessionStore();
      const scopedKeys = unique([
        ...identityKeys,
        ...identifierCandidates.map(identifier => `identifier:${identifier}`),
      ]);
      const sessions = scopedKeys
        .map(key => store.records[key])
        .filter((value): value is PersistedSession => Boolean(value))
        .filter(session => session.env === env)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

      return sessions[0] ?? null;
    },
    [identityKeys, identifierCandidates, readSessionStore]
  );

  const collectRestoreSessions = useCallback(
    (envCandidates: XMTPEnv[]): PersistedSession[] => {
      const store = readSessionStore();
      const scopedKeys = unique([
        ...identityKeys,
        ...identifierCandidates.map(identifier => `identifier:${identifier}`),
      ]);
      const scopedSessions = scopedKeys
        .map(key => store.records[key])
        .filter((value): value is PersistedSession => Boolean(value));

      const fallbackSessions = envCandidates.flatMap(env =>
        identifierCandidates.map(identifier => ({
          env,
          identifier,
          updatedAt: new Date(0).toISOString(),
        }))
      );

      const dedupe = new Map<string, PersistedSession>();
      for (const session of [...scopedSessions, ...fallbackSessions]) {
        const key = `${session.env}|${session.identifier}|${session.dbEncryptionKey ?? "none"}`;
        const existing = dedupe.get(key);
        if (!existing || Date.parse(session.updatedAt) > Date.parse(existing.updatedAt)) {
          dedupe.set(key, session);
        }
      }

      return Array.from(dedupe.values());
    },
    [identityKeys, identifierCandidates, readSessionStore]
  );

  const persistSession = useCallback(
    (session: PersistedSession) => {
      const store = readSessionStore();
      const records = { ...store.records };

      for (const key of unique([...identityKeys, `identifier:${session.identifier}`])) {
        records[key] = session;
      }

      writeSessionStore({ version: 1, records });
    },
    [identityKeys, readSessionStore, writeSessionStore]
  );

  const verifyConversationAccess = useCallback(async (xmtpClient: Client<unknown>) => {
    try {
      await withTimeout(
        xmtpClient.conversations.list({ limit: 1n }),
        10000,
        "Listing XMTP conversations timed out."
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  const verifyClientReady = useCallback(
    async (
      xmtpClient: Client<unknown>,
      env: XMTPEnv,
      identifier: string,
      expected?: { inboxId?: string; installationId?: string }
    ) => {
      const attempt: RestoreAttemptDebug = {
        env,
        identifier,
        usedDbEncryptionKey: true,
        build: "ok",
        inboxId: (xmtpClient as { inboxId?: string }).inboxId ?? null,
        installationId: (xmtpClient as { installationId?: string }).installationId ?? null,
        matchesPersistedInstallation: null,
        registrationCheckFailed: false,
        installationInInbox: null,
        conversationAccess: null,
        isRegistered: null,
        canMessageReady: null,
      };

      if (expected?.inboxId || expected?.installationId) {
        const inboxMatches = !expected.inboxId || expected.inboxId === attempt.inboxId;
        const installationMatches =
          !expected.installationId || expected.installationId === attempt.installationId;
        const matches = inboxMatches && installationMatches;
        attempt.matchesPersistedInstallation = matches;
        attempt.installationInInbox = matches;
        if (!matches) {
          attempt.error = "installation_mismatch";
        }
      }

      try {
        attempt.isRegistered = await withTimeout(
          xmtpClient.isRegistered(),
          10000,
          "Checking XMTP registration timed out."
        );
      } catch (error) {
        attempt.registrationCheckFailed = true;
        attempt.error = `isRegistered:${stringifyError(error)}`;
      }

      try {
        const canMessageMap = await withTimeout(
          xmtpClient.canMessage([
            {
              identifier,
              identifierKind: IdentifierKind.Ethereum,
            },
          ]),
          8000,
          "Checking XMTP canMessage timed out."
        );

        attempt.canMessageReady = Boolean(canMessageMap.get(identifier));
      } catch (error) {
        const text = `canMessage:${stringifyError(error)}`;
        attempt.error = attempt.error ? `${attempt.error} | ${text}` : text;
      }

      attempt.conversationAccess = await verifyConversationAccess(xmtpClient);

      const ready =
        attempt.isRegistered === true &&
        (attempt.canMessageReady === true || attempt.conversationAccess === true);

      if (!ready && !attempt.error) {
        attempt.error = "readiness_gate_failed";
      }

      return {
        ready,
        attempt,
      };
    },
    [verifyConversationAccess]
  );

  const signWithEthereumProvider = useCallback(
    async (message: string, accountAddress: Address | null): Promise<string | null> => {
      if (typeof window === "undefined") {
        return null;
      }

      const ethereum = (
        window as Window & {
          ethereum?: {
            request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
          };
        }
      ).ethereum;

      if (!ethereum?.request || !accountAddress) {
        return null;
      }

      try {
        const signature = await ethereum.request({
          method: "personal_sign",
          params: [stringToHex(message), accountAddress],
        });

        return typeof signature === "string" ? signature : null;
      } catch {
        return null;
      }
    },
    []
  );

  const requestWalletSignature = useCallback(
    async (
      message: string,
      source: "preflight" | "xmtp_signer" | "xmtp_signer_eoa_fallback",
      overrideAddress?: Address | null
    ) => {
      const signingAddress =
        overrideAddress ??
        (walletClient?.account?.address as Address | undefined) ??
        (walletAddress as Address | undefined) ??
        null;

      logDebug("signature:start", {
        source,
        signingAddress,
      });

      const walletClientSignature = await withTimeout(
        (async () => {
          if (!walletClient) {
            return null;
          }

          try {
            return await walletClient.signMessage({
              account: signingAddress ?? walletClient.account,
              message,
            });
          } catch {
            return null;
          }
        })(),
        35000,
        "Wallet signature timed out."
      );

      const wagmiSignature =
        typeof walletClientSignature === "string"
          ? walletClientSignature
          : await withTimeout(
              signMessageAsync({ message }).catch(() => null),
              35000,
              "Wallet signature timed out."
            );

      const providerSignature =
        typeof wagmiSignature === "string"
          ? wagmiSignature
          : await withTimeout(
              signWithEthereumProvider(message, signingAddress),
              35000,
              "Wallet signature timed out."
            );

      if (!providerSignature || !providerSignature.startsWith("0x")) {
        throw new Error("Wallet signature request failed or was cancelled.");
      }

      logDebug("signature:success", {
        source,
      });

      return hexToBytes(providerSignature as `0x${string}`);
    },
    [logDebug, signMessageAsync, signWithEthereumProvider, walletAddress, walletClient]
  );

  const buildSigner = useCallback(
    (
      identifier: string,
      env: XMTPEnv,
      mode: "primary" | "eoa_fallback"
    ): EOASigner | SCWSigner => {
      const walletChainId =
        typeof walletClient?.chain?.id === "number" ? BigInt(walletClient.chain.id) : null;
      const configuredLensChainId =
        process.env.NEXT_PUBLIC_LENS_CHAIN_ID && Number.isFinite(Number(process.env.NEXT_PUBLIC_LENS_CHAIN_ID))
          ? BigInt(process.env.NEXT_PUBLIC_LENS_CHAIN_ID)
          : null;

      const chainId =
        walletChainId ?? configuredLensChainId ?? (env === "production" ? LENS_MAINNET_CHAIN_ID : LENS_TESTNET_CHAIN_ID);

      const base = {
        getIdentifier: () =>
          ({
            identifier,
            identifierKind: IdentifierKind.Ethereum,
          }) as Identifier,
        signMessage: async (message: string): Promise<Uint8Array> => {
          setConnectStage("prompt_signature");
          return requestWalletSignature(
            message,
            mode === "eoa_fallback" ? "xmtp_signer_eoa_fallback" : "xmtp_signer",
            mode === "eoa_fallback"
              ? ((walletAddress || walletClient?.account?.address || null) as Address | null)
              : undefined
          );
        },
      };

      const shouldUseScw = mode === "primary" && isScwIdentity && identifier === xmtpAddress;
      if (shouldUseScw) {
        return {
          type: "SCW",
          ...base,
          getChainId: () => chainId,
        };
      }

      return {
        type: "EOA",
        ...base,
      };
    },
    [isScwIdentity, requestWalletSignature, walletAddress, walletClient?.account?.address, walletClient?.chain?.id, xmtpAddress]
  );

  const recoverInstallationLimit = useCallback(
    async (signer: EOASigner | SCWSigner, env: XMTPEnv, error: unknown) => {
      const signerIdentifier = await signer.getIdentifier();
      const inboxId =
        (await withTimeout(
          getInboxIdForIdentifier(signerIdentifier, env),
          15000,
          "Resolving XMTP inbox timed out."
        ).catch(() => undefined)) ?? extractInboxIdFromError(error);

      if (!inboxId) {
        throw new Error(
          "XMTP installation limit reached, but inbox ID could not be resolved for auto-recovery."
        );
      }

      const [inboxState] = await withTimeout(
        Client.fetchInboxStates([inboxId], env),
        25000,
        "Fetching XMTP inbox state timed out."
      );

      const installations = inboxState?.installations ?? [];
      if (!installations.length) {
        throw new Error("XMTP installation limit reached, but no installations were found to revoke.");
      }

      const sortedInstallations = [...installations].sort((a, b) => {
        const aTs = a.clientTimestampNs ?? 0n;
        const bTs = b.clientTimestampNs ?? 0n;
        if (aTs < bTs) return -1;
        if (aTs > bTs) return 1;
        return 0;
      });

      const revokeCount = Math.max(1, installations.length - (XMTP_MAX_INSTALLATIONS - 1));
      const installationIds = sortedInstallations
        .slice(0, revokeCount)
        .map(installation => installation.bytes);

      await withTimeout(
        Client.revokeInstallations(signer, inboxId, installationIds, env),
        90000,
        "Revoking old XMTP installations timed out."
      );
    },
    []
  );

  const initXMTPClient = useCallback(async () => {
    if (client) {
      return client;
    }

    const resolvedEnv = resolveEnv();
    const envCandidates = unique<XMTPEnv>([
      resolvedEnv,
      "dev",
      "production",
      "local",
    ]);
    const attempts: RestoreAttemptDebug[] = [];

    if (identifierCandidates.length === 0) {
      persistRestoreDebug({
        result: "not_restored",
        envCandidates,
        identifierCandidates,
        attempts,
        reason: "missing_identity",
      });
      return undefined;
    }

    dispatch(setInitializing(true));
    dispatch(setError(null));
    setConnectStage("restore_session");

    try {
      const preferredSessions = envCandidates
        .map(env => findPersistedSession(env))
        .filter((value): value is PersistedSession => Boolean(value));
      const sessions = collectRestoreSessions(envCandidates);
      if (sessions.length === 0) {
        persistRestoreDebug({
          result: "not_restored",
          envCandidates,
          identifierCandidates,
          attempts,
          reason: "no_persisted_session",
        });
        return undefined;
      }

      sessions.sort((a, b) => {
        const aPreferred = preferredSessions.includes(a) ? 0 : 1;
        const bPreferred = preferredSessions.includes(b) ? 0 : 1;
        if (aPreferred !== bPreferred) {
          return aPreferred - bPreferred;
        }
        const aPrimary = a.identifier === primaryIdentifier ? 0 : 1;
        const bPrimary = b.identifier === primaryIdentifier ? 0 : 1;
        if (aPrimary !== bPrimary) {
          return aPrimary - bPrimary;
        }
        const aEnvIndex = envCandidates.indexOf(a.env);
        const bEnvIndex = envCandidates.indexOf(b.env);
        if (aEnvIndex !== bEnvIndex) {
          return aEnvIndex - bEnvIndex;
        }
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      });

      for (const session of sessions) {
        const env = session.env;
        const buildOptions = session.dbEncryptionKey
          ? [
              {
                usedDbEncryptionKey: true,
                options: {
                  env,
                  dbEncryptionKey: fromBase64(session.dbEncryptionKey),
                },
              },
              {
                usedDbEncryptionKey: false,
                options: {
                  env,
                },
              },
            ]
          : [
              {
                usedDbEncryptionKey: false,
                options: {
                  env,
                },
              },
            ];

        for (const buildOption of buildOptions) {
          logDebug("restore:start", {
            env,
            identifier: session.identifier,
            usedDbEncryptionKey: buildOption.usedDbEncryptionKey,
          });

          try {
            const builtClient = await withTimeout(
              Client.build(
                {
                  identifier: session.identifier,
                  identifierKind: IdentifierKind.Ethereum,
                },
                buildOption.options
              ),
              12000,
              "Restoring XMTP session timed out."
            );

            const { ready, attempt } = await verifyClientReady(builtClient, env, session.identifier, {
              inboxId: session.inboxId,
              installationId: session.installationId,
            });
            attempts.push({
              ...attempt,
              usedDbEncryptionKey: buildOption.usedDbEncryptionKey,
            });

            if (!ready) {
              builtClient.close();
              continue;
            }

            const refreshedSession: PersistedSession = {
              ...session,
              dbEncryptionKey: buildOption.usedDbEncryptionKey ? session.dbEncryptionKey : undefined,
              inboxId: (builtClient as { inboxId?: string }).inboxId,
              installationId: (builtClient as { installationId?: string }).installationId,
              updatedAt: new Date().toISOString(),
            };

            persistSession(refreshedSession);
            setClient(builtClient);
            setConnectStage("connected");

            persistRestoreDebug({
              result: "restored",
              envCandidates,
              identifierCandidates,
              attempts,
              restoredEnv: env,
              restoredIdentifier: session.identifier,
            });

            return builtClient;
          } catch (error) {
            attempts.push({
              env,
              identifier: session.identifier,
              usedDbEncryptionKey: buildOption.usedDbEncryptionKey,
              build: "failed",
              inboxId: null,
              installationId: null,
              matchesPersistedInstallation: null,
              registrationCheckFailed: false,
              installationInInbox: null,
              conversationAccess: null,
              isRegistered: null,
              canMessageReady: null,
              error: stringifyError(error),
            });

            if (buildOption.usedDbEncryptionKey && isInstallationLimitError(error)) {
              // Continue to no-key fallback attempt for the same env/identifier.
              continue;
            }
          }
        }
      }

      persistRestoreDebug({
        result: "not_restored",
        envCandidates,
        identifierCandidates,
        attempts,
        reason: "session_not_ready",
      });
      return undefined;
    } catch (error) {
      dispatch(setError(error as Error));
      persistRestoreDebug({
        result: "error",
        envCandidates,
        identifierCandidates,
        attempts,
        reason: "restore_exception",
        error: stringifyError(error),
      });
      return undefined;
    } finally {
      dispatch(setInitializing(false));
    }
  }, [
    client,
    dispatch,
    findPersistedSession,
    collectRestoreSessions,
    identifierCandidates,
    logDebug,
    persistRestoreDebug,
    persistSession,
    primaryIdentifier,
    resolveEnv,
    setClient,
    verifyClientReady,
  ]);

  const createAndRegister = useCallback(
    async (
      env: XMTPEnv,
      identifier: string,
      signer: EOASigner | SCWSigner,
      signerType: "EOA" | "SCW"
    ) => {
      const dbEncryptionKeyBytes = new Uint8Array(32);
      globalThis.crypto.getRandomValues(dbEncryptionKeyBytes);

      setConnectStage("create_client");
      const createdClient = await withTimeout(
        Client.create(signer, {
          env,
          disableAutoRegister: true,
          dbEncryptionKey: dbEncryptionKeyBytes,
        }),
        120000,
        "Creating XMTP client timed out."
      );

      setConnectStage("check_registration");
      let isRegistered = await withTimeout(
        createdClient.isRegistered(),
        12000,
        "Checking XMTP registration timed out."
      );

      if (!isRegistered) {
        setConnectStage("register_account");
        await withTimeout(createdClient.register(), 90000, "XMTP registration timed out.");
        isRegistered = await withTimeout(
          createdClient.isRegistered(),
          12000,
          "Checking XMTP registration timed out."
        );
      }

      if (!isRegistered) {
        createdClient.close();
        throw new Error("XMTP registration did not complete.");
      }

      const { ready } = await verifyClientReady(createdClient, env, identifier);
      if (!ready) {
        createdClient.close();
        throw new Error("XMTP client did not pass readiness checks.");
      }

      const persistedSession: PersistedSession = {
        env,
        identifier,
        dbEncryptionKey: toBase64(dbEncryptionKeyBytes),
        inboxId: (createdClient as { inboxId?: string }).inboxId,
        installationId: (createdClient as { installationId?: string }).installationId,
        signerType,
        updatedAt: new Date().toISOString(),
      };

      persistSession(persistedSession);
      setClient(createdClient);
      setConnectStage("connected");

      return createdClient;
    },
    [persistSession, setClient, verifyClientReady]
  );

  const createXMTPClient = useCallback(
    async (options?: XMTPConnectOptions) => {
      const updateStage = (stage: XMTPConnectStage) => {
        setConnectStage(stage);
        options?.onStage?.(stage);
      };

      if (client) {
        updateStage("connected");
        return client;
      }

      if (!walletAddress || !primaryIdentifier) {
        throw new Error("Missing connected wallet identity.");
      }

      setConnectingXMTP(true);
      dispatch(setInitializing(true));
      dispatch(setError(null));

      try {
        updateStage("restore_session");
        const restored = await initXMTPClient();
        if (restored) {
          updateStage("connected");
          return restored;
        }

        updateStage("build_failed_fallback_create");
        updateStage("prompt_signature");
        await withTimeout(
          requestWalletSignature(`Enable XMTP for w3rk (${primaryIdentifier})`, "preflight"),
          45000,
          "Wallet signature timed out."
        );

        const env = resolveEnv();

        const attempts: Array<{
          identifier: string;
          mode: "primary" | "eoa_fallback";
          signerType: "EOA" | "SCW";
        }> = [
          {
            identifier: primaryIdentifier,
            mode: "primary",
            signerType: isScwIdentity && primaryIdentifier === xmtpAddress ? "SCW" : "EOA",
          },
        ];

        if (isScwIdentity && walletAddress && walletAddress !== primaryIdentifier) {
          attempts.push({
            identifier: walletAddress,
            mode: "eoa_fallback",
            signerType: "EOA",
          });
        }

        let lastError: unknown;

        for (const attempt of attempts) {
          const signer = buildSigner(attempt.identifier, env, attempt.mode);

          try {
            logDebug("create:attempt", {
              env,
              identifier: attempt.identifier,
              mode: attempt.mode,
              signerType: attempt.signerType,
            });

            const created = await createAndRegister(
              env,
              attempt.identifier,
              signer,
              attempt.signerType
            );
            updateStage("connected");
            return created;
          } catch (error) {
            lastError = error;
            logError("create:attempt_failed", error, {
              env,
              identifier: attempt.identifier,
              mode: attempt.mode,
            });

            if (isInstallationLimitError(error)) {
              try {
                await recoverInstallationLimit(signer, env, error);
                const recovered = await createAndRegister(
                  env,
                  attempt.identifier,
                  signer,
                  attempt.signerType
                );
                updateStage("connected");
                return recovered;
              } catch (recoveryError) {
                lastError = recoveryError;
                logError("create:installation_limit_recovery_failed", recoveryError, {
                  env,
                  identifier: attempt.identifier,
                  mode: attempt.mode,
                });
              }
            }
          }
        }

        if (isInstallationLimitError(lastError)) {
          throw new Error(
            "XMTP installation limit reached and automatic cleanup failed. Please revoke old XMTP installations and try again."
          );
        }

        throw lastError instanceof Error ? lastError : new Error("Unable to create XMTP client.");
      } catch (error) {
        updateStage("failed");
        dispatch(setError(error as Error));
        setClient(undefined);
        throw error;
      } finally {
        dispatch(setInitializing(false));
        setConnectingXMTP(false);
      }
    },
    [
      buildSigner,
      client,
      createAndRegister,
      dispatch,
      initXMTPClient,
      isScwIdentity,
      logDebug,
      logError,
      primaryIdentifier,
      recoverInstallationLimit,
      requestWalletSignature,
      resolveEnv,
      setClient,
      walletAddress,
      xmtpAddress,
    ]
  );

  const wasXMTPEnabled = useCallback(() => {
    const env = resolveEnv();
    return Boolean(findPersistedSession(env));
  }, [findPersistedSession, resolveEnv]);

  return {
    client,
    initializing: xmtpState.initializing,
    error: xmtpState.error,
    activeUser: xmtpState.activeUser,
    connectingXMTP,
    connectStage,
    createXMTPClient,
    initXMTPClient,
    wasXMTPEnabled,
  };
}
