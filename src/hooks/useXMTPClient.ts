"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState } from "react";
import {
  Client,
  Opfs,
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
const XMTP_API_URLS = {
  local: "http://localhost:5557",
  dev: "https://api.dev.xmtp.network:5558",
  production: "https://api.production.xmtp.network:5558",
} as const;
const XMTP_LAST_ENV_KEY = "w3rk:xmtp:last-env";
const XMTP_ENABLED_SESSION_MAP_KEY = "w3rk:xmtp:enabled-session-map";
const XMTP_DB_KEY_STORAGE_LEGACY_PREFIX = "w3rk:xmtp:db-key";
const XMTP_DB_KEY_STORAGE_SUFFIX = "dbEncryptionKey";
const XMTP_DB_BACKUP_STORAGE_PREFIX = "w3rk:xmtp:db-backup";
const XMTP_DB_BACKUP_MAX_BYTES = 2_000_000;
const XMTP_RESTORE_DEBUG_KEY = "w3rk:xmtp:restore-debug:last";
const XMTP_LAST_SUCCESSFUL_CONNECTION_KEY = "w3rk:xmtp:last-successful-connection";
const XMTP_LAST_SUCCESSFUL_CONNECTION_MAP_KEY = "w3rk:xmtp:last-successful-connection-map";

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

const XMTP_MAX_INSTALLATIONS = 10;
type XMTPSessionState = {
  identifiers: string[];
  env?: "local" | "dev" | "production";
  lastIdentifier?: string;
  lastInboxId?: string;
  lastInstallationId?: string;
};
type XMTPSessionStateResolved = {
  identifiers: string[];
  env?: "local" | "dev" | "production";
  lastIdentifier?: string;
  lastInboxId?: string;
  lastInstallationId?: string;
  identifierHints: string[];
  installationHints: Array<{
    inboxId?: string;
    installationId?: string;
  }>;
};

type XMTPSessionMap = Record<string, XMTPSessionState>;
type XMTPRestoreAttemptDebug = {
  env: "local" | "dev" | "production";
  identifier: string;
  usedDbEncryptionKey: boolean;
  build: "ok" | "failed";
  buildErrorType: "missing_identity" | "db_key_mismatch" | "environment_mismatch" | "other" | null;
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
  origin?: string | null;
  restoreAttemptId?: string;
  restoreStartedAt?: string;
  restoreEndedAt?: string;
  restoreDurationMs?: number;
  walletReadyState?: {
    walletAddress: string | null;
    lensAccountAddress: string | null;
    xmtpAddress: string | null;
    walletClientAddress: string | null;
    walletClientChainId: number | null;
    hasWalletClient: boolean;
    isScwIdentity: boolean;
  };
  identity: {
    walletAddress: string | null;
    lensAccountAddress: string | null;
    lensProfileId: string | null;
    lensHandle: string | null;
    xmtpAddress: string | null;
    isScwIdentity: boolean;
  };
  envCandidates: ("local" | "dev" | "production")[];
  identifierCandidates: string[];
  attempts: XMTPRestoreAttemptDebug[];
  restoredEnv?: "local" | "dev" | "production";
  restoredIdentifier?: string;
  reason?: string;
  error?: string;
};
type XMTPLastSuccessfulConnection = {
  env: "local" | "dev" | "production";
  identifier: string;
  inboxId?: string;
  installationId?: string;
  dbEncryptionKey?: string;
  savedAt: string;
};
type XMTPLastSuccessfulConnectionMap = Record<string, XMTPLastSuccessfulConnection>;

export function useXMTPClient(params?: UseXMTPClientParams) {
  const dispatch = useDispatch();
  const { client, setClient } = useXMTP();
  const xmtpState = useSelector((state: RootState) => state.xmtp);
  const [connectingXMTP, setConnectingXMTP] = useState(false);
  const [connectStage, setConnectStage] = useState<XMTPConnectStage>("idle");
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const walletAddress = params?.walletAddress;
  const lensAccountAddress = params?.lensAccountAddress;
  const lensProfileId = params?.lensProfileId;
  const lensHandle = params?.lensHandle;

  // Lens v3 accounts are smart wallets. Prefer Lens account identity when available.
  const xmtpAddress = (lensAccountAddress ?? walletAddress)?.toLowerCase();
  const isScwIdentity =
    Boolean(lensAccountAddress) &&
    Boolean(walletAddress) &&
    lensAccountAddress!.toLowerCase() !== walletAddress!.toLowerCase();
  const walletClientAccountAddress = walletClient?.account?.address?.toLowerCase();
  const signerAccountAddress = (walletClient?.account?.address ?? walletAddress ?? null) as
    | Address
    | null;
  const expectedSigningAddress = signerAccountAddress?.toLowerCase() ?? null;
  const actualWalletClientAddress = walletClientAccountAddress ?? null;
  const signingAddress = signerAccountAddress;

  const logDebug = useCallback(
    (event: string, details?: Record<string, unknown>) => {
      console.info("[XMTP_DEBUG]", {
        event,
        walletAddress: walletAddress?.toLowerCase() ?? null,
        lensAccountAddress: lensAccountAddress?.toLowerCase() ?? null,
        xmtpAddress: xmtpAddress ?? null,
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
      const asError = error instanceof Error ? error : null;
      const asObject =
        typeof error === "object" && error !== null ? (error as Record<string, unknown>) : null;
      console.error("[XMTP_DEBUG_ERROR]", {
        event,
        walletAddress: walletAddress?.toLowerCase() ?? null,
        lensAccountAddress: lensAccountAddress?.toLowerCase() ?? null,
        xmtpAddress: xmtpAddress ?? null,
        lensProfileId: lensProfileId ?? null,
        lensHandle: lensHandle ?? null,
        isScwIdentity,
        errorName: asError?.name ?? null,
        errorMessage: asError?.message ?? String(error),
        errorStack: asError?.stack ?? null,
        errorCause: asError?.cause ?? asObject?.cause ?? null,
        errorCode: asObject?.code ?? null,
        errorDetails: asObject?.details ?? null,
        errorContext: asObject?.context ?? null,
        rawError: error,
        ...details,
      });
    },
    [walletAddress, lensAccountAddress, xmtpAddress, lensProfileId, lensHandle, isScwIdentity]
  );

  const stringifyError = useCallback((error: unknown) => {
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
  }, []);

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
        origin: typeof window !== "undefined" ? window.location.origin : null,
        identity: payload.identity ?? {
          walletAddress: walletAddress?.toLowerCase() ?? null,
          lensAccountAddress: lensAccountAddress?.toLowerCase() ?? null,
          lensProfileId: lensProfileId ?? null,
          lensHandle: lensHandle ?? null,
          xmtpAddress: xmtpAddress ?? null,
          isScwIdentity,
        },
        result: payload.result,
        restoreAttemptId: payload.restoreAttemptId,
        restoreStartedAt: payload.restoreStartedAt,
        restoreEndedAt: payload.restoreEndedAt,
        restoreDurationMs: payload.restoreDurationMs,
        walletReadyState: payload.walletReadyState,
        envCandidates: payload.envCandidates,
        identifierCandidates: payload.identifierCandidates,
        attempts: payload.attempts,
        restoredEnv: payload.restoredEnv,
        restoredIdentifier: payload.restoredIdentifier,
        reason: payload.reason,
        error: payload.error,
      };

      try {
        window.localStorage.setItem(XMTP_RESTORE_DEBUG_KEY, JSON.stringify(snapshot));
      } catch (error) {
        logError("restore:debug:persist_failed", error);
      }
    },
    [
      isScwIdentity,
      lensAccountAddress,
      lensHandle,
      lensProfileId,
      logError,
      walletAddress,
      xmtpAddress,
    ]
  );

  const signWithEthereumProvider = useCallback(
    async (message: string, accountAddress: Address | null): Promise<string | null> => {
      if (typeof window === "undefined") {
        return null;
      }

      const ethereum = (
        window as Window & { ethereum?: { request?: (args: any) => Promise<any> } }
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

  const withTimeout = async <T,>(
    promise: Promise<T>,
    timeoutMs = 45000,
    timeoutMessage = "XMTP connection timed out. Please retry."
  ): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

  const verifyBuiltClientReady = useCallback(
    async (
      builtClient: Client<unknown>,
      identifier: string,
      context: Record<string, unknown>,
      options?: {
        onError?: (error: unknown) => void;
      }
    ): Promise<boolean> => {
      try {
        const normalizedIdentifier = identifier.toLowerCase();
        const canMessageMap = await withTimeout(
          builtClient.canMessage([
            {
              identifier: normalizedIdentifier,
              identifierKind: IdentifierKind.Ethereum,
            },
          ]),
          5000,
          "Verifying XMTP client readiness timed out."
        );
        const isReady = Boolean(canMessageMap.get(normalizedIdentifier));
        logDebug("restore:verify:ready", {
          ...context,
          normalizedIdentifier,
          isReady,
        });
        return isReady;
      } catch (error) {
        logError("restore:verify:failed", error, context);
        options?.onError?.(error);
        return false;
      }
    },
    [logDebug, logError]
  );

  const verifyBuiltClientInstallation = useCallback(
    async (
      builtClient: Client<unknown>,
      env: "local" | "dev" | "production",
      context: Record<string, unknown>,
      options?: {
        onError?: (error: unknown) => void;
      }
    ): Promise<boolean> => {
      const inboxId = (builtClient as { inboxId?: string }).inboxId;
      const installationIdBytes = (builtClient as { installationIdBytes?: Uint8Array }).installationIdBytes;
      if (!inboxId || !installationIdBytes || installationIdBytes.length === 0) {
        return false;
      }

      try {
        const [inboxState] = await withTimeout(
          Client.fetchInboxStates([inboxId], env),
          10000,
          "Checking XMTP inbox state timed out."
        );
        const installations = inboxState?.installations ?? [];
        const hasInstallation = installations.some(installation => {
          const bytes = installation.bytes;
          if (bytes.length !== installationIdBytes.length) {
            return false;
          }
          for (let i = 0; i < bytes.length; i += 1) {
            if (bytes[i] !== installationIdBytes[i]) {
              return false;
            }
          }
          return true;
        });

        logDebug("restore:verify:installation_membership", {
          ...context,
          inboxId,
          installationCount: installations.length,
          hasInstallation,
        });
        return hasInstallation;
      } catch (error) {
        logError("restore:verify:installation_membership_failed", error, {
          ...context,
          inboxId,
        });
        options?.onError?.(error);
        return false;
      }
    },
    [logDebug, logError]
  );

  const bytesToBase64 = useCallback((bytes: Uint8Array) => {
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return window.btoa(binary);
    }

    return "";
  }, []);

  const base64ToBytes = useCallback((value: string) => {
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      const binary = window.atob(value);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }

    return new Uint8Array();
  }, []);

  const normalizeIdentifierAddress = useCallback((identifier: string) => {
    const normalized = identifier.toLowerCase();
    if (!normalized.startsWith("0x") || normalized.length !== 42) {
      return null;
    }
    return normalized;
  }, []);

  const buildDbKeyStorageKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string) => {
      const normalized = normalizeIdentifierAddress(identifier);
      return normalized ? `xmtp:${env}:${normalized}:${XMTP_DB_KEY_STORAGE_SUFFIX}` : null;
    },
    [normalizeIdentifierAddress]
  );

  const buildLegacyDbKeyStorageKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string) => {
      const normalized = normalizeIdentifierAddress(identifier);
      return normalized ? `${XMTP_DB_KEY_STORAGE_LEGACY_PREFIX}:${env}:${normalized}` : null;
    },
    [normalizeIdentifierAddress]
  );

  const loadDbEncryptionKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string): Uint8Array | undefined => {
      if (typeof window === "undefined") {
        return undefined;
      }

      const storageKey = buildDbKeyStorageKey(env, identifier);
      const legacyStorageKey = buildLegacyDbKeyStorageKey(env, identifier);
      if (!storageKey) {
        return undefined;
      }
      const raw = window.localStorage.getItem(storageKey);
      const legacyRaw =
        !raw && legacyStorageKey ? window.localStorage.getItem(legacyStorageKey) : null;
      const value = raw ?? legacyRaw;
      if (!value) {
        return undefined;
      }

      if (!raw && legacyRaw) {
        // Migrate once to the canonical storage key format.
        window.localStorage.setItem(storageKey, legacyRaw);
      }

      try {
        const bytes = base64ToBytes(value);
        return bytes.length > 0 ? bytes : undefined;
      } catch {
        return undefined;
      }
    },
    [base64ToBytes, buildDbKeyStorageKey, buildLegacyDbKeyStorageKey]
  );

  const storeDbEncryptionKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string, key: Uint8Array) => {
      if (typeof window === "undefined") {
        return;
      }

      const storageKey = buildDbKeyStorageKey(env, identifier);
      const legacyStorageKey = buildLegacyDbKeyStorageKey(env, identifier);
      if (!storageKey) {
        return;
      }

      // Never overwrite an existing key for the same env + wallet identifier.
      const existing = window.localStorage.getItem(storageKey);
      if (existing) {
        return;
      }

      const encoded = bytesToBase64(key);
      window.localStorage.setItem(storageKey, encoded);
      if (legacyStorageKey && !window.localStorage.getItem(legacyStorageKey)) {
        window.localStorage.setItem(legacyStorageKey, encoded);
      }
    },
    [buildDbKeyStorageKey, buildLegacyDbKeyStorageKey, bytesToBase64]
  );

  const removeDbEncryptionKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string) => {
      if (typeof window === "undefined") {
        return;
      }

      const storageKey = buildDbKeyStorageKey(env, identifier);
      const legacyStorageKey = buildLegacyDbKeyStorageKey(env, identifier);
      if (storageKey) {
        window.localStorage.removeItem(storageKey);
      }
      if (legacyStorageKey) {
        window.localStorage.removeItem(legacyStorageKey);
      }
    },
    [buildDbKeyStorageKey, buildLegacyDbKeyStorageKey]
  );

  const getPreferredEnv = useCallback((): "local" | "dev" | "production" => {
    const configuredEnvRaw =
      process.env.NEXT_PUBLIC_XMTP_ENV ?? process.env.NEXT_PUBLIC_XMTP_ENVIRONMENT;
    if (
      configuredEnvRaw === "local" ||
      configuredEnvRaw === "dev" ||
      configuredEnvRaw === "production"
    ) {
      return configuredEnvRaw;
    }

    const fallbackEnv = getEnv();
    const walletChainId =
      typeof walletClient?.chain?.id === "number" ? BigInt(walletClient.chain.id) : null;
    const configuredLensChainId =
      process.env.NEXT_PUBLIC_LENS_CHAIN_ID &&
      Number.isFinite(Number(process.env.NEXT_PUBLIC_LENS_CHAIN_ID))
        ? BigInt(process.env.NEXT_PUBLIC_LENS_CHAIN_ID)
        : null;
    const lensChainId =
      walletChainId ??
      configuredLensChainId ??
      (fallbackEnv === "production" ? LENS_MAINNET_CHAIN_ID : LENS_TESTNET_CHAIN_ID);
    return lensChainId === LENS_MAINNET_CHAIN_ID ? "production" : "dev";
  }, [walletClient]);

  const getPreferredRestoreEnv = useCallback((): "local" | "dev" | "production" => {
    const configuredEnvRaw =
      process.env.NEXT_PUBLIC_XMTP_ENV ?? process.env.NEXT_PUBLIC_XMTP_ENVIRONMENT;
    if (
      configuredEnvRaw === "local" ||
      configuredEnvRaw === "dev" ||
      configuredEnvRaw === "production"
    ) {
      return configuredEnvRaw;
    }

    if (typeof window !== "undefined") {
      const persistedEnvRaw = window.localStorage.getItem(XMTP_LAST_ENV_KEY);
      if (
        persistedEnvRaw === "local" ||
        persistedEnvRaw === "dev" ||
        persistedEnvRaw === "production"
      ) {
        return persistedEnvRaw;
      }
    }

    return getEnv();
  }, []);

  const hasRestoreDbKeyForWallet = useCallback(() => {
    if (!walletAddress) {
      return false;
    }
    const env = getPreferredRestoreEnv();
    return Boolean(loadDbEncryptionKey(env, walletAddress.toLowerCase()));
  }, [getPreferredRestoreEnv, loadDbEncryptionKey, walletAddress]);

  const buildStableDbPath = useCallback(
    (env: "local" | "dev" | "production", identifier: string) => {
      const normalized = normalizeIdentifierAddress(identifier);
      if (!normalized) {
        return null;
      }
      // Keep db file stable per env + wallet identifier so create/build point to the same local DB.
      return `xmtp-${env}-${normalized.replace(/^0x/, "")}.db3`;
    },
    [normalizeIdentifierAddress]
  );

  const buildDbBackupStorageKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string) => {
      const normalized = normalizeIdentifierAddress(identifier);
      return normalized ? `${XMTP_DB_BACKUP_STORAGE_PREFIX}:${env}:${normalized}` : null;
    },
    [normalizeIdentifierAddress]
  );

  const loadDbBackup = useCallback(
    (env: "local" | "dev" | "production", identifier: string): Uint8Array | undefined => {
      if (typeof window === "undefined") {
        return undefined;
      }
      const key = buildDbBackupStorageKey(env, identifier);
      if (!key) {
        return undefined;
      }
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return undefined;
      }
      try {
        const bytes = base64ToBytes(raw);
        return bytes.length > 0 ? bytes : undefined;
      } catch {
        return undefined;
      }
    },
    [base64ToBytes, buildDbBackupStorageKey]
  );

  const persistDbBackupFromOpfs = useCallback(
    async (env: "local" | "dev" | "production", identifier: string, dbPath: string | null) => {
      if (typeof window === "undefined" || !dbPath) {
        return false;
      }
      const storageKey = buildDbBackupStorageKey(env, identifier);
      if (!storageKey) {
        return false;
      }

      let opfs: Opfs | null = null;
      try {
        opfs = await Opfs.create(false);
        for (let attempt = 0; attempt < 3; attempt += 1) {
          const exists = await opfs.fileExists(dbPath);
          if (!exists) {
            await new Promise(resolve => setTimeout(resolve, 150));
            continue;
          }

          const exported = await opfs.exportDb(dbPath);
          if (!exported || exported.length === 0 || exported.length > XMTP_DB_BACKUP_MAX_BYTES) {
            return false;
          }
          window.localStorage.setItem(storageKey, bytesToBase64(exported));
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        opfs?.close();
      }
    },
    [buildDbBackupStorageKey, bytesToBase64]
  );

  const restoreDbBackupToOpfsIfMissing = useCallback(
    async (env: "local" | "dev" | "production", identifier: string, dbPath: string | null) => {
      if (typeof window === "undefined" || !dbPath) {
        return false;
      }

      const backupBytes = loadDbBackup(env, identifier);
      if (!backupBytes || backupBytes.length === 0) {
        return false;
      }

      let opfs: Opfs | null = null;
      try {
        opfs = await Opfs.create(false);
        const exists = await opfs.fileExists(dbPath);
        if (exists) {
          return false;
        }
        await opfs.importDb(dbPath, backupBytes);
        return true;
      } catch {
        return false;
      } finally {
        opfs?.close();
      }
    },
    [loadDbBackup]
  );

  const isInstallationLimitError = useCallback((error: unknown) => {
    const message = stringifyError(error).toLowerCase();
    return (
      message.includes("cannot register a new installation") &&
      message.includes("installations")
    );
  }, [stringifyError]);

  const inspectIndexedDbState = useCallback(async () => {
    if (typeof window === "undefined" || typeof window.indexedDB === "undefined") {
      return {
        indexedDbAvailable: false,
        indexedDbDatabasesApiAvailable: false,
        databaseNames: [] as string[],
        hasLikelyXmtpDb: false,
      };
    }

    const idb = window.indexedDB as IDBFactory & {
      databases?: () => Promise<Array<{ name?: string }>>;
    };
    if (typeof idb.databases !== "function") {
      return {
        indexedDbAvailable: true,
        indexedDbDatabasesApiAvailable: false,
        databaseNames: [] as string[],
        hasLikelyXmtpDb: false,
      };
    }

    try {
      const databases = await idb.databases();
      const databaseNames = databases
        .map(db => (typeof db.name === "string" ? db.name : ""))
        .filter(name => name.length > 0);
      const hasLikelyXmtpDb = databaseNames.some(name =>
        /xmtp|libsql|sqlite|message|inbox/i.test(name)
      );
      return {
        indexedDbAvailable: true,
        indexedDbDatabasesApiAvailable: true,
        databaseNames,
        hasLikelyXmtpDb,
      };
    } catch {
      return {
        indexedDbAvailable: true,
        indexedDbDatabasesApiAvailable: true,
        databaseNames: [] as string[],
        hasLikelyXmtpDb: false,
      };
    }
  }, []);

  const logEnablePersistenceSnapshot = useCallback(
    async (
      stage: string,
      env: "local" | "dev" | "production",
      walletIdentifier: string,
      clientLike?: { inboxId?: string; installationId?: string }
    ) => {
      if (typeof window === "undefined") {
        return;
      }

      const normalizedWallet = walletIdentifier.toLowerCase();
      const stableDbPath = buildStableDbPath(env, normalizedWallet);
      const backupStorageKey = buildDbBackupStorageKey(env, normalizedWallet);
      const backupPresent = Boolean(
        backupStorageKey && window.localStorage.getItem(backupStorageKey)
      );
      const canonicalStorageKey = buildDbKeyStorageKey(env, normalizedWallet);
      const legacyStorageKey = buildLegacyDbKeyStorageKey(env, normalizedWallet);
      const canonicalDbKeyPresent = Boolean(
        canonicalStorageKey && window.localStorage.getItem(canonicalStorageKey)
      );
      const legacyDbKeyPresent = Boolean(
        legacyStorageKey && window.localStorage.getItem(legacyStorageKey)
      );
      const idbSnapshot = await inspectIndexedDbState();

      console.info("[XMTP_PERSISTENCE]", {
        stage,
        origin: window.location.origin,
        env,
        walletAddress: walletAddress?.toLowerCase() ?? null,
        walletIdentifier: normalizedWallet,
        stableDbPath,
        backupStorageKey,
        backupPresent,
        inboxId: clientLike?.inboxId ?? null,
        installationId: clientLike?.installationId ?? null,
        canonicalDbKeyStorageKey: canonicalStorageKey,
        canonicalDbKeyPresent,
        legacyDbKeyStorageKey: legacyStorageKey,
        legacyDbKeyPresent,
        lastEnv: window.localStorage.getItem(XMTP_LAST_ENV_KEY),
        ...idbSnapshot,
      });
    },
    [
      buildDbKeyStorageKey,
      buildStableDbPath,
      buildDbBackupStorageKey,
      buildLegacyDbKeyStorageKey,
      inspectIndexedDbState,
      walletAddress,
    ]
  );

  const classifyBuildError = useCallback((error: unknown) => {
    const message = stringifyError(error).toLowerCase();
    if (isInstallationLimitError(error)) {
      return "other" as const;
    }
    if (
      message.includes("missing identity update") ||
      message.includes("identity") ||
      message.includes("not registered") ||
      message.includes("not found")
    ) {
      return "missing_identity" as const;
    }
    if (
      /\bdb\b/.test(message) ||
      message.includes("database") ||
      message.includes("decrypt") ||
      message.includes("encryption key") ||
      message.includes("invalid key")
    ) {
      return "db_key_mismatch" as const;
    }
    if (
      message.includes("wrong env") ||
      message.includes("environment") ||
      message.includes("api.") ||
      message.includes("failed to fetch")
    ) {
      return "environment_mismatch" as const;
    }
    return "other" as const;
  }, [isInstallationLimitError, stringifyError]);

  const shouldRotateDbKey = useCallback((error: unknown) => {
    if (isInstallationLimitError(error)) {
      return false;
    }
    const classified = classifyBuildError(error);
    return classified === "db_key_mismatch";
  }, [classifyBuildError, isInstallationLimitError]);

  const buildEnvCandidates = useCallback(
    (
      preferredEnv: "local" | "dev" | "production",
      sessionEnv?: "local" | "dev" | "production",
      lastSuccessfulEnv?: "local" | "dev" | "production"
    ) =>
      Array.from(
        new Set(
          [preferredEnv, sessionEnv, lastSuccessfulEnv].filter(
            (value): value is "local" | "dev" | "production" => Boolean(value)
          )
        )
      ),
    []
  );

  const getOrCreateDbEncryptionKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string): Uint8Array => {
      const existing = loadDbEncryptionKey(env, identifier);
      if (existing) {
        return existing;
      }

      const generated = new Uint8Array(32);
      if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.getRandomValues === "function") {
        globalThis.crypto.getRandomValues(generated);
      } else {
        for (let i = 0; i < generated.length; i += 1) {
          generated[i] = Math.floor(Math.random() * 256);
        }
      }
      storeDbEncryptionKey(env, identifier, generated);
      return generated;
    },
    [loadDbEncryptionKey, storeDbEncryptionKey]
  );

  const normalizeLastSuccessful = useCallback(
    (value: unknown): XMTPLastSuccessfulConnection | null => {
      if (!value || typeof value !== "object") {
        return null;
      }
      const parsed = value as Partial<XMTPLastSuccessfulConnection>;
      if (
        parsed.env !== "local" &&
        parsed.env !== "dev" &&
        parsed.env !== "production"
      ) {
        return null;
      }
      if (typeof parsed.identifier !== "string") {
        return null;
      }

      const normalizedIdentifier = parsed.identifier.toLowerCase();
      if (!normalizedIdentifier.startsWith("0x") || normalizedIdentifier.length !== 42) {
        return null;
      }

      return {
        env: parsed.env,
        identifier: normalizedIdentifier,
        inboxId: typeof parsed.inboxId === "string" ? parsed.inboxId : undefined,
        installationId:
          typeof parsed.installationId === "string" ? parsed.installationId : undefined,
        dbEncryptionKey:
          typeof parsed.dbEncryptionKey === "string" ? parsed.dbEncryptionKey : undefined,
        savedAt:
          typeof parsed.savedAt === "string" && parsed.savedAt.length > 0
            ? parsed.savedAt
            : new Date().toISOString(),
      };
    },
    []
  );

  const getCurrentSessionKeysForLastSuccessful = useCallback(() => {
    const keys = [
      lensProfileId ? `lens:id:${lensProfileId}` : null,
      lensHandle ? `lens:handle:${lensHandle.toLowerCase().replace(/^@/, "")}` : null,
      lensAccountAddress ? `lens:address:${lensAccountAddress.toLowerCase()}` : null,
      walletAddress ? `wallet:${walletAddress.toLowerCase()}` : null,
      walletClientAccountAddress ? `walletClient:${walletClientAccountAddress}` : null,
      xmtpAddress ? `xmtp:${xmtpAddress.toLowerCase()}` : null,
    ].filter((value): value is string => Boolean(value));
    return Array.from(new Set(keys));
  }, [
    lensAccountAddress,
    lensHandle,
    lensProfileId,
    walletAddress,
    walletClientAccountAddress,
    xmtpAddress,
  ]);

  const getLastSuccessfulConnection = useCallback((): XMTPLastSuccessfulConnection | null => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const rawMap = window.localStorage.getItem(XMTP_LAST_SUCCESSFUL_CONNECTION_MAP_KEY);
      if (rawMap) {
        const parsedMap = JSON.parse(rawMap) as Record<string, unknown>;
        const currentSessionKeys = getCurrentSessionKeysForLastSuccessful();
        const candidates = currentSessionKeys
          .map(key => normalizeLastSuccessful(parsedMap[key]))
          .filter((item): item is XMTPLastSuccessfulConnection => Boolean(item))
          .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));
        if (candidates.length > 0) {
          return candidates[0];
        }
      }
    } catch {
      // Fall through to legacy key.
    }

    try {
      const raw = window.localStorage.getItem(XMTP_LAST_SUCCESSFUL_CONNECTION_KEY);
      if (!raw) {
        return null;
      }
      return normalizeLastSuccessful(JSON.parse(raw));
    } catch {
      return null;
    }
  }, [getCurrentSessionKeysForLastSuccessful, normalizeLastSuccessful]);

  const persistLastSuccessfulConnection = useCallback(
    (
      env: "local" | "dev" | "production",
      identifier: string,
      clientLike: { inboxId?: string; installationId?: string },
      dbEncryptionKey?: Uint8Array
    ) => {
      if (typeof window === "undefined") {
        return;
      }

      const normalizedIdentifier = identifier.toLowerCase();
      if (!normalizedIdentifier.startsWith("0x") || normalizedIdentifier.length !== 42) {
        return;
      }

      const payload: XMTPLastSuccessfulConnection = {
        env,
        identifier: normalizedIdentifier,
        inboxId: clientLike.inboxId,
        installationId: clientLike.installationId,
        dbEncryptionKey:
          dbEncryptionKey && dbEncryptionKey.length > 0
            ? bytesToBase64(dbEncryptionKey)
            : undefined,
        savedAt: new Date().toISOString(),
      };

      try {
        // Legacy single-slot key for backward compatibility.
        window.localStorage.setItem(XMTP_LAST_SUCCESSFUL_CONNECTION_KEY, JSON.stringify(payload));

        const rawMap = window.localStorage.getItem(XMTP_LAST_SUCCESSFUL_CONNECTION_MAP_KEY);
        const parsedMap =
          rawMap && typeof rawMap === "string"
            ? (JSON.parse(rawMap) as Record<string, unknown>)
            : {};
        const nextMap: XMTPLastSuccessfulConnectionMap = {};
        for (const [key, value] of Object.entries(parsedMap)) {
          const normalized = normalizeLastSuccessful(value);
          if (normalized) {
            nextMap[key] = normalized;
          }
        }
        for (const sessionKey of getCurrentSessionKeysForLastSuccessful()) {
          nextMap[sessionKey] = payload;
        }
        window.localStorage.setItem(
          XMTP_LAST_SUCCESSFUL_CONNECTION_MAP_KEY,
          JSON.stringify(nextMap)
        );
      } catch (error) {
        logError("restore:last_successful:persist_failed", error, {
          env,
          identifier: normalizedIdentifier,
        });
      }
    },
    [
      bytesToBase64,
      getCurrentSessionKeysForLastSuccessful,
      logError,
      normalizeLastSuccessful,
    ]
  );

  const getActiveSessionKeys = useCallback(() => {
    const keys = [
      lensProfileId ? `lens:id:${lensProfileId}` : null,
      lensHandle ? `lens:handle:${lensHandle.toLowerCase().replace(/^@/, "")}` : null,
      lensAccountAddress ? `lens:address:${lensAccountAddress.toLowerCase()}` : null,
      walletAddress ? `wallet:${walletAddress.toLowerCase()}` : null,
      walletClientAccountAddress ? `walletClient:${walletClientAccountAddress}` : null,
    ].filter((value): value is string => Boolean(value));

    return Array.from(new Set(keys));
  }, [
    lensAccountAddress,
    lensHandle,
    lensProfileId,
    walletAddress,
    walletClientAccountAddress,
  ]);

  const getPersistedSessionMap = useCallback((): XMTPSessionMap => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const raw = window.localStorage.getItem(XMTP_ENABLED_SESSION_MAP_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return {};
      }

      const entries = Object.entries(parsed as Record<string, unknown>);
      const normalized = entries.reduce<XMTPSessionMap>((acc, [key, value]) => {
        if (!value || typeof value !== "object") {
          return acc;
        }
        const maybeState = value as {
          identifiers?: unknown;
          env?: unknown;
          lastIdentifier?: unknown;
          lastInboxId?: unknown;
          lastInstallationId?: unknown;
        };
        const identifiers = Array.isArray(maybeState.identifiers)
          ? maybeState.identifiers
              .filter((item): item is string => typeof item === "string")
              .map(item => item.toLowerCase())
              .filter(item => item.startsWith("0x") && item.length === 42)
          : [];
        const env =
          maybeState.env === "local" || maybeState.env === "dev" || maybeState.env === "production"
            ? maybeState.env
            : undefined;
        const lastIdentifier =
          typeof maybeState.lastIdentifier === "string"
            ? maybeState.lastIdentifier.toLowerCase()
            : undefined;
        const normalizedLastIdentifier =
          lastIdentifier && lastIdentifier.startsWith("0x") && lastIdentifier.length === 42
            ? lastIdentifier
            : undefined;
        const lastInboxId =
          typeof maybeState.lastInboxId === "string" && maybeState.lastInboxId.length > 0
            ? maybeState.lastInboxId
            : undefined;
        const lastInstallationId =
          typeof maybeState.lastInstallationId === "string" && maybeState.lastInstallationId.length > 0
            ? maybeState.lastInstallationId
            : undefined;

        if (identifiers.length > 0 || env || normalizedLastIdentifier || lastInboxId || lastInstallationId) {
          acc[key] = {
            identifiers,
            env,
            lastIdentifier: normalizedLastIdentifier,
            lastInboxId,
            lastInstallationId,
          };
        }
        return acc;
      }, {});

      return normalized;
    } catch {
      return {};
    }
  }, []);

  const getPersistedSessionState = useCallback((): XMTPSessionStateResolved => {
    const sessionMap = getPersistedSessionMap();
    const sessionKeys = getActiveSessionKeys();
    if (sessionKeys.length === 0) {
      return {
        identifiers: [],
        env: undefined,
        identifierHints: [],
        installationHints: [],
      };
    }

    const identifiers = Array.from(
      new Set(
        sessionKeys.flatMap(key => sessionMap[key]?.identifiers ?? [])
      )
    );
    const env = sessionKeys.map(key => sessionMap[key]?.env).find(Boolean);
    const lastIdentifier = sessionKeys.map(key => sessionMap[key]?.lastIdentifier).find(Boolean);
    const lastInboxId = sessionKeys.map(key => sessionMap[key]?.lastInboxId).find(Boolean);
    const lastInstallationId = sessionKeys
      .map(key => sessionMap[key]?.lastInstallationId)
      .find(Boolean);
    const identifierHints = Array.from(
      new Set(
        sessionKeys
          .map(key => sessionMap[key]?.lastIdentifier)
          .filter((value): value is string => Boolean(value))
      )
    );
    const installationHints = sessionKeys
      .map(key => ({
        inboxId: sessionMap[key]?.lastInboxId,
        installationId: sessionMap[key]?.lastInstallationId,
      }))
      .filter(hint => Boolean(hint.inboxId || hint.installationId));
    return {
      identifiers,
      env,
      lastIdentifier,
      lastInboxId,
      lastInstallationId,
      identifierHints,
      installationHints,
    };
  }, [getActiveSessionKeys, getPersistedSessionMap]);

  const persistEnabledState = useCallback(
    (
      env: "local" | "dev" | "production",
      identifiers: string[] = [],
      sessionMeta?: { inboxId?: string | null; installationId?: string | null }
    ) => {
      if (typeof window === "undefined") {
        return;
      }

      const currentSessionIdentifiers = Array.from(
        new Set(
          [...identifiers, xmtpAddress ?? "", walletAddress ?? "", walletClientAccountAddress ?? ""]
            .map(value => value.toLowerCase())
            .filter(value => value.startsWith("0x") && value.length === 42)
        )
      );
      const preferredIdentifier = currentSessionIdentifiers[0];
      window.localStorage.setItem(XMTP_LAST_ENV_KEY, env);

      const sessionKeys = getActiveSessionKeys();
      if (sessionKeys.length > 0) {
        const currentSessionMap = getPersistedSessionMap();
        for (const key of sessionKeys) {
          const existing = currentSessionMap[key]?.identifiers ?? [];
          currentSessionMap[key] = {
            identifiers: Array.from(new Set([...existing, ...currentSessionIdentifiers])),
            env,
            lastIdentifier: preferredIdentifier ?? currentSessionMap[key]?.lastIdentifier,
            lastInboxId: sessionMeta?.inboxId ?? currentSessionMap[key]?.lastInboxId,
            lastInstallationId:
              sessionMeta?.installationId ?? currentSessionMap[key]?.lastInstallationId,
          };
        }
        window.localStorage.setItem(XMTP_ENABLED_SESSION_MAP_KEY, JSON.stringify(currentSessionMap));
      }
    },
    [
      getActiveSessionKeys,
      getPersistedSessionMap,
      walletAddress,
      walletClientAccountAddress,
      xmtpAddress,
    ]
  );

  const wasXMTPEnabled = useCallback(() => {
    const sessionState = getPersistedSessionState();
    const hasSessionMatch = sessionState.identifiers.length > 0;
    const hasLastSuccessful = Boolean(getLastSuccessfulConnection());
    return hasSessionMatch || hasLastSuccessful;
  }, [
    getLastSuccessfulConnection,
    getPersistedSessionState,
  ]);

  /**
   * Create and connect to an XMTP client using a signer
   */
  const createXMTPClient = useCallback(async (options?: XMTPConnectOptions) => {
    const updateStage = (stage: XMTPConnectStage) => {
      setConnectStage(stage);
      options?.onStage?.(stage);
      logDebug("stage:update", { stage });
    };

    logDebug("createXMTPClient:start", { hasExistingClient: Boolean(client) });

    if (client) {
      updateStage("connected");
      return client;
    }

    if (!xmtpAddress) {
      throw new Error("Missing XMTP identity address.");
    }

    if (!walletAddress) {
      throw new Error("Wallet is not connected. Reconnect your wallet and try again.");
    }

    setConnectingXMTP(true);
    updateStage("idle");
    dispatch(setInitializing(true));
    dispatch(setError(null));

    try {
      const requestWalletSignature = async (
        message: string,
        source: "preflight" | "xmtp_signer" | "xmtp_signer_eoa_fallback" = "xmtp_signer",
        overrideSigningAddress?: Address | null
      ): Promise<Uint8Array> => {
        const messageHash = keccak256(stringToHex(message));
        const activeSigningAddress = overrideSigningAddress ?? signingAddress;
        logDebug("signature:request:start", {
          source,
          message,
          messageHash,
          messagePreview: message.slice(0, 200),
          expectedSignerAddress: expectedSigningAddress,
          actualWalletClientAddress,
          activeSigningAddress,
        });
        const walletClientSignature = await withTimeout(
          (async () => {
            if (!walletClient) {
              logDebug("signature:walletClient:missing_account");
              return null;
            }
            try {
              logDebug("signature:walletClient:sign:start");
              return await walletClient.signMessage({
                account: activeSigningAddress ?? walletClient.account,
                message,
              });
            } catch {
              logDebug("signature:walletClient:sign:failed");
              return null;
            }
          })(),
          30000,
          "Wallet signature timed out."
        );

        const wagmiSignature =
          typeof walletClientSignature === "string"
            ? walletClientSignature
            : await withTimeout(
                (async () => {
                  logDebug("signature:wagmi:sign:start");
                  return signMessageAsync({ message });
                })(),
                30000,
                "Wallet signature timed out."
              ).catch(async () => null);

        const signature =
          typeof wagmiSignature === "string"
            ? wagmiSignature
            : await withTimeout(
                (async () => {
                  logDebug("signature:provider:sign:start");
                  return signWithEthereumProvider(message, activeSigningAddress);
                })(),
                30000,
                "Wallet signature timed out."
              );
        if (!signature) {
          logError("signature:request:missing_signature", "No signature returned");
          throw new Error("Wallet signature request failed or was cancelled.");
        }
        logDebug("signature:request:success", {
          source,
          messageHash,
          signatureLength: signature.length,
        });
        const normalizedSignature = signature.startsWith("0x")
          ? (signature as `0x${string}`)
          : (`0x${signature}` as `0x${string}`);
        return hexToBytes(normalizedSignature);
      };

      // Resolve a single canonical env for both create + future restore attempts.
      const configuredEnvRaw =
        process.env.NEXT_PUBLIC_XMTP_ENV ?? process.env.NEXT_PUBLIC_XMTP_ENVIRONMENT;
      const walletChainId =
        typeof walletClient?.chain?.id === "number" ? BigInt(walletClient.chain.id) : null;
      const configuredLensChainId =
        process.env.NEXT_PUBLIC_LENS_CHAIN_ID &&
        Number.isFinite(Number(process.env.NEXT_PUBLIC_LENS_CHAIN_ID))
          ? BigInt(process.env.NEXT_PUBLIC_LENS_CHAIN_ID)
          : null;
      const env = getPreferredEnv();
      const lensChainId =
        walletChainId ??
        configuredLensChainId ??
        (env === "production" ? LENS_MAINNET_CHAIN_ID : LENS_TESTNET_CHAIN_ID);
      const lensRpcFromWallet = walletClient?.chain?.rpcUrls?.default?.http?.[0] ?? null;
      const lensPublicRpcFromWallet = walletClient?.chain?.rpcUrls?.public?.http?.[0] ?? null;
      const xmtpApiUrl = XMTP_API_URLS[env];

      logDebug("config:resolved", {
        env,
        chainId: lensChainId.toString(),
        xmtpApiUrl,
        lensRpcFromWallet,
        lensPublicRpcFromWallet,
        configuredEnvRaw: configuredEnvRaw ?? null,
        walletChainId: walletChainId?.toString() ?? null,
        configuredLensChainId: configuredLensChainId?.toString() ?? null,
        expectedSignerAddress: expectedSigningAddress,
        actualWalletClientAddress,
        xmtpIdentifierAddress: xmtpAddress,
      });

      let lastError: unknown;

      const primaryIdentifier: Identifier = {
        identifier: xmtpAddress.toLowerCase(),
        identifierKind: IdentifierKind.Ethereum,
      };

      const fallbackIdentifier: Identifier | null =
        walletAddress && xmtpAddress !== walletAddress.toLowerCase()
          ? {
              identifier: walletAddress.toLowerCase(),
              identifierKind: IdentifierKind.Ethereum,
            }
          : null;

      updateStage("restore_session");
      try {
        logDebug("build:primary:start", { identifier: primaryIdentifier.identifier });
        const primaryDbEncryptionKey = loadDbEncryptionKey(env, primaryIdentifier.identifier);
        const primaryDbPath = buildStableDbPath(env, primaryIdentifier.identifier);
        const builtClient = await withTimeout(
          Client.build(primaryIdentifier, {
            env,
            ...(primaryDbEncryptionKey ? { dbEncryptionKey: primaryDbEncryptionKey } : {}),
            ...(primaryDbPath ? { dbPath: primaryDbPath } : {}),
          }),
          8000,
          "Restoring XMTP session timed out."
        );
        logDebug("build:primary:success");

        updateStage("check_registration");
        logDebug("build:primary:isRegistered:start");
        let isRegistered = false;
        let registrationCheckFailed = false;
        try {
          isRegistered = await withTimeout(
            builtClient.isRegistered(),
            10000,
            "Checking XMTP registration timed out."
          );
        } catch (registrationCheckError) {
          registrationCheckFailed = true;
          logError("build:primary:isRegistered:failed", registrationCheckError, {
            env,
            identifier: primaryIdentifier.identifier,
          });
        }
        logDebug("build:primary:isRegistered:result", { isRegistered });
        const hasInstallation = isRegistered
          ? true
          : await verifyBuiltClientInstallation(builtClient, env, {
              phase: "create:build:primary",
              env,
              identifier: primaryIdentifier.identifier,
              registrationCheckFailed,
            });

        const isUsable =
          isRegistered ||
          hasInstallation ||
          (await verifyBuiltClientReady(builtClient, primaryIdentifier.identifier, {
            phase: "create:build:primary",
            env,
            identifier: primaryIdentifier.identifier,
            registrationCheckFailed,
          }));

        if (isUsable) {
          logDebug("build:primary:registered:reuse_client");
          if (primaryDbEncryptionKey) {
            storeDbEncryptionKey(env, primaryIdentifier.identifier, primaryDbEncryptionKey);
          }
          setClient(builtClient);
          persistEnabledState(env, [primaryIdentifier.identifier], {
            inboxId: (builtClient as { inboxId?: string }).inboxId ?? null,
            installationId: (builtClient as { installationId?: string }).installationId ?? null,
          });
          persistLastSuccessfulConnection(
            env,
            primaryIdentifier.identifier,
            builtClient as { inboxId?: string; installationId?: string },
            primaryDbEncryptionKey
          );
          updateStage("connected");
          return builtClient;
        }

        // Build can succeed for an unregistered identity. Fall through to signer-based create.
        builtClient.close();
      } catch (buildError) {
        lastError = buildError;
        logError("build:primary:failed", buildError, { env, identifier: primaryIdentifier.identifier });
        console.warn(
          `XMTP build failed for ${primaryIdentifier.identifier} on ${env}.`,
          buildError
        );
      }

      if (fallbackIdentifier) {
        try {
          logDebug("build:fallback:start", { identifier: fallbackIdentifier.identifier });
          const fallbackDbEncryptionKey = loadDbEncryptionKey(env, fallbackIdentifier.identifier);
          const fallbackDbPath = buildStableDbPath(env, fallbackIdentifier.identifier);
          const builtFallbackClient = await withTimeout(
            Client.build(fallbackIdentifier, {
              env,
              ...(fallbackDbEncryptionKey ? { dbEncryptionKey: fallbackDbEncryptionKey } : {}),
              ...(fallbackDbPath ? { dbPath: fallbackDbPath } : {}),
            }),
            8000,
            "Restoring XMTP session timed out."
          );
          logDebug("build:fallback:success");

          updateStage("check_registration");
          logDebug("build:fallback:isRegistered:start");
          let isRegistered = false;
          let registrationCheckFailed = false;
          try {
            isRegistered = await withTimeout(
              builtFallbackClient.isRegistered(),
              10000,
              "Checking XMTP registration timed out."
            );
          } catch (registrationCheckError) {
            registrationCheckFailed = true;
            logError("build:fallback:isRegistered:failed", registrationCheckError, {
              env,
              identifier: fallbackIdentifier.identifier,
            });
          }
          logDebug("build:fallback:isRegistered:result", { isRegistered });
          const hasInstallation = isRegistered
            ? true
            : await verifyBuiltClientInstallation(builtFallbackClient, env, {
                phase: "create:build:fallback",
                env,
                identifier: fallbackIdentifier.identifier,
                registrationCheckFailed,
              });

          const isUsable =
            isRegistered ||
            hasInstallation ||
            (await verifyBuiltClientReady(
              builtFallbackClient,
              fallbackIdentifier.identifier,
              {
              phase: "create:build:fallback",
              env,
              identifier: fallbackIdentifier.identifier,
              registrationCheckFailed,
              }
            ));

          if (isUsable) {
            logDebug("build:fallback:registered:reuse_client");
            if (fallbackDbEncryptionKey) {
              storeDbEncryptionKey(env, fallbackIdentifier.identifier, fallbackDbEncryptionKey);
            }
            setClient(builtFallbackClient);
            persistEnabledState(env, [fallbackIdentifier.identifier], {
              inboxId: (builtFallbackClient as { inboxId?: string }).inboxId ?? null,
              installationId:
                (builtFallbackClient as { installationId?: string }).installationId ?? null,
            });
            persistLastSuccessfulConnection(
              env,
              fallbackIdentifier.identifier,
              builtFallbackClient as { inboxId?: string; installationId?: string },
              fallbackDbEncryptionKey
            );
            updateStage("connected");
            return builtFallbackClient;
          }

          builtFallbackClient.close();
        } catch (fallbackError) {
          lastError = fallbackError;
          logError("build:fallback:failed", fallbackError, {
            env,
            identifier: fallbackIdentifier.identifier,
          });
          console.warn(
            `XMTP build failed for fallback ${fallbackIdentifier.identifier} on ${env}.`,
            fallbackError
          );
        }
      }

      updateStage("build_failed_fallback_create");

      // Preflight signature to ensure wallet prompt path is available before XMTP registration.
      updateStage("prompt_signature");
      logDebug("preflight_signature:start");
      await withTimeout(
        requestWalletSignature(`Enable XMTP for w3rk (${xmtpAddress})`, "preflight"),
        45000,
        "Wallet signature timed out."
      );
      logDebug("preflight_signature:success");

      const baseSigner = {
        getIdentifier: () =>
          ({
            identifier: xmtpAddress.toLowerCase(),
            identifierKind: IdentifierKind.Ethereum,
          }) as Identifier,
        signMessage: async (message: string): Promise<Uint8Array> => {
          updateStage("prompt_signature");
          return await requestWalletSignature(message, "xmtp_signer");
        },
      };

      const signer: EOASigner | SCWSigner = isScwIdentity
        ? {
            type: "SCW",
            ...baseSigner,
            getChainId: () => lensChainId,
          }
        : {
            type: "EOA",
            ...baseSigner,
          };

      logDebug("signer:prepared", {
        signerType: signer.type,
        signerChainId: signer.type === "SCW" ? lensChainId.toString() : null,
      });

      let failedMethod: "Client.create" | "client.isRegistered" | "client.register" =
        "Client.create";

      const extractInboxIdFromError = (error: unknown) => {
        if (!(error instanceof Error)) {
          return undefined;
        }
        const match =
          error.message.match(/inboxid\s+([a-f0-9]{64})/i) ??
          error.message.match(/inbox\s+([a-f0-9]{64})/i);
        return match?.[1]?.toLowerCase();
      };

      const connectAndRegister = async (
        activeSigner: EOASigner | SCWSigner,
        mode: "primary" | "eoa_fallback"
      ) => {
        const signerIdentifier = await activeSigner.getIdentifier();
        const dbEncryptionKey = getOrCreateDbEncryptionKey(env, signerIdentifier.identifier);
        const dbPath = buildStableDbPath(env, signerIdentifier.identifier);

        updateStage("create_client");
        logDebug("create:start", {
          mode,
          env,
          disableAutoRegister: true,
          signerType: activeSigner.type,
          signerIdentifier: signerIdentifier.identifier,
        });
        const createdClient = await withTimeout(
          Client.create(activeSigner, {
            env,
            disableAutoRegister: true,
            dbEncryptionKey,
            ...(dbPath ? { dbPath } : {}),
          }),
          120000,
          "Creating XMTP client timed out."
        );
        storeDbEncryptionKey(env, signerIdentifier.identifier, dbEncryptionKey);
        logDebug("create:success", {
          mode,
          inboxId: (createdClient as { inboxId?: string }).inboxId ?? null,
        });

        updateStage("check_registration");
        logDebug("create:isRegistered:start", { mode });
        failedMethod = "client.isRegistered";
        const isRegistered = await withTimeout(
          createdClient.isRegistered(),
          15000,
          "Checking XMTP registration timed out."
        );
        logDebug("create:isRegistered:result", { mode, isRegistered });

        if (!isRegistered) {
          updateStage("register_account");
          failedMethod = "client.register";
          logDebug("create:register:start", {
            mode,
            registerValidationChainId:
              activeSigner.type === "SCW" ? activeSigner.getChainId().toString() : null,
            registerValidationRpc: lensRpcFromWallet ?? lensPublicRpcFromWallet,
            xmtpEnv: env,
            expectedSignerAddress: expectedSigningAddress,
            actualWalletClientAddress,
            xmtpIdentifierAddress:
              (await activeSigner.getIdentifier()).identifier?.toLowerCase() ?? xmtpAddress,
          });
          await withTimeout(createdClient.register(), 90000, "XMTP registration timed out.");
          logDebug("create:register:success", { mode });
        }

        persistLastSuccessfulConnection(
          env,
          signerIdentifier.identifier,
          createdClient as { inboxId?: string; installationId?: string },
          dbEncryptionKey
        );
        if (dbPath) {
          const didPersistBackup = await persistDbBackupFromOpfs(
            env,
            signerIdentifier.identifier,
            dbPath
          );
          logDebug("create:db_backup:persisted", {
            mode,
            env,
            identifier: signerIdentifier.identifier,
            dbPath,
            didPersistBackup,
          });
        }

        return createdClient;
      };

      const recoverInstallationLimit = async (
        activeSigner: EOASigner | SCWSigner,
        mode: "primary" | "eoa_fallback",
        sourceError: unknown
      ) => {
        const signerIdentifier = await activeSigner.getIdentifier();
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

        logDebug("create:installation_limit_recovery:start", {
          mode,
          inboxId,
          identifier: signerIdentifier.identifier,
        });

        const [inboxState] = await withTimeout(
          Client.fetchInboxStates([inboxId], env),
          20000,
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

        const revokeCount = Math.max(
          1,
          installations.length - (XMTP_MAX_INSTALLATIONS - 1)
        );
        const installationIdsToRevoke = sortedInstallations
          .slice(0, revokeCount)
          .map(installation => installation.bytes);

        logDebug("create:installation_limit_recovery:revoke", {
          mode,
          inboxId,
          installationCount: installations.length,
          revokeCount,
        });

        await withTimeout(
          Client.revokeInstallations(activeSigner, inboxId, installationIdsToRevoke, env),
          90000,
          "Revoking old XMTP installations timed out."
        );

        logDebug("create:installation_limit_recovery:revoke:success", {
          mode,
          inboxId,
          revoked: revokeCount,
        });

        return await connectAndRegister(activeSigner, mode);
      };

      try {
        const directClient = await connectAndRegister(signer, "primary");
        const directIdentifier = xmtpAddress?.toLowerCase() ?? "";
        const directDbKey = directIdentifier
          ? loadDbEncryptionKey(env, directIdentifier)
          : undefined;

        setClient(directClient);
        persistEnabledState(env, [xmtpAddress ?? ""], {
          inboxId: (directClient as { inboxId?: string }).inboxId ?? null,
          installationId: (directClient as { installationId?: string }).installationId ?? null,
        });
        persistLastSuccessfulConnection(
          env,
          directIdentifier,
          directClient as { inboxId?: string; installationId?: string },
          directDbKey
        );
        await logEnablePersistenceSnapshot(
          "create_connected_primary",
          env,
          directIdentifier,
          directClient as { inboxId?: string; installationId?: string }
        );
        updateStage("connected");
        logDebug("create:connected", { mode: "primary" });
        return directClient;
      } catch (createError) {
        lastError = createError;
        logError("create:failed", createError, {
          failedMethod,
          env,
          signerType: signer.type,
          signerChainId: signer.type === "SCW" ? lensChainId.toString() : null,
        });
        console.warn(
          `XMTP create failed for ${xmtpAddress} (${isScwIdentity ? "SCW" : "EOA"}) on ${env}.`,
          createError
        );

        if (isInstallationLimitError(createError)) {
          try {
            updateStage("register_account");
            const recoveredClient = await recoverInstallationLimit(
              signer,
              "primary",
              createError
            );
            const recoveredIdentifier = xmtpAddress?.toLowerCase() ?? "";
            const recoveredDbKey = recoveredIdentifier
              ? loadDbEncryptionKey(env, recoveredIdentifier)
              : undefined;
            setClient(recoveredClient);
            persistEnabledState(env, [xmtpAddress ?? ""], {
              inboxId: (recoveredClient as { inboxId?: string }).inboxId ?? null,
              installationId:
                (recoveredClient as { installationId?: string }).installationId ?? null,
            });
            persistLastSuccessfulConnection(
              env,
              recoveredIdentifier,
              recoveredClient as { inboxId?: string; installationId?: string },
              recoveredDbKey
            );
            await logEnablePersistenceSnapshot(
              "create_connected_primary_installation_limit_recovery",
              env,
              recoveredIdentifier,
              recoveredClient as { inboxId?: string; installationId?: string }
            );
            updateStage("connected");
            logDebug("create:connected", { mode: "primary_installation_limit_recovery" });
            return recoveredClient;
          } catch (recoveryError) {
            lastError = recoveryError;
            logError("create:installation_limit_recovery:failed", recoveryError, {
              env,
              failedMethod,
              signerType: signer.type,
            });
          }
        }

        const shouldTryEoaFallback =
          isScwIdentity &&
          Boolean(walletAddress) &&
          walletAddress.toLowerCase() !== xmtpAddress.toLowerCase();

        if (shouldTryEoaFallback) {
          try {
            logDebug("create:eoa_fallback:start", {
              walletAddress: walletAddress?.toLowerCase(),
              xmtpAddress,
            });

            const fallbackSigner: EOASigner = {
              type: "EOA",
              getIdentifier: () =>
                ({
                  identifier: walletAddress!.toLowerCase(),
                  identifierKind: IdentifierKind.Ethereum,
                }) as Identifier,
              signMessage: async (message: string): Promise<Uint8Array> => {
                updateStage("prompt_signature");
                return requestWalletSignature(
                  message,
                  "xmtp_signer_eoa_fallback",
                  (walletAddress ?? walletClient?.account?.address ?? null) as Address | null
                );
              },
            };

            failedMethod = "Client.create";
            const fallbackClient = await connectAndRegister(fallbackSigner, "eoa_fallback");
            const fallbackIdentifier = walletAddress?.toLowerCase() ?? "";
            const fallbackDbKey = fallbackIdentifier
              ? loadDbEncryptionKey(env, fallbackIdentifier)
              : undefined;
            setClient(fallbackClient);
            persistEnabledState(env, [walletAddress ?? ""], {
              inboxId: (fallbackClient as { inboxId?: string }).inboxId ?? null,
              installationId: (fallbackClient as { installationId?: string }).installationId ?? null,
            });
            persistLastSuccessfulConnection(
              env,
              fallbackIdentifier,
              fallbackClient as { inboxId?: string; installationId?: string },
              fallbackDbKey
            );
            await logEnablePersistenceSnapshot(
              "create_connected_eoa_fallback",
              env,
              fallbackIdentifier,
              fallbackClient as { inboxId?: string; installationId?: string }
            );
            updateStage("connected");
            logDebug("create:connected", { mode: "eoa_fallback" });
            return fallbackClient;
          } catch (fallbackError) {
            lastError = fallbackError;
            logError("create:eoa_fallback:failed", fallbackError, {
              env,
              walletAddress: walletAddress?.toLowerCase() ?? null,
            });

            if (isInstallationLimitError(fallbackError)) {
              try {
                updateStage("register_account");
                const fallbackSigner: EOASigner = {
                  type: "EOA",
                  getIdentifier: () =>
                    ({
                      identifier: walletAddress!.toLowerCase(),
                      identifierKind: IdentifierKind.Ethereum,
                    }) as Identifier,
                  signMessage: async (message: string): Promise<Uint8Array> => {
                    updateStage("prompt_signature");
                    return requestWalletSignature(
                      message,
                      "xmtp_signer_eoa_fallback",
                      (walletAddress ?? walletClient?.account?.address ?? null) as Address | null
                    );
                  },
                };

                const recoveredClient = await recoverInstallationLimit(
                  fallbackSigner,
                  "eoa_fallback",
                  fallbackError
                );
                const recoveredIdentifier = walletAddress?.toLowerCase() ?? "";
                const recoveredDbKey = recoveredIdentifier
                  ? loadDbEncryptionKey(env, recoveredIdentifier)
                  : undefined;
                setClient(recoveredClient);
                persistEnabledState(env, [walletAddress ?? ""], {
                  inboxId: (recoveredClient as { inboxId?: string }).inboxId ?? null,
                  installationId:
                    (recoveredClient as { installationId?: string }).installationId ?? null,
                });
                persistLastSuccessfulConnection(
                  env,
                  recoveredIdentifier,
                  recoveredClient as { inboxId?: string; installationId?: string },
                  recoveredDbKey
                );
                await logEnablePersistenceSnapshot(
                  "create_connected_eoa_fallback_installation_limit_recovery",
                  env,
                  recoveredIdentifier,
                  recoveredClient as { inboxId?: string; installationId?: string }
                );
                updateStage("connected");
                logDebug("create:connected", { mode: "eoa_fallback_installation_limit_recovery" });
                return recoveredClient;
              } catch (recoveryError) {
                lastError = recoveryError;
                logError("create:eoa_fallback_installation_limit_recovery:failed", recoveryError, {
                  env,
                  walletAddress: walletAddress?.toLowerCase() ?? null,
                });
              }
            }
          }
        }
      }

      if (lastError instanceof Error) {
        logError("create:final_error", lastError);
        if (isInstallationLimitError(lastError)) {
          throw new Error(
            "XMTP installation limit reached and automatic cleanup failed. Please revoke old XMTP installations and try again."
          );
        }
        throw lastError;
      }

      logError("create:unknown_error", lastError);
      throw new Error("Unable to create XMTP client.");
    } catch (error) {
      logError("createXMTPClient:outer_catch", error);
      dispatch(setError(error as Error));
      setClient(undefined);
      updateStage("failed");
      throw error;
    } finally {
      dispatch(setInitializing(false));
      setConnectingXMTP(false);
    }
  }, [
    client,
    dispatch,
    setClient,
    signMessageAsync,
    walletClient,
    signWithEthereumProvider,
    walletAddress,
    isScwIdentity,
    xmtpAddress,
    logDebug,
    logError,
    loadDbEncryptionKey,
    buildStableDbPath,
    getOrCreateDbEncryptionKey,
    storeDbEncryptionKey,
    isInstallationLimitError,
    persistEnabledState,
    persistLastSuccessfulConnection,
    persistDbBackupFromOpfs,
    logEnablePersistenceSnapshot,
    getPreferredEnv,
    verifyBuiltClientInstallation,
    verifyBuiltClientReady,
    expectedSigningAddress,
    actualWalletClientAddress,
    signingAddress,
  ]);

  /**
   * Reconnect/initiate an existing XMTP client using `Client.build`
   */
  const initXMTPClient = useCallback(async () => {
    const lastSuccessfulConnection = getLastSuccessfulConnection();
    const restoreAddressCandidates = walletAddress
      ? [walletAddress.toLowerCase()].filter(
          (value): value is string => value.startsWith("0x") && value.length === 42
        )
      : [];
    const restoreAttempts: XMTPRestoreAttemptDebug[] = [];
    const restoreAttemptId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const restoreStartedAtMs = Date.now();
    const restoreStartedAtIso = new Date(restoreStartedAtMs).toISOString();
    const walletReadyState: XMTPRestoreDebugSnapshot["walletReadyState"] = {
      walletAddress: walletAddress?.toLowerCase() ?? null,
      lensAccountAddress: lensAccountAddress?.toLowerCase() ?? null,
      xmtpAddress: xmtpAddress ?? null,
      walletClientAddress: walletClientAccountAddress ?? null,
      walletClientChainId: typeof walletClient?.chain?.id === "number" ? walletClient.chain.id : null,
      hasWalletClient: Boolean(walletClient),
      isScwIdentity,
    };

    const baseIdentity = {
      walletAddress: walletAddress?.toLowerCase() ?? null,
      lensAccountAddress: lensAccountAddress?.toLowerCase() ?? null,
      lensProfileId: lensProfileId ?? null,
      lensHandle: lensHandle ?? null,
      xmtpAddress: xmtpAddress ?? null,
      isScwIdentity,
    };

    logDebug("init:restore:start", {
      restoreAttemptId,
      restoreStartedAt: restoreStartedAtIso,
      walletReadyState,
    });

    if (restoreAddressCandidates.length === 0) {
      const endedAt = new Date().toISOString();
      persistRestoreDebug({
        result: "not_restored",
        restoreAttemptId,
        restoreStartedAt: restoreStartedAtIso,
        restoreEndedAt: endedAt,
        restoreDurationMs: Date.now() - restoreStartedAtMs,
        walletReadyState,
        identity: baseIdentity,
        envCandidates: [],
        identifierCandidates: [],
        attempts: restoreAttempts,
        reason: "missing_wallet_address",
      });
      logDebug("init:restore:end", {
        restoreAttemptId,
        restoreEndedAt: endedAt,
        restoreDurationMs: Date.now() - restoreStartedAtMs,
        result: "not_restored",
        reason: "missing_wallet_address",
      });
      return;
    }

    dispatch(setInitializing(true));
    dispatch(setError(null));
    let restoreResult: "restored" | "not_restored" | "error" = "not_restored";
    let restoreReason = "no_usable_restore_candidate";

    try {
      const persistedEnvRaw =
        typeof window !== "undefined" ? window.localStorage.getItem(XMTP_LAST_ENV_KEY) : null;
      const persistedEnv =
        persistedEnvRaw === "local" || persistedEnvRaw === "dev" || persistedEnvRaw === "production"
          ? persistedEnvRaw
          : undefined;
      const preferredEnv = getPreferredRestoreEnv();
      const primaryWalletIdentifier = restoreAddressCandidates[0];
      const primaryDbEncryptionKey = loadDbEncryptionKey(preferredEnv, primaryWalletIdentifier);
      const lastSuccessfulDbKeyCandidate =
        lastSuccessfulConnection &&
        lastSuccessfulConnection.identifier === primaryWalletIdentifier &&
        lastSuccessfulConnection.dbEncryptionKey
          ? lastSuccessfulConnection.dbEncryptionKey
          : undefined;

      if (!primaryDbEncryptionKey && !lastSuccessfulDbKeyCandidate) {
        restoreReason = "missing_db_encryption_key";
        const endedAt = new Date().toISOString();
        persistRestoreDebug({
          result: "not_restored",
          restoreAttemptId,
          restoreStartedAt: restoreStartedAtIso,
          restoreEndedAt: endedAt,
          restoreDurationMs: Date.now() - restoreStartedAtMs,
          walletReadyState,
          identity: baseIdentity,
          envCandidates: [preferredEnv],
          identifierCandidates: [primaryWalletIdentifier],
          attempts: restoreAttempts,
          reason: "missing_db_encryption_key",
        });
        return undefined;
      }

      const envCandidates = buildEnvCandidates(
        preferredEnv,
        persistedEnv,
        lastSuccessfulConnection?.env
      );

      const identifierCandidates = [primaryWalletIdentifier];

      const identifiers: Identifier[] = identifierCandidates.map(identifier => ({
        identifier,
        identifierKind: IdentifierKind.Ethereum,
      }));
      const expectedInstallationHints: Array<{ inboxId?: string; installationId?: string }> = [];

      if (identifierCandidates.length === 0) {
        restoreReason = "identifier_candidates_empty";
        const endedAt = new Date().toISOString();
        persistRestoreDebug({
          result: "not_restored",
          restoreAttemptId,
          restoreStartedAt: restoreStartedAtIso,
          restoreEndedAt: endedAt,
          restoreDurationMs: Date.now() - restoreStartedAtMs,
          walletReadyState,
          identity: baseIdentity,
          envCandidates,
          identifierCandidates,
          attempts: restoreAttempts,
          reason: "identifier_candidates_empty",
        });
        return undefined;
      }

      const MAX_BUILD_ATTEMPTS = 6;
      let attempts = 0;
      const opfsBackupRestoreAttempts = new Set<string>();

      for (const identifier of identifiers) {
        for (const env of envCandidates) {
          if (attempts >= MAX_BUILD_ATTEMPTS) {
            break;
          }
          attempts += 1;

          try {
            logDebug("init:build:start", {
              env,
              identifier: identifier.identifier,
              attempt: attempts,
            });

            const dbEncryptionKey = loadDbEncryptionKey(env, identifier.identifier);
            const keyCandidates: Uint8Array[] = [];
            const seenKeys = new Set<string>();
            const addKeyCandidate = (key: Uint8Array | undefined) => {
              if (!key || key.length === 0) {
                return;
              }
              const fingerprint = bytesToBase64(key);
              if (!fingerprint || seenKeys.has(fingerprint)) {
                return;
              }
              seenKeys.add(fingerprint);
              keyCandidates.push(key);
            };

            if (
              lastSuccessfulConnection &&
              lastSuccessfulConnection.env === env &&
              lastSuccessfulConnection.identifier === identifier.identifier &&
              lastSuccessfulConnection.dbEncryptionKey
            ) {
              try {
                addKeyCandidate(base64ToBytes(lastSuccessfulConnection.dbEncryptionKey));
              } catch {
                // ignore malformed persisted key data
              }
            }

            addKeyCandidate(dbEncryptionKey);
            const stableDbPath = buildStableDbPath(env, identifier.identifier);
            if (stableDbPath) {
              const opfsAttemptKey = `${env}:${identifier.identifier}:${stableDbPath}`;
              if (!opfsBackupRestoreAttempts.has(opfsAttemptKey)) {
                opfsBackupRestoreAttempts.add(opfsAttemptKey);
                const restoredFromBackup = await restoreDbBackupToOpfsIfMissing(
                  env,
                  identifier.identifier,
                  stableDbPath
                );
                logDebug("init:build:db_backup:restore_attempt", {
                  restoreAttemptId,
                  env,
                  identifier: identifier.identifier,
                  dbPath: stableDbPath,
                  restoredFromBackup,
                });
              }
            }
            const buildOptions =
              keyCandidates.length > 0
                ? [
                    ...keyCandidates.map((key, index) => ({
                      env,
                      dbEncryptionKey: key,
                      ...(stableDbPath ? { dbPath: stableDbPath } : {}),
                      source:
                        index === 0 &&
                        Boolean(
                          lastSuccessfulConnection &&
                            lastSuccessfulConnection.env === env &&
                            lastSuccessfulConnection.identifier === identifier.identifier &&
                            lastSuccessfulConnection.dbEncryptionKey
                        )
                          ? ("last_successful" as const)
                          : ("persisted" as const),
                    })),
                    { env, ...(stableDbPath ? { dbPath: stableDbPath } : {}), source: "none" as const },
                  ]
                : [{ env, ...(stableDbPath ? { dbPath: stableDbPath } : {}), source: "none" as const }];

            for (const options of buildOptions) {
              const optionDbEncryptionKey =
                "dbEncryptionKey" in options ? options.dbEncryptionKey : undefined;
              const attemptDebug: XMTPRestoreAttemptDebug = {
                env,
                identifier: identifier.identifier,
                usedDbEncryptionKey: Boolean(optionDbEncryptionKey),
                build: "failed",
                buildErrorType: null,
                inboxId: null,
                installationId: null,
                matchesPersistedInstallation: null,
                registrationCheckFailed: false,
                installationInInbox: null,
                conversationAccess: null,
                isRegistered: null,
                canMessageReady: null,
              };
              const appendAttemptError = (label: string, error: unknown) => {
                const message = stringifyError(error);
                attemptDebug.error = attemptDebug.error
                  ? `${attemptDebug.error} | ${label}:${message}`
                  : `${label}:${message}`;
              };

              let builtClient: Client<unknown> | undefined;
              const clientBuildStartedAtMs = Date.now();
              logDebug("init:build:before_client_build", {
                restoreAttemptId,
                env,
                identifier: identifier.identifier,
                optionSource: options.source,
                usedDbEncryptionKey: Boolean(optionDbEncryptionKey),
                attempt: attempts,
              });
              try {
                builtClient = await withTimeout(
                  Client.build(identifier, options),
                  4000,
                  "Restoring XMTP session timed out."
                );
                logDebug("init:build:after_client_build", {
                  restoreAttemptId,
                  env,
                  identifier: identifier.identifier,
                  optionSource: options.source,
                  usedDbEncryptionKey: Boolean(optionDbEncryptionKey),
                  durationMs: Date.now() - clientBuildStartedAtMs,
                });
                attemptDebug.build = "ok";
                const builtInboxId = (builtClient as { inboxId?: string }).inboxId ?? null;
                const builtInstallationId =
                  (builtClient as { installationId?: string }).installationId ?? null;
                attemptDebug.inboxId = builtInboxId;
                attemptDebug.installationId = builtInstallationId;
                const matchesLastSuccessfulInstallation = Boolean(
                  options.source === "last_successful" &&
                    lastSuccessfulConnection &&
                    env === lastSuccessfulConnection.env &&
                    identifier.identifier === lastSuccessfulConnection.identifier &&
                    lastSuccessfulConnection.installationId &&
                    builtInstallationId &&
                    builtInstallationId === lastSuccessfulConnection.installationId &&
                    (!lastSuccessfulConnection.inboxId ||
                      builtInboxId === lastSuccessfulConnection.inboxId)
                );
                const isLastSuccessfulExactBuild =
                  options.source === "last_successful" &&
                  Boolean(lastSuccessfulConnection) &&
                  env === lastSuccessfulConnection?.env &&
                  identifier.identifier === lastSuccessfulConnection?.identifier &&
                  Boolean(options.dbEncryptionKey) &&
                  (!lastSuccessfulConnection?.inboxId ||
                    builtInboxId === lastSuccessfulConnection.inboxId);
                if (isLastSuccessfulExactBuild && !matchesLastSuccessfulInstallation) {
                  appendAttemptError(
                    "lastSuccessfulMismatch",
                    `Expected installation ${lastSuccessfulConnection?.installationId ?? "unknown"} but got ${builtInstallationId ?? "unknown"}`
                  );
                }
                const matchesPersistedInstallation = expectedInstallationHints.some(hint => {
                  const installationMatches =
                    Boolean(hint.installationId) &&
                    Boolean(builtInstallationId) &&
                    hint.installationId === builtInstallationId;
                  const inboxMatches =
                    Boolean(hint.inboxId) &&
                    Boolean(builtInboxId) &&
                    hint.inboxId === builtInboxId;
                  if (!installationMatches && !inboxMatches) {
                    return false;
                  }
                  if (hint.inboxId && builtInboxId && hint.inboxId !== builtInboxId) {
                    return false;
                  }
                  if (
                    hint.installationId &&
                    builtInstallationId &&
                    hint.installationId !== builtInstallationId
                  ) {
                    return false;
                  }
                  return true;
                });
                attemptDebug.matchesPersistedInstallation = matchesPersistedInstallation;

                let isRegistered = false;
                try {
                  isRegistered = await withTimeout(
                    builtClient.isRegistered(),
                    10000,
                    "Checking XMTP registration timed out."
                  );
                } catch (registrationCheckError) {
                  attemptDebug.registrationCheckFailed = true;
                  appendAttemptError("isRegistered", registrationCheckError);
                  logError("init:build:registration_check_failed", registrationCheckError, {
                    env,
                    identifier: identifier.identifier,
                    usedDbEncryptionKey: Boolean(optionDbEncryptionKey),
                  });
                }
                attemptDebug.isRegistered = isRegistered;

                logDebug("init:build:result", {
                  env,
                  identifier: identifier.identifier,
                  isRegistered,
                  usedDbEncryptionKey: Boolean(optionDbEncryptionKey),
                  registrationCheckFailed: attemptDebug.registrationCheckFailed,
                });
                const installationInInbox = isRegistered
                  ? true
                  : await verifyBuiltClientInstallation(
                      builtClient,
                      env,
                      {
                        phase: "init:build",
                        env,
                        identifier: identifier.identifier,
                        usedDbEncryptionKey: Boolean(optionDbEncryptionKey),
                        registrationCheckFailed: attemptDebug.registrationCheckFailed,
                      },
                      {
                        onError: installationError =>
                          appendAttemptError("installationMembership", installationError),
                      }
                    );
                attemptDebug.installationInInbox = installationInInbox;

                const canMessageReady = isRegistered || installationInInbox
                  ? true
                  : await verifyBuiltClientReady(
                      builtClient,
                      identifier.identifier,
                      {
                        phase: "init:build",
                        env,
                        identifier: identifier.identifier,
                        usedDbEncryptionKey: Boolean(optionDbEncryptionKey),
                        registrationCheckFailed: attemptDebug.registrationCheckFailed,
                      },
                      {
                        onError: verifyError => appendAttemptError("canMessage", verifyError),
                      }
                    );
                attemptDebug.canMessageReady = canMessageReady;
                let hasConversationAccessForLastSuccessful = false;
                if (isLastSuccessfulExactBuild) {
                  try {
                    const conversations = await withTimeout(
                      builtClient.conversations.list(),
                      6000,
                      "Listing XMTP conversations timed out."
                    );
                    hasConversationAccessForLastSuccessful = Array.isArray(conversations);
                    attemptDebug.conversationAccess = hasConversationAccessForLastSuccessful;
                  } catch (conversationError) {
                    appendAttemptError("conversationList", conversationError);
                    attemptDebug.conversationAccess = false;
                  }
                }
                restoreAttempts.push(attemptDebug);

                const isUsable =
                  matchesLastSuccessfulInstallation ||
                  hasConversationAccessForLastSuccessful ||
                  isRegistered ||
                  installationInInbox ||
                  canMessageReady;
                if (isUsable) {
                  setClient(builtClient);
                  if (stableDbPath) {
                    const persistedBackup = await persistDbBackupFromOpfs(
                      env,
                      identifier.identifier,
                      stableDbPath
                    );
                    logDebug("init:build:db_backup:persisted", {
                      restoreAttemptId,
                      env,
                      identifier: identifier.identifier,
                      dbPath: stableDbPath,
                      persistedBackup,
                    });
                  }
                  persistEnabledState(env, [identifier.identifier], {
                    inboxId: builtInboxId,
                    installationId: builtInstallationId,
                  });
                  persistLastSuccessfulConnection(
                    env,
                    identifier.identifier,
                    builtClient as { inboxId?: string; installationId?: string },
                    optionDbEncryptionKey
                  );
                  restoreResult = "restored";
                  restoreReason = "usable_restore_candidate";
                  const endedAt = new Date().toISOString();
                  persistRestoreDebug({
                    result: "restored",
                    restoreAttemptId,
                    restoreStartedAt: restoreStartedAtIso,
                    restoreEndedAt: endedAt,
                    restoreDurationMs: Date.now() - restoreStartedAtMs,
                    walletReadyState,
                    identity: baseIdentity,
                    envCandidates,
                    identifierCandidates,
                    attempts: restoreAttempts,
                    restoredEnv: env,
                    restoredIdentifier: identifier.identifier,
                  });
                  return builtClient;
                }

                builtClient.close();
              } catch (buildError) {
                appendAttemptError("build", buildError);
                attemptDebug.buildErrorType = classifyBuildError(buildError);
                restoreAttempts.push(attemptDebug);
                if (builtClient) {
                  builtClient.close();
                }
                if (attemptDebug.usedDbEncryptionKey && shouldRotateDbKey(buildError)) {
                  // Rotate only on key mismatch/decryption issues, never for unrelated build errors.
                  removeDbEncryptionKey(env, identifier.identifier);
                  logDebug("init:build:stale_db_key_removed", {
                    env,
                    identifier: identifier.identifier,
                  });
                }
                logError("init:build:option_failed", buildError, {
                  restoreAttemptId,
                  env,
                  identifier: identifier.identifier,
                  usedDbEncryptionKey: attemptDebug.usedDbEncryptionKey,
                  buildErrorType: attemptDebug.buildErrorType,
                  buildErrorMessage: stringifyError(buildError),
                  durationMs: Date.now() - clientBuildStartedAtMs,
                });
                continue;
              }
            }
          } catch (error) {
            logError("init:build:failed", error, {
              env,
              identifier: identifier.identifier,
            });
          }
        }
        if (attempts >= MAX_BUILD_ATTEMPTS) {
          break;
        }
      }

      persistRestoreDebug({
        result: "not_restored",
        restoreAttemptId,
        restoreStartedAt: restoreStartedAtIso,
        restoreEndedAt: new Date().toISOString(),
        restoreDurationMs: Date.now() - restoreStartedAtMs,
        walletReadyState,
        identity: baseIdentity,
        envCandidates,
        identifierCandidates,
        attempts: restoreAttempts,
        reason: "no_usable_restore_candidate",
      });
      return undefined;
    } catch (error) {
      restoreResult = "error";
      restoreReason = "init_exception";
      dispatch(setError(error as Error));
      console.error("Failed to init XMTP client:", error);
      persistRestoreDebug({
        result: "error",
        restoreAttemptId,
        restoreStartedAt: restoreStartedAtIso,
        restoreEndedAt: new Date().toISOString(),
        restoreDurationMs: Date.now() - restoreStartedAtMs,
        walletReadyState,
        identity: baseIdentity,
        envCandidates: [],
        identifierCandidates: [],
        attempts: restoreAttempts,
        error: stringifyError(error),
        reason: "init_exception",
      });
    } finally {
      logDebug("init:restore:end", {
        restoreAttemptId,
        restoreEndedAt: new Date().toISOString(),
        restoreDurationMs: Date.now() - restoreStartedAtMs,
        result: restoreResult,
        reason: restoreReason,
        attemptCount: restoreAttempts.length,
      });
      dispatch(setInitializing(false));
    }
  }, [
    dispatch,
    base64ToBytes,
    bytesToBase64,
    getLastSuccessfulConnection,
    isScwIdentity,
    lensAccountAddress,
    lensHandle,
    lensProfileId,
    persistRestoreDebug,
    buildEnvCandidates,
    classifyBuildError,
    getPreferredRestoreEnv,
    loadDbEncryptionKey,
    buildStableDbPath,
    logDebug,
    logError,
    removeDbEncryptionKey,
    shouldRotateDbKey,
    restoreDbBackupToOpfsIfMissing,
    persistDbBackupFromOpfs,
    stringifyError,
    walletClientAccountAddress,
    persistEnabledState,
    persistLastSuccessfulConnection,
    setClient,
    verifyBuiltClientInstallation,
    verifyBuiltClientReady,
    walletClient,
    walletAddress,
    xmtpAddress,
  ]);

  return {
    client,
    initializing: xmtpState.initializing,
    error: xmtpState.error,
    activeUser: xmtpState.activeUser,
    connectingXMTP,
    connectStage,
    createXMTPClient,
    initXMTPClient,
    hasRestoreDbKeyForWallet,
    wasXMTPEnabled,
  };
}
