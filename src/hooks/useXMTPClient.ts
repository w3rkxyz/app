"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState } from "react";
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
const XMTP_API_URLS = {
  local: "http://localhost:5557",
  dev: "https://api.dev.xmtp.network:5558",
  production: "https://api.production.xmtp.network:5558",
} as const;
const XMTP_ENABLED_IDENTIFIERS_KEY = "w3rk:xmtp:enabled-identifiers";
const XMTP_LAST_ENV_KEY = "w3rk:xmtp:last-env";
const XMTP_ENABLED_SESSION_MAP_KEY = "w3rk:xmtp:enabled-session-map";
const XMTP_DB_KEY_STORAGE_PREFIX = "w3rk:xmtp:db-key";

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
};

type XMTPSessionMap = Record<string, XMTPSessionState>;

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

  const buildDbKeyStorageKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string) =>
      `${XMTP_DB_KEY_STORAGE_PREFIX}:${env}:${identifier.toLowerCase()}`,
    []
  );

  const loadDbEncryptionKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string): Uint8Array | undefined => {
      if (typeof window === "undefined") {
        return undefined;
      }

      const storageKey = buildDbKeyStorageKey(env, identifier);
      const raw = window.localStorage.getItem(storageKey);
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
    [base64ToBytes, buildDbKeyStorageKey]
  );

  const storeDbEncryptionKey = useCallback(
    (env: "local" | "dev" | "production", identifier: string, key: Uint8Array) => {
      if (typeof window === "undefined") {
        return;
      }

      const storageKey = buildDbKeyStorageKey(env, identifier);
      window.localStorage.setItem(storageKey, bytesToBase64(key));
    },
    [buildDbKeyStorageKey, bytesToBase64]
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
        const maybeState = value as { identifiers?: unknown; env?: unknown };
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

        if (identifiers.length > 0 || env) {
          acc[key] = { identifiers, env };
        }
        return acc;
      }, {});

      return normalized;
    } catch {
      return {};
    }
  }, []);

  const getPersistedSessionState = useCallback(() => {
    const sessionMap = getPersistedSessionMap();
    const sessionKeys = getActiveSessionKeys();
    if (sessionKeys.length === 0) {
      return { identifiers: [] as string[], env: undefined as XMTPSessionState["env"] };
    }

    const identifiers = Array.from(
      new Set(
        sessionKeys.flatMap(key => sessionMap[key]?.identifiers ?? [])
      )
    );
    const env = sessionKeys.map(key => sessionMap[key]?.env).find(Boolean);
    return { identifiers, env };
  }, [getActiveSessionKeys, getPersistedSessionMap]);

  const getPersistedIdentifiers = useCallback(() => {
    if (typeof window === "undefined") {
      return [] as string[];
    }

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
        .filter(value => value.startsWith("0x") && value.length === 42);
    } catch {
      return [] as string[];
    }
  }, []);

  const persistEnabledState = useCallback(
    (env: "local" | "dev" | "production", identifiers: string[] = []) => {
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
      const persisted = getPersistedIdentifiers();
      const merged = Array.from(
        new Set(
          [...persisted, ...currentSessionIdentifiers]
        )
      );

      window.localStorage.setItem(XMTP_ENABLED_IDENTIFIERS_KEY, JSON.stringify(merged));
      window.localStorage.setItem(XMTP_LAST_ENV_KEY, env);

      const sessionKeys = getActiveSessionKeys();
      if (sessionKeys.length > 0) {
        const currentSessionMap = getPersistedSessionMap();
        for (const key of sessionKeys) {
          const existing = currentSessionMap[key]?.identifiers ?? [];
          currentSessionMap[key] = {
            identifiers: Array.from(new Set([...existing, ...currentSessionIdentifiers])),
            env,
          };
        }
        window.localStorage.setItem(XMTP_ENABLED_SESSION_MAP_KEY, JSON.stringify(currentSessionMap));
      }
    },
    [
      getActiveSessionKeys,
      getPersistedIdentifiers,
      getPersistedSessionMap,
      walletAddress,
      walletClientAccountAddress,
      xmtpAddress,
    ]
  );

  const wasXMTPEnabled = useCallback(() => {
    const activeCandidates = [xmtpAddress, walletAddress, walletClientAccountAddress]
      .filter((value): value is string => Boolean(value))
      .map(value => value.toLowerCase());

    const sessionState = getPersistedSessionState();
    const persisted = getPersistedIdentifiers();
    const hasAddressMatch =
      activeCandidates.length > 0 && activeCandidates.some(candidate => persisted.includes(candidate));
    const hasSessionMatch = sessionState.identifiers.length > 0;

    return hasAddressMatch || hasSessionMatch;
  }, [
    getPersistedIdentifiers,
    getPersistedSessionState,
    walletAddress,
    walletClientAccountAddress,
    xmtpAddress,
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
        return hexToBytes(signature);
      };

      // Do not mix XMTP environments during a single enable attempt.
      // If XMTP env is not explicitly configured, infer it from active Lens chain.
      const configuredEnvRaw =
        process.env.NEXT_PUBLIC_XMTP_ENV ?? process.env.NEXT_PUBLIC_XMTP_ENVIRONMENT;
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
      const env: "local" | "dev" | "production" =
        configuredEnvRaw === "local" ||
        configuredEnvRaw === "dev" ||
        configuredEnvRaw === "production"
          ? configuredEnvRaw
          : lensChainId === LENS_MAINNET_CHAIN_ID
            ? "production"
            : "dev";
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
        const builtClient = await withTimeout(
          Client.build(primaryIdentifier, {
            env,
            ...(primaryDbEncryptionKey ? { dbEncryptionKey: primaryDbEncryptionKey } : {}),
          }),
          8000,
          "Restoring XMTP session timed out."
        );
        logDebug("build:primary:success");

        updateStage("check_registration");
        logDebug("build:primary:isRegistered:start");
        const isRegistered = await withTimeout(
          builtClient.isRegistered(),
          10000,
          "Checking XMTP registration timed out."
        );
        logDebug("build:primary:isRegistered:result", { isRegistered });

        if (isRegistered) {
          logDebug("build:primary:registered:reuse_client");
          setClient(builtClient);
          persistEnabledState(env, [primaryIdentifier.identifier]);
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
          const builtFallbackClient = await withTimeout(
            Client.build(fallbackIdentifier, {
              env,
              ...(fallbackDbEncryptionKey ? { dbEncryptionKey: fallbackDbEncryptionKey } : {}),
            }),
            8000,
            "Restoring XMTP session timed out."
          );
          logDebug("build:fallback:success");

          updateStage("check_registration");
          logDebug("build:fallback:isRegistered:start");
          const isRegistered = await withTimeout(
            builtFallbackClient.isRegistered(),
            10000,
            "Checking XMTP registration timed out."
          );
          logDebug("build:fallback:isRegistered:result", { isRegistered });

          if (isRegistered) {
            logDebug("build:fallback:registered:reuse_client");
            setClient(builtFallbackClient);
            persistEnabledState(env, [fallbackIdentifier.identifier]);
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
      const isInstallationLimitError = (error: unknown) => {
        if (!(error instanceof Error)) {
          return false;
        }
        const message = error.message?.toLowerCase() ?? "";
        return (
          message.includes("cannot register a new installation") &&
          message.includes("installations")
        );
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

      const connectAndRegister = async (
        activeSigner: EOASigner | SCWSigner,
        mode: "primary" | "eoa_fallback"
      ) => {
        const signerIdentifier = await activeSigner.getIdentifier();
        const dbEncryptionKey = getOrCreateDbEncryptionKey(env, signerIdentifier.identifier);

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

        setClient(directClient);
        persistEnabledState(env, [xmtpAddress ?? ""]);
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
            setClient(recoveredClient);
            persistEnabledState(env, [xmtpAddress ?? ""]);
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
            setClient(fallbackClient);
            persistEnabledState(env, [walletAddress ?? ""]);
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
                setClient(recoveredClient);
                persistEnabledState(env, [walletAddress ?? ""]);
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
    getOrCreateDbEncryptionKey,
    storeDbEncryptionKey,
    persistEnabledState,
    expectedSigningAddress,
    actualWalletClientAddress,
    signingAddress,
  ]);

  /**
   * Reconnect/initiate an existing XMTP client using `Client.build`
   */
  const initXMTPClient = useCallback(async () => {
    const sessionState = getPersistedSessionState();
    const restoreAddressCandidates = [xmtpAddress, walletAddress, walletClientAccountAddress]
      .filter((value): value is string => Boolean(value))
      .map(value => value.toLowerCase())
      .filter(value => value.startsWith("0x") && value.length === 42);
    if (restoreAddressCandidates.length === 0 && sessionState.identifiers.length === 0) {
      return;
    }

    dispatch(setInitializing(true));
    dispatch(setError(null));

    try {
      const configuredEnvRaw =
        process.env.NEXT_PUBLIC_XMTP_ENV ?? process.env.NEXT_PUBLIC_XMTP_ENVIRONMENT;
      const fallbackEnv = getEnv();
      const persistedEnvRaw =
        typeof window !== "undefined" ? window.localStorage.getItem(XMTP_LAST_ENV_KEY) : null;
      const persistedEnv =
        persistedEnvRaw === "local" || persistedEnvRaw === "dev" || persistedEnvRaw === "production"
          ? persistedEnvRaw
          : null;
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
      const configuredEnv =
        configuredEnvRaw === "local" ||
        configuredEnvRaw === "dev" ||
        configuredEnvRaw === "production"
          ? configuredEnvRaw
          : null;
      const inferredEnv: "dev" | "production" =
        lensChainId === LENS_MAINNET_CHAIN_ID ? "production" : "dev";
      const envCandidates = Array.from(
        new Set(
          [configuredEnv, sessionState.env, persistedEnv, inferredEnv, fallbackEnv].filter(
            (value): value is "local" | "dev" | "production" => Boolean(value)
          )
        )
      );

      const identifierCandidates = Array.from(
        new Set([
          ...restoreAddressCandidates,
          ...sessionState.identifiers,
          ...getPersistedIdentifiers(),
        ])
      )
        .filter(value => value.startsWith("0x") && value.length === 42)
        .slice(0, 4);

      const identifiers: Identifier[] = identifierCandidates.map(identifier => ({
        identifier,
        identifierKind: IdentifierKind.Ethereum,
      }));

      const MAX_BUILD_ATTEMPTS = 6;
      let attempts = 0;

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
            const builtClient = await withTimeout(
              Client.build(identifier, {
                env,
                ...(dbEncryptionKey ? { dbEncryptionKey } : {}),
              }),
              10000,
              "Restoring XMTP session timed out."
            );
            const isRegistered = await withTimeout(
              builtClient.isRegistered(),
              10000,
              "Checking XMTP registration timed out."
            );

            logDebug("init:build:result", {
              env,
              identifier: identifier.identifier,
              isRegistered,
            });

            if (isRegistered) {
              setClient(builtClient);
              persistEnabledState(env, [identifier.identifier]);
              return builtClient;
            }

            builtClient.close();
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

      return undefined;
    } catch (error) {
      dispatch(setError(error as Error));
      console.error("Failed to init XMTP client:", error);
    } finally {
      dispatch(setInitializing(false));
    }
  }, [
    dispatch,
    getPersistedIdentifiers,
    getPersistedSessionState,
    loadDbEncryptionKey,
    logDebug,
    logError,
    walletClientAccountAddress,
    persistEnabledState,
    setClient,
    walletAddress,
    walletClient,
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
    wasXMTPEnabled,
  };
}
