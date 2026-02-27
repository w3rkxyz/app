"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo, useState } from "react";
import {
  Client,
  IdentifierKind,
  getInboxIdForIdentifier,
  type SCWSigner,
  type EOASigner,
  type Identifier,
} from "@xmtp/browser-sdk";
import { hexToBytes, keccak256, stringToHex, type Address } from "viem";
import { useSignMessage, useWalletClient } from "wagmi";
import { setError, setInitializing } from "@/redux/xmtp";
import { RootState } from "@/redux/store";
import { useXMTP } from "@/app/XMTPContext";
import { getEnv } from "@/utils/xmtpHelpers";

type UseXMTPClientParams = {
  walletAddress?: string;
  lensAccountAddress?: string;
  lensProfileId?: string;
  lensHandle?: string;
};

const LENS_TESTNET_CHAIN_ID = 37111n;
const LENS_MAINNET_CHAIN_ID = 232n;
const XMTP_MAX_INSTALLATIONS = 10;

const XMTP_SESSION_STORE_KEY = "w3rk:xmtp:session-store:v2";
const XMTP_ENABLED_IDENTIFIERS_KEY = "w3rk:xmtp:enabled-identifiers";
const XMTP_LAST_ENV_KEY = "w3rk:xmtp:last-env";
const XMTP_DB_KEY_STORAGE_PREFIX = "w3rk:xmtp:db-key";
const XMTP_RESTORE_DEBUG_KEY = "w3rk:xmtp:restore-debug:last";
const XMTP_LAST_SUCCESSFUL_CONNECTION_KEY = "w3rk:xmtp:last-successful-connection";
const XMTP_LAST_SUCCESSFUL_CONNECTION_MAP_KEY = "w3rk:xmtp:last-successful-connection-map";

type XMTPEnv = "local" | "dev" | "production";

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

type PersistedSession = {
  env: XMTPEnv;
  identifier: string;
  dbEncryptionKey: string;
  inboxId?: string;
  installationId?: string;
  signerType?: "SCW" | "EOA";
  updatedAt: string;
};

type SessionStore = Record<string, PersistedSession>;

type XMTPRestoreAttemptDebug = {
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

type XMTPRestoreDebugSnapshot = {
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
  attempts: XMTPRestoreAttemptDebug[];
  restoredEnv?: XMTPEnv;
  restoredIdentifier?: string;
  reason?: string;
  error?: string;
};

type RestoreCandidate = {
  env: XMTPEnv;
  identifier: string;
  dbEncryptionKey: string;
  inboxId?: string;
  installationId?: string;
  source: "session_store" | "legacy_last_successful" | "legacy_db_key";
  updatedAt: string;
};

const isValidEnv = (value: string | null | undefined): value is XMTPEnv =>
  value === "local" || value === "dev" || value === "production";

const normalizeAddress = (value?: string | null) => value?.toLowerCase() ?? "";

const isAddressCandidate = (value: string) => value.startsWith("0x") && value.length === 42;

const toBase64 = (bytes: Uint8Array): string => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return window.btoa(binary);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
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

  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }

  return new Uint8Array();
};

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs = 20000,
  timeoutMessage = "XMTP operation timed out."
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

const parseInstallationLimitError = (error: unknown) => {
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

export function useXMTPClient(params?: UseXMTPClientParams) {
  const dispatch = useDispatch();
  const { client, setClient } = useXMTP();
  const xmtpState = useSelector((state: RootState) => state.xmtp);

  const [connectingXMTP, setConnectingXMTP] = useState(false);
  const [connectStage, setConnectStage] = useState<XMTPConnectStage>("idle");

  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();

  const walletAddress = normalizeAddress(params?.walletAddress);
  const lensAccountAddress = normalizeAddress(params?.lensAccountAddress);
  const lensProfileId = params?.lensProfileId;
  const lensHandle = params?.lensHandle;

  const xmtpAddress = (lensAccountAddress || walletAddress || "").toLowerCase();
  const walletClientAccountAddress = normalizeAddress(walletClient?.account?.address);

  const isScwIdentity =
    Boolean(lensAccountAddress) && Boolean(walletAddress) && lensAccountAddress !== walletAddress;

  const scopeKeys = useMemo(() => {
    const values = [
      lensProfileId ? `lens:id:${lensProfileId}` : null,
      lensHandle ? `lens:handle:${lensHandle.toLowerCase().replace(/^@/, "")}` : null,
      lensAccountAddress ? `lens:address:${lensAccountAddress}` : null,
      walletAddress ? `wallet:${walletAddress}` : null,
      walletClientAccountAddress ? `walletClient:${walletClientAccountAddress}` : null,
      xmtpAddress ? `xmtp:${xmtpAddress}` : null,
    ].filter((value): value is string => Boolean(value));

    return Array.from(new Set(values));
  }, [lensAccountAddress, lensHandle, lensProfileId, walletAddress, walletClientAccountAddress, xmtpAddress]);

  const identifierCandidates = useMemo(() => {
    const values = [xmtpAddress, walletAddress, walletClientAccountAddress]
      .filter((value): value is string => Boolean(value))
      .filter(isAddressCandidate);

    return Array.from(new Set(values));
  }, [xmtpAddress, walletAddress, walletClientAccountAddress]);

  const primaryIdentifier = identifierCandidates[0] ?? "";

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

  const getLegacyDbKeyStorageKey = useCallback(
    (env: XMTPEnv, identifier: string) => `${XMTP_DB_KEY_STORAGE_PREFIX}:${env}:${identifier.toLowerCase()}`,
    []
  );

  const readSessionStore = useCallback((): SessionStore => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const raw = window.localStorage.getItem(XMTP_SESSION_STORE_KEY);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const normalized: SessionStore = {};

      for (const [key, value] of Object.entries(parsed)) {
        if (!value || typeof value !== "object") {
          continue;
        }

        const candidate = value as Partial<PersistedSession>;
        if (
          !isValidEnv(candidate.env) ||
          typeof candidate.identifier !== "string" ||
          !isAddressCandidate(candidate.identifier.toLowerCase()) ||
          typeof candidate.dbEncryptionKey !== "string" ||
          candidate.dbEncryptionKey.length === 0
        ) {
          continue;
        }

        normalized[key] = {
          env: candidate.env,
          identifier: candidate.identifier.toLowerCase(),
          dbEncryptionKey: candidate.dbEncryptionKey,
          inboxId:
            typeof candidate.inboxId === "string" && candidate.inboxId.length > 0
              ? candidate.inboxId
              : undefined,
          installationId:
            typeof candidate.installationId === "string" && candidate.installationId.length > 0
              ? candidate.installationId
              : undefined,
          signerType: candidate.signerType === "SCW" || candidate.signerType === "EOA" ? candidate.signerType : undefined,
          updatedAt:
            typeof candidate.updatedAt === "string" && candidate.updatedAt.length > 0
              ? candidate.updatedAt
              : new Date().toISOString(),
        };
      }

      return normalized;
    } catch {
      return {};
    }
  }, []);

  const writeSessionStore = useCallback((next: SessionStore) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(XMTP_SESSION_STORE_KEY, JSON.stringify(next));
  }, []);

  const getPersistedEnvFromStore = useCallback((): XMTPEnv | null => {
    const store = readSessionStore();
    const candidates = scopeKeys
      .map(scope => store[scope]?.env)
      .filter((value): value is XMTPEnv => Boolean(value));

    return candidates[0] ?? null;
  }, [readSessionStore, scopeKeys]);

  const resolveEnvCandidates = useCallback((): XMTPEnv[] => {
    const configuredRaw = process.env.NEXT_PUBLIC_XMTP_ENV ?? process.env.NEXT_PUBLIC_XMTP_ENVIRONMENT;
    const configuredEnv = isValidEnv(configuredRaw) ? configuredRaw : null;
    if (configuredEnv) {
      return [configuredEnv];
    }

    const persistedEnv = getPersistedEnvFromStore();
    const legacyPersistedRaw =
      typeof window !== "undefined" ? window.localStorage.getItem(XMTP_LAST_ENV_KEY) : null;
    const legacyPersistedEnv = isValidEnv(legacyPersistedRaw) ? legacyPersistedRaw : null;

    const walletChainId =
      typeof walletClient?.chain?.id === "number" ? BigInt(walletClient.chain.id) : null;
    const configuredLensChainId =
      process.env.NEXT_PUBLIC_LENS_CHAIN_ID && Number.isFinite(Number(process.env.NEXT_PUBLIC_LENS_CHAIN_ID))
        ? BigInt(process.env.NEXT_PUBLIC_LENS_CHAIN_ID)
        : null;

    const fallbackEnv = getEnv();
    const inferredEnv: XMTPEnv =
      (walletChainId ?? configuredLensChainId ?? (fallbackEnv === "production" ? LENS_MAINNET_CHAIN_ID : LENS_TESTNET_CHAIN_ID)) ===
      LENS_MAINNET_CHAIN_ID
        ? "production"
        : "dev";

    const ordered = [persistedEnv, legacyPersistedEnv, inferredEnv, fallbackEnv].filter(
      (value): value is XMTPEnv => Boolean(value)
    );

    return Array.from(new Set(ordered));
  }, [getPersistedEnvFromStore, walletClient?.chain?.id]);

  const loadLegacyDbEncryptionKey = useCallback(
    (env: XMTPEnv, identifier: string): string | null => {
      if (typeof window === "undefined") {
        return null;
      }

      const raw = window.localStorage.getItem(getLegacyDbKeyStorageKey(env, identifier));
      if (!raw) {
        return null;
      }

      return raw;
    },
    [getLegacyDbKeyStorageKey]
  );

  const storeLegacyDbEncryptionKey = useCallback(
    (env: XMTPEnv, identifier: string, dbEncryptionKey: string) => {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(getLegacyDbKeyStorageKey(env, identifier), dbEncryptionKey);
    },
    [getLegacyDbKeyStorageKey]
  );

  const readLegacyLastSuccessfulCandidates = useCallback((): RestoreCandidate[] => {
    if (typeof window === "undefined") {
      return [];
    }

    const parseLegacyRecord = (value: unknown): RestoreCandidate | null => {
      if (!value || typeof value !== "object") {
        return null;
      }
      const parsed = value as {
        env?: unknown;
        identifier?: unknown;
        inboxId?: unknown;
        installationId?: unknown;
        dbEncryptionKey?: unknown;
        savedAt?: unknown;
      };

      if (typeof parsed.env !== "string" || !isValidEnv(parsed.env)) {
        return null;
      }
      if (typeof parsed.identifier !== "string") {
        return null;
      }

      const identifier = parsed.identifier.toLowerCase();
      if (!isAddressCandidate(identifier)) {
        return null;
      }

      if (typeof parsed.dbEncryptionKey !== "string" || parsed.dbEncryptionKey.length === 0) {
        return null;
      }

      return {
        env: parsed.env,
        identifier,
        dbEncryptionKey: parsed.dbEncryptionKey,
        inboxId: typeof parsed.inboxId === "string" ? parsed.inboxId : undefined,
        installationId: typeof parsed.installationId === "string" ? parsed.installationId : undefined,
        source: "legacy_last_successful",
        updatedAt:
          typeof parsed.savedAt === "string" && parsed.savedAt.length > 0
            ? parsed.savedAt
            : new Date().toISOString(),
      };
    };

    const results: RestoreCandidate[] = [];

    try {
      const rawMap = window.localStorage.getItem(XMTP_LAST_SUCCESSFUL_CONNECTION_MAP_KEY);
      if (rawMap) {
        const parsed = JSON.parse(rawMap) as Record<string, unknown>;
        for (const key of scopeKeys) {
          const candidate = parseLegacyRecord(parsed[key]);
          if (candidate) {
            results.push(candidate);
          }
        }
      }
    } catch {
      // ignore malformed legacy map
    }

    try {
      const raw = window.localStorage.getItem(XMTP_LAST_SUCCESSFUL_CONNECTION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        const candidate = parseLegacyRecord(parsed);
        if (candidate) {
          results.push(candidate);
        }
      }
    } catch {
      // ignore malformed legacy key
    }

    return results;
  }, [scopeKeys]);

  const persistEnabledIdentifiers = useCallback(
    (identifier: string) => {
      if (typeof window === "undefined") {
        return;
      }

      const existing = (() => {
        try {
          const raw = window.localStorage.getItem(XMTP_ENABLED_IDENTIFIERS_KEY);
          if (!raw) {
            return [] as string[];
          }
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) {
            return [] as string[];
          }
          return parsed
            .filter((value): value is string => typeof value === "string")
            .map(value => value.toLowerCase())
            .filter(isAddressCandidate);
        } catch {
          return [] as string[];
        }
      })();

      const merged = Array.from(
        new Set([...existing, ...identifierCandidates, identifier.toLowerCase()].filter(isAddressCandidate))
      );
      window.localStorage.setItem(XMTP_ENABLED_IDENTIFIERS_KEY, JSON.stringify(merged));
    },
    [identifierCandidates]
  );

  const persistSession = useCallback(
    (session: PersistedSession) => {
      if (typeof window === "undefined") {
        return;
      }

      const store = readSessionStore();
      const nextStore = { ...store };

      for (const scope of [...scopeKeys, `identifier:${session.identifier}`]) {
        nextStore[scope] = session;
      }

      writeSessionStore(nextStore);
      window.localStorage.setItem(XMTP_LAST_ENV_KEY, session.env);

      storeLegacyDbEncryptionKey(session.env, session.identifier, session.dbEncryptionKey);
      persistEnabledIdentifiers(session.identifier);

      const legacyPayload = {
        env: session.env,
        identifier: session.identifier,
        inboxId: session.inboxId,
        installationId: session.installationId,
        dbEncryptionKey: session.dbEncryptionKey,
        savedAt: session.updatedAt,
      };

      window.localStorage.setItem(XMTP_LAST_SUCCESSFUL_CONNECTION_KEY, JSON.stringify(legacyPayload));

      try {
        const rawMap = window.localStorage.getItem(XMTP_LAST_SUCCESSFUL_CONNECTION_MAP_KEY);
        const parsed = rawMap ? (JSON.parse(rawMap) as Record<string, unknown>) : {};
        const nextMap: Record<string, unknown> = { ...parsed };
        for (const scope of [...scopeKeys, `identifier:${session.identifier}`]) {
          nextMap[scope] = legacyPayload;
        }
        window.localStorage.setItem(XMTP_LAST_SUCCESSFUL_CONNECTION_MAP_KEY, JSON.stringify(nextMap));
      } catch {
        // ignore malformed legacy map
      }
    },
    [persistEnabledIdentifiers, readSessionStore, scopeKeys, storeLegacyDbEncryptionKey, writeSessionStore]
  );

  const persistRestoreDebug = useCallback(
    (
      payload: Omit<XMTPRestoreDebugSnapshot, "timestamp" | "identity"> & {
        timestamp?: string;
        identity?: XMTPRestoreDebugSnapshot["identity"];
      }
    ) => {
      if (typeof window === "undefined") {
        return;
      }

      const snapshot: XMTPRestoreDebugSnapshot = {
        timestamp: payload.timestamp ?? new Date().toISOString(),
        identity: payload.identity ?? {
          walletAddress: walletAddress || null,
          lensAccountAddress: lensAccountAddress || null,
          lensProfileId: lensProfileId ?? null,
          lensHandle: lensHandle ?? null,
          xmtpAddress: xmtpAddress || null,
          isScwIdentity,
        },
        result: payload.result,
        envCandidates: payload.envCandidates,
        identifierCandidates: payload.identifierCandidates,
        attempts: payload.attempts,
        restoredEnv: payload.restoredEnv,
        restoredIdentifier: payload.restoredIdentifier,
        reason: payload.reason,
        error: payload.error,
      };

      window.localStorage.setItem(XMTP_RESTORE_DEBUG_KEY, JSON.stringify(snapshot));
    },
    [walletAddress, lensAccountAddress, lensProfileId, lensHandle, xmtpAddress, isScwIdentity]
  );

  const checkConversationAccess = useCallback(
    async (xmtpClient: Client<unknown>) => {
      try {
        await withTimeout(
          xmtpClient.conversations.list({ limit: 1n }),
          10000,
          "Checking XMTP conversation access timed out."
        );
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const verifyBuiltClient = useCallback(
    async (
      builtClient: Client<unknown>,
      identifier: string,
      env: XMTPEnv,
      expected?: { inboxId?: string; installationId?: string }
    ) => {
      const attempt: XMTPRestoreAttemptDebug = {
        env,
        identifier,
        usedDbEncryptionKey: true,
        build: "ok",
        inboxId: (builtClient as { inboxId?: string }).inboxId ?? null,
        installationId: (builtClient as { installationId?: string }).installationId ?? null,
        matchesPersistedInstallation: null,
        registrationCheckFailed: false,
        installationInInbox: null,
        conversationAccess: null,
        isRegistered: null,
        canMessageReady: null,
      };

      const installationMatches =
        (!expected?.installationId || expected.installationId === attempt.installationId) &&
        (!expected?.inboxId || expected.inboxId === attempt.inboxId);

      attempt.matchesPersistedInstallation =
        expected?.installationId || expected?.inboxId ? installationMatches : null;
      attempt.installationInInbox = installationMatches;

      if (!installationMatches) {
        attempt.error = "installation_mismatch";
        return {
          ready: false,
          attempt,
        };
      }

      try {
        attempt.isRegistered = await withTimeout(
          builtClient.isRegistered(),
          10000,
          "Checking XMTP registration timed out."
        );
      } catch (error) {
        attempt.registrationCheckFailed = true;
        attempt.error = `isRegistered:${stringifyError(error)}`;
      }

      try {
        const canMessageMap = await withTimeout(
          builtClient.canMessage([
            {
              identifier,
              identifierKind: IdentifierKind.Ethereum,
            },
          ]),
          7000,
          "Checking XMTP canMessage timed out."
        );
        attempt.canMessageReady = Boolean(canMessageMap.get(identifier));
      } catch (error) {
        const suffix = `canMessage:${stringifyError(error)}`;
        attempt.error = attempt.error ? `${attempt.error} | ${suffix}` : suffix;
      }

      attempt.conversationAccess = await checkConversationAccess(builtClient);

      // Strict readiness gate:
      // - Registration must be confirmed true.
      // - And either canMessage self-check or conversations access must pass.
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
    [checkConversationAccess]
  );

  const collectRestoreCandidates = useCallback(
    (envCandidates: XMTPEnv[]): RestoreCandidate[] => {
      const nowIso = new Date().toISOString();
      const dedupe = new Map<string, RestoreCandidate>();
      const pushCandidate = (candidate: RestoreCandidate) => {
        if (!isAddressCandidate(candidate.identifier)) {
          return;
        }
        if (!isValidEnv(candidate.env)) {
          return;
        }
        if (!candidate.dbEncryptionKey) {
          return;
        }

        const key = `${candidate.env}|${candidate.identifier}|${candidate.dbEncryptionKey}`;
        const existing = dedupe.get(key);
        if (!existing) {
          dedupe.set(key, candidate);
          return;
        }

        const sourceWeight: Record<RestoreCandidate["source"], number> = {
          session_store: 0,
          legacy_last_successful: 1,
          legacy_db_key: 2,
        };

        if (sourceWeight[candidate.source] < sourceWeight[existing.source]) {
          dedupe.set(key, candidate);
        }
      };

      const store = readSessionStore();
      for (const scope of [...scopeKeys, ...identifierCandidates.map(value => `identifier:${value}`)]) {
        const session = store[scope];
        if (!session) {
          continue;
        }

        pushCandidate({
          env: session.env,
          identifier: session.identifier,
          dbEncryptionKey: session.dbEncryptionKey,
          inboxId: session.inboxId,
          installationId: session.installationId,
          source: "session_store",
          updatedAt: session.updatedAt,
        });
      }

      for (const legacyCandidate of readLegacyLastSuccessfulCandidates()) {
        pushCandidate(legacyCandidate);
      }

      for (const env of envCandidates) {
        for (const identifier of identifierCandidates) {
          const dbEncryptionKey = loadLegacyDbEncryptionKey(env, identifier);
          if (!dbEncryptionKey) {
            continue;
          }

          pushCandidate({
            env,
            identifier,
            dbEncryptionKey,
            source: "legacy_db_key",
            updatedAt: nowIso,
          });
        }
      }

      const sourceWeight: Record<RestoreCandidate["source"], number> = {
        session_store: 0,
        legacy_last_successful: 1,
        legacy_db_key: 2,
      };

      return Array.from(dedupe.values()).sort((a, b) => {
        const aPrimary = a.identifier === primaryIdentifier ? 0 : 1;
        const bPrimary = b.identifier === primaryIdentifier ? 0 : 1;
        if (aPrimary !== bPrimary) {
          return aPrimary - bPrimary;
        }

        if (a.env !== b.env) {
          const aEnvIndex = envCandidates.indexOf(a.env);
          const bEnvIndex = envCandidates.indexOf(b.env);
          const normalizedAEnvIndex = aEnvIndex === -1 ? Number.MAX_SAFE_INTEGER : aEnvIndex;
          const normalizedBEnvIndex = bEnvIndex === -1 ? Number.MAX_SAFE_INTEGER : bEnvIndex;
          if (normalizedAEnvIndex !== normalizedBEnvIndex) {
            return normalizedAEnvIndex - normalizedBEnvIndex;
          }
        }

        const sourceDelta = sourceWeight[a.source] - sourceWeight[b.source];
        if (sourceDelta !== 0) {
          return sourceDelta;
        }

        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      });
    },
    [
      identifierCandidates,
      loadLegacyDbEncryptionKey,
      primaryIdentifier,
      readLegacyLastSuccessfulCandidates,
      readSessionStore,
      scopeKeys,
    ]
  );

  const buildAndRestore = useCallback(async () => {
    const attempts: XMTPRestoreAttemptDebug[] = [];
    const envCandidates = resolveEnvCandidates();

    if (identifierCandidates.length === 0) {
      persistRestoreDebug({
        result: "not_restored",
        envCandidates,
        identifierCandidates,
        attempts,
        reason: "missing_identifier_candidates",
      });
      return undefined;
    }

    const candidates = collectRestoreCandidates(envCandidates);

    if (candidates.length === 0) {
      persistRestoreDebug({
        result: "not_restored",
        envCandidates,
        identifierCandidates,
        attempts,
        reason: "missing_persisted_session",
      });
      return undefined;
    }

    const maxAttempts = 6;
    let attempted = 0;

    for (const candidate of candidates) {
      if (attempted >= maxAttempts) {
        break;
      }
      attempted += 1;

      const restoreAttempt: XMTPRestoreAttemptDebug = {
        env: candidate.env,
        identifier: candidate.identifier,
        usedDbEncryptionKey: true,
        build: "failed",
        inboxId: null,
        installationId: null,
        matchesPersistedInstallation: null,
        registrationCheckFailed: false,
        installationInInbox: null,
        conversationAccess: null,
        isRegistered: null,
        canMessageReady: null,
      };

      try {
        const builtClient = await withTimeout(
          Client.build(
            {
              identifier: candidate.identifier,
              identifierKind: IdentifierKind.Ethereum,
            },
            {
              env: candidate.env,
              dbEncryptionKey: fromBase64(candidate.dbEncryptionKey),
            }
          ),
          12000,
          "Restoring XMTP session timed out."
        );

        restoreAttempt.build = "ok";
        restoreAttempt.inboxId = (builtClient as { inboxId?: string }).inboxId ?? null;
        restoreAttempt.installationId =
          (builtClient as { installationId?: string }).installationId ?? null;

        const { ready, attempt } = await verifyBuiltClient(
          builtClient,
          candidate.identifier,
          candidate.env,
          {
            inboxId: candidate.inboxId,
            installationId: candidate.installationId,
          }
        );

        attempts.push({
          ...restoreAttempt,
          ...attempt,
        });

        if (!ready) {
          builtClient.close();
          continue;
        }

        const updatedSession: PersistedSession = {
          env: candidate.env,
          identifier: candidate.identifier,
          dbEncryptionKey: candidate.dbEncryptionKey,
          inboxId: (builtClient as { inboxId?: string }).inboxId,
          installationId: (builtClient as { installationId?: string }).installationId,
          updatedAt: new Date().toISOString(),
        };

        persistSession(updatedSession);
        setClient(builtClient);

        persistRestoreDebug({
          result: "restored",
          envCandidates,
          identifierCandidates,
          attempts,
          restoredEnv: candidate.env,
          restoredIdentifier: candidate.identifier,
        });

        return builtClient;
      } catch (error) {
        restoreAttempt.error = stringifyError(error);
        attempts.push(restoreAttempt);

        logError("restore:candidate_failed", error, {
          env: candidate.env,
          identifier: candidate.identifier,
          source: candidate.source,
        });
      }
    }

    persistRestoreDebug({
      result: "not_restored",
      envCandidates,
      identifierCandidates,
      attempts,
      reason: "no_usable_restore_candidate",
    });

    return undefined;
  }, [
    collectRestoreCandidates,
    identifierCandidates,
    logError,
    persistRestoreDebug,
    persistSession,
    resolveEnvCandidates,
    setClient,
    verifyBuiltClient,
  ]);

  const signWithEthereumProvider = useCallback(async (message: string, accountAddress?: Address | null) => {
    if (typeof window === "undefined") {
      return null;
    }

    const ethereum = (window as Window & { ethereum?: { request?: (args: unknown) => Promise<unknown> } }).ethereum;

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
  }, []);

  const requestWalletSignature = useCallback(
    async (
      message: string,
      source: "preflight" | "xmtp_signer" | "xmtp_signer_eoa_fallback",
      overrideSigningAddress?: Address | null
    ) => {
      const activeSigningAddress =
        overrideSigningAddress ??
        (walletClient?.account?.address as Address | undefined) ??
        (walletAddress as Address | undefined) ??
        null;

      const messageHash = keccak256(stringToHex(message));
      logDebug("signature:request:start", {
        source,
        messageHash,
        activeSigningAddress,
      });

      const walletClientSignature = await withTimeout(
        (async () => {
          if (!walletClient) {
            return null;
          }

          try {
            return await walletClient.signMessage({
              account: activeSigningAddress ?? walletClient.account,
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
          : await withTimeout(signMessageAsync({ message }).catch(() => null), 35000, "Wallet signature timed out.");

      const providerSignature =
        typeof wagmiSignature === "string"
          ? wagmiSignature
          : await withTimeout(signWithEthereumProvider(message, activeSigningAddress), 35000, "Wallet signature timed out.");

      if (!providerSignature) {
        throw new Error("Wallet signature request failed or was cancelled.");
      }

      logDebug("signature:request:success", {
        source,
        messageHash,
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
      const inferredChainId = env === "production" ? LENS_MAINNET_CHAIN_ID : LENS_TESTNET_CHAIN_ID;
      const chainId = walletChainId ?? configuredLensChainId ?? inferredChainId;

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

  const revokeOldInstallations = useCallback(
    async (signer: EOASigner | SCWSigner, env: XMTPEnv, sourceError: unknown) => {
      const signerIdentifier = await signer.getIdentifier();
      const inboxId =
        (await withTimeout(
          getInboxIdForIdentifier(signerIdentifier, env),
          15000,
          "Resolving XMTP inbox timed out."
        ).catch(() => undefined)) ?? extractInboxIdFromError(sourceError);

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
      const installationIdsToRevoke = sortedInstallations
        .slice(0, revokeCount)
        .map(installation => installation.bytes);

      await withTimeout(
        Client.revokeInstallations(signer, inboxId, installationIdsToRevoke, env),
        90000,
        "Revoking old XMTP installations timed out."
      );
    },
    []
  );

  const createAndRegisterClient = useCallback(
    async (
      env: XMTPEnv,
      identifier: string,
      signer: EOASigner | SCWSigner,
      signerType: "SCW" | "EOA"
    ) => {
      const dbKeyBytes = new Uint8Array(32);
      globalThis.crypto.getRandomValues(dbKeyBytes);
      const dbEncryptionKey = toBase64(dbKeyBytes);

      setConnectStage("create_client");
      const createdClient = await withTimeout(
        Client.create(signer, {
          env,
          disableAutoRegister: true,
          dbEncryptionKey: dbKeyBytes,
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

      const hasConversationAccess = await checkConversationAccess(createdClient);
      if (!hasConversationAccess) {
        createdClient.close();
        throw new Error("XMTP client did not pass conversation access check.");
      }

      const persistedSession: PersistedSession = {
        env,
        identifier,
        dbEncryptionKey,
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
    [checkConversationAccess, persistSession, setClient]
  );

  const initXMTPClient = useCallback(async () => {
    if (client) {
      return client;
    }

    if (identifierCandidates.length === 0) {
      persistRestoreDebug({
        result: "not_restored",
        envCandidates: [],
        identifierCandidates,
        attempts: [],
        reason: "missing_identity",
      });
      return undefined;
    }

    dispatch(setInitializing(true));
    dispatch(setError(null));

    try {
      return await buildAndRestore();
    } catch (error) {
      dispatch(setError(error as Error));
      persistRestoreDebug({
        result: "error",
        envCandidates: resolveEnvCandidates(),
        identifierCandidates,
        attempts: [],
        reason: "restore_exception",
        error: stringifyError(error),
      });
      return undefined;
    } finally {
      dispatch(setInitializing(false));
    }
  }, [
    buildAndRestore,
    client,
    dispatch,
    identifierCandidates,
    persistRestoreDebug,
    resolveEnvCandidates,
  ]);

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

      if (!walletAddress) {
        throw new Error("Wallet is not connected. Reconnect your wallet and try again.");
      }

      if (!primaryIdentifier) {
        throw new Error("Missing XMTP identity address.");
      }

      setConnectingXMTP(true);
      dispatch(setInitializing(true));
      dispatch(setError(null));
      updateStage("idle");

      try {
        updateStage("restore_session");
        const restoredClient = await buildAndRestore();
        if (restoredClient) {
          updateStage("connected");
          return restoredClient;
        }

        updateStage("build_failed_fallback_create");

        updateStage("prompt_signature");
        await withTimeout(
          requestWalletSignature(`Enable XMTP for w3rk (${primaryIdentifier})`, "preflight"),
          45000,
          "Wallet signature timed out."
        );

        const env = resolveEnvCandidates()[0] ?? getEnv();

        const signerAttempts: Array<{
          identifier: string;
          mode: "primary" | "eoa_fallback";
          signerType: "SCW" | "EOA";
        }> = [
          {
            identifier: primaryIdentifier,
            mode: "primary",
            signerType: isScwIdentity && primaryIdentifier === xmtpAddress ? "SCW" : "EOA",
          },
        ];

        const shouldTryEoaFallback =
          isScwIdentity && Boolean(walletAddress) && walletAddress !== primaryIdentifier;

        if (shouldTryEoaFallback) {
          signerAttempts.push({
            identifier: walletAddress,
            mode: "eoa_fallback",
            signerType: "EOA",
          });
        }

        let lastError: unknown;

        for (const attempt of signerAttempts) {
          const signer = buildSigner(attempt.identifier, env, attempt.mode);

          try {
            logDebug("create:attempt", {
              env,
              identifier: attempt.identifier,
              mode: attempt.mode,
              signerType: attempt.signerType,
            });

            return await createAndRegisterClient(
              env,
              attempt.identifier,
              signer,
              attempt.signerType
            );
          } catch (error) {
            lastError = error;
            logError("create:attempt_failed", error, {
              env,
              identifier: attempt.identifier,
              mode: attempt.mode,
              signerType: attempt.signerType,
            });

            if (parseInstallationLimitError(error)) {
              try {
                await revokeOldInstallations(signer, env, error);
                return await createAndRegisterClient(
                  env,
                  attempt.identifier,
                  signer,
                  attempt.signerType
                );
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

        if (parseInstallationLimitError(lastError)) {
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
      buildAndRestore,
      buildSigner,
      client,
      createAndRegisterClient,
      dispatch,
      isScwIdentity,
      logDebug,
      logError,
      primaryIdentifier,
      requestWalletSignature,
      resolveEnvCandidates,
      revokeOldInstallations,
      setClient,
      walletAddress,
      xmtpAddress,
    ]
  );

  const wasXMTPEnabled = useCallback(() => {
    const store = readSessionStore();
    const hasScopedSession = scopeKeys.some(scope => Boolean(store[scope]));
    if (hasScopedSession) {
      return true;
    }

    if (typeof window === "undefined") {
      return false;
    }

    try {
      const raw = window.localStorage.getItem(XMTP_ENABLED_IDENTIFIERS_KEY);
      if (!raw) {
        return false;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return false;
      }

      const enabledIdentifiers = parsed
        .filter((value): value is string => typeof value === "string")
        .map(value => value.toLowerCase());

      return identifierCandidates.some(identifier => enabledIdentifiers.includes(identifier));
    } catch {
      return false;
    }
  }, [identifierCandidates, readSessionStore, scopeKeys]);

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
