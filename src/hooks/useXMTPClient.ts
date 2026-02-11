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
import { hexToBytes, stringToHex } from "viem";
import { useSignMessage, useWalletClient } from "wagmi";
import { setError, setInitializing } from "@/redux/xmtp";
import { RootState } from "@/redux/store";
import { useXMTP } from "@/app/XMTPContext";
import { getEnv } from "@/utils/xmtpHelpers";

type UseXMTPClientParams = {
  walletAddress?: string;
  lensAccountAddress?: string;
};

const LENS_TESTNET_CHAIN_ID = 37111n;
const LENS_MAINNET_CHAIN_ID = 232n;

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

  // Lens v3 accounts are smart wallets. Prefer Lens account identity when available.
  const xmtpAddress = (lensAccountAddress ?? walletAddress)?.toLowerCase();
  const isScwIdentity =
    Boolean(lensAccountAddress) &&
    Boolean(walletAddress) &&
    lensAccountAddress!.toLowerCase() !== walletAddress!.toLowerCase();

  const signWithEthereumProvider = useCallback(
    async (message: string): Promise<string | null> => {
      if (typeof window === "undefined") {
        return null;
      }

      const ethereum = (
        window as Window & { ethereum?: { request?: (args: any) => Promise<any> } }
      ).ethereum;
      if (!ethereum?.request || !walletAddress) {
        return null;
      }

      try {
        const signature = await ethereum.request({
          method: "personal_sign",
          params: [stringToHex(message), walletAddress],
        });
        return typeof signature === "string" ? signature : null;
      } catch {
        return null;
      }
    },
    [walletAddress]
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
    };

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
      const requestWalletSignature = async (message: string): Promise<Uint8Array> => {
        const walletClientSignature = await withTimeout(
          (async () => {
            if (!walletClient?.account) {
              return null;
            }
            try {
              return await walletClient.signMessage({
                account: walletClient.account,
                message,
              });
            } catch {
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
                signMessageAsync({ message }),
                30000,
                "Wallet signature timed out."
              ).catch(async () => null);

        const signature =
          typeof wagmiSignature === "string"
            ? wagmiSignature
            : await withTimeout(
                signWithEthereumProvider(message),
                30000,
                "Wallet signature timed out."
              );
        if (!signature) {
          throw new Error("Wallet signature request failed or was cancelled.");
        }
        return hexToBytes(signature);
      };

      // Do not mix XMTP environments during a single enable attempt.
      const env = getEnv();
      const lensChainId =
        env === "production"
          ? LENS_MAINNET_CHAIN_ID
          : BigInt(process.env.NEXT_PUBLIC_LENS_CHAIN_ID || Number(LENS_TESTNET_CHAIN_ID));

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
        const builtClient = await withTimeout(
          Client.build(primaryIdentifier, { env }),
          8000,
          "Restoring XMTP session timed out."
        );

        updateStage("check_registration");
        const isRegistered = await withTimeout(
          builtClient.isRegistered(),
          10000,
          "Checking XMTP registration timed out."
        );

        if (isRegistered) {
          setClient(builtClient);
          updateStage("connected");
          return builtClient;
        }

        // Build can succeed for an unregistered identity. Fall through to signer-based create.
        builtClient.close();
      } catch (buildError) {
        lastError = buildError;
        console.warn(
          `XMTP build failed for ${primaryIdentifier.identifier} on ${env}.`,
          buildError
        );
      }

      if (fallbackIdentifier) {
        try {
          const builtFallbackClient = await withTimeout(
            Client.build(fallbackIdentifier, { env }),
            8000,
            "Restoring XMTP session timed out."
          );

          updateStage("check_registration");
          const isRegistered = await withTimeout(
            builtFallbackClient.isRegistered(),
            10000,
            "Checking XMTP registration timed out."
          );

          if (isRegistered) {
            setClient(builtFallbackClient);
            updateStage("connected");
            return builtFallbackClient;
          }

          builtFallbackClient.close();
        } catch (fallbackError) {
          lastError = fallbackError;
          console.warn(
            `XMTP build failed for fallback ${fallbackIdentifier.identifier} on ${env}.`,
            fallbackError
          );
        }
      }

      updateStage("build_failed_fallback_create");

      // Preflight signature to ensure wallet prompt path is available before XMTP registration.
      updateStage("prompt_signature");
      await withTimeout(
        requestWalletSignature(`Enable XMTP for w3rk (${xmtpAddress})`),
        45000,
        "Wallet signature timed out."
      );

      const baseSigner = {
        getIdentifier: () =>
          ({
            identifier: xmtpAddress.toLowerCase(),
            identifierKind: IdentifierKind.Ethereum,
          }) as Identifier,
        signMessage: async (message: string): Promise<Uint8Array> => {
          updateStage("prompt_signature");
          return await requestWalletSignature(message);
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

      try {
        updateStage("create_client");
        const directClient = await withTimeout(
          Client.create(signer, {
            env,
            disableAutoRegister: true,
          }),
          120000,
          "Creating XMTP client timed out."
        );

        updateStage("check_registration");
        const isRegistered = await withTimeout(
          directClient.isRegistered(),
          15000,
          "Checking XMTP registration timed out."
        );

        if (!isRegistered) {
          updateStage("register_account");
          await withTimeout(directClient.register(), 90000, "XMTP registration timed out.");
        }

        setClient(directClient);
        updateStage("connected");
        return directClient;
      } catch (createError) {
        lastError = createError;
        console.warn(
          `XMTP create failed for ${xmtpAddress} (${isScwIdentity ? "SCW" : "EOA"}) on ${env}.`,
          createError
        );
      }

      if (lastError instanceof Error && lastError.message) {
        throw new Error(lastError.message);
      }

      throw new Error("Unable to create XMTP client.");
    } catch (error) {
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
