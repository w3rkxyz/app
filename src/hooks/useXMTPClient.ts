"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState } from "react";
import {
  Client,
  IdentifierKind,
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
  const expectedSigningAddress = walletAddress?.toLowerCase() ?? null;
  const actualWalletClientAddress = walletClientAccountAddress ?? null;
  const signingAddress = (walletAddress ?? walletClient?.account?.address ?? null) as
    | Address
    | null;

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
        source: "preflight" | "xmtp_signer" = "xmtp_signer"
      ): Promise<Uint8Array> => {
        const messageHash = keccak256(stringToHex(message));
        logDebug("signature:request:start", {
          source,
          message,
          messageHash,
          messagePreview: message.slice(0, 200),
          expectedSignerAddress: expectedSigningAddress,
          actualWalletClientAddress,
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
                account: signingAddress ?? walletClient.account,
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
                  return signWithEthereumProvider(message, signingAddress);
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
        expectedSignerAddress,
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
        const builtClient = await withTimeout(
          Client.build(primaryIdentifier, { env }),
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
          const builtFallbackClient = await withTimeout(
            Client.build(fallbackIdentifier, { env }),
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

      try {
        updateStage("create_client");
        logDebug("create:start", { env, disableAutoRegister: true });
        const directClient = await withTimeout(
          Client.create(signer, {
            env,
            disableAutoRegister: true,
          }),
          120000,
          "Creating XMTP client timed out."
        );
        logDebug("create:success", { inboxId: (directClient as { inboxId?: string }).inboxId ?? null });

        updateStage("check_registration");
        logDebug("create:isRegistered:start");
        failedMethod = "client.isRegistered";
        const isRegistered = await withTimeout(
          directClient.isRegistered(),
          15000,
          "Checking XMTP registration timed out."
        );
        logDebug("create:isRegistered:result", { isRegistered });

        if (!isRegistered) {
          updateStage("register_account");
          failedMethod = "client.register";
          logDebug("create:register:start", {
            registerValidationChainId: lensChainId.toString(),
            registerValidationRpc: lensRpcFromWallet ?? lensPublicRpcFromWallet,
            xmtpEnv: env,
            expectedSignerAddress,
            actualWalletClientAddress,
            xmtpIdentifierAddress: xmtpAddress,
          });
          await withTimeout(directClient.register(), 90000, "XMTP registration timed out.");
          logDebug("create:register:success");
        }

        setClient(directClient);
        updateStage("connected");
        logDebug("create:connected");
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
      }

      if (lastError instanceof Error) {
        logError("create:final_error", lastError);
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
    expectedSigningAddress,
    actualWalletClientAddress,
    signingAddress,
  ]);

  /**
   * Reconnect/initiate an existing XMTP client using `Client.build`
   */
  const initXMTPClient = useCallback(async () => {
    if (!xmtpAddress) return;

    dispatch(setInitializing(true));
    dispatch(setError(null));

    try {
      const identifier: Identifier = {
        identifier: xmtpAddress.toLowerCase(),
        identifierKind: IdentifierKind.Ethereum,
      };

      const client = await Client.build(identifier, { env: getEnv() });

      return client;
    } catch (error) {
      dispatch(setError(error as Error));
      console.error("Failed to init XMTP client:", error);
    } finally {
      dispatch(setInitializing(false));
    }
  }, [dispatch, xmtpAddress]);

  return {
    client,
    initializing: xmtpState.initializing,
    error: xmtpState.error,
    activeUser: xmtpState.activeUser,
    connectingXMTP,
    connectStage,
    createXMTPClient,
    initXMTPClient,
  };
}
