"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState } from "react";
import {
  Client,
  IdentifierKind,
  type EOASigner,
  type Identifier,
} from "@xmtp/browser-sdk";
import { hexToBytes, stringToHex } from "viem";
import { useSignMessage } from "wagmi";
import { setError, setInitializing } from "@/redux/xmtp";
import { RootState } from "@/redux/store";
import { useXMTP } from "@/app/XMTPContext";
import { getEnv } from "@/utils/xmtpHelpers";

type UseXMTPClientParams = {
  walletAddress?: string;
  lensAccountAddress?: string;
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

export function useXMTPClient(params?: UseXMTPClientParams) {
  const dispatch = useDispatch();
  const { client, setClient } = useXMTP();
  const xmtpState = useSelector((state: RootState) => state.xmtp);
  const [connectingXMTP, setConnectingXMTP] = useState(false);
  const [connectStage, setConnectStage] = useState<XMTPConnectStage>("idle");
  const { signMessageAsync } = useSignMessage();
  const walletAddress = params?.walletAddress;

  // XMTP identity is wallet-based. Use wallet EOA first for reliable signing UX.
  const xmtpAddress = walletAddress?.toLowerCase();

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
      const createdClient = await withTimeout(
        (async () => {
          updateStage("prompt_signature");
          const requestWalletSignature = async (message: string): Promise<Uint8Array> => {
            const wagmiSignature = await withTimeout(
              signMessageAsync({ message }),
              25000,
              "Wallet signature timed out."
            ).catch(async () => null);
            const signature =
              typeof wagmiSignature === "string"
                ? wagmiSignature
                : await withTimeout(
                    signWithEthereumProvider(message),
                    25000,
                    "Wallet signature timed out."
                  );
            if (!signature) {
              throw new Error("Wallet signature request failed or was cancelled.");
            }
            return hexToBytes(signature);
          };

          // Preflight signature to guarantee wallet prompt appears before XMTP initialization.
          await requestWalletSignature(
            `Enable XMTP on w3rk\nWallet: ${walletAddress}\nTime: ${new Date().toISOString()}`
          );

          updateStage("restore_session");
          // Fast path for existing XMTP identity.
          const identifier: Identifier = {
            identifier: xmtpAddress,
            identifierKind: IdentifierKind.Ethereum,
          };
          try {
            const builtClient = await withTimeout(
              Client.build(identifier, { env: getEnv() }),
              15000,
              "Restoring XMTP session timed out."
            );
            setClient(builtClient);
            updateStage("connected");
            return builtClient;
          } catch (buildError) {
            console.warn("XMTP build failed, falling back to create flow.", buildError);
            updateStage("build_failed_fallback_create");
          }

          updateStage("create_client");
          const signer: EOASigner = {
            type: "EOA",
            getIdentifier: () => ({
              identifier: xmtpAddress,
              identifierKind: IdentifierKind.Ethereum,
            }),
            signMessage: async (message: string): Promise<Uint8Array> => {
              updateStage("prompt_signature");
              return await requestWalletSignature(message);
            },
          };

          const directClient = await withTimeout(
            Client.create(signer, { env: getEnv(), disableAutoRegister: true }),
            30000,
            "Creating XMTP client timed out."
          );

          updateStage("check_registration");
          const isRegistered = await withTimeout(
            directClient.isRegistered(),
            10000,
            "Checking XMTP registration timed out."
          );
          if (!isRegistered) {
            updateStage("register_account");
            await withTimeout(directClient.register(), 25000, "XMTP registration timed out.");
          }

          setClient(directClient);
          updateStage("connected");
          return directClient;
        })(),
        70000
      );

      return createdClient;
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
    signWithEthereumProvider,
    walletAddress,
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
