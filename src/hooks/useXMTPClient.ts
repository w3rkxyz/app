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
import { useSignMessage } from "wagmi";
import { setError, setInitializing } from "@/redux/xmtp";
import { RootState } from "@/redux/store";
import { useXMTP } from "@/app/XMTPContext";
import { getEnv } from "@/utils/xmtpHelpers";

type UseXMTPClientParams = {
  walletAddress?: string;
  lensAccountAddress?: string;
};

const LENS_TESTNET_CHAIN_ID = 37111n;

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
  const lensAccountAddress = params?.lensAccountAddress;

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

          const envCandidates: Array<"dev" | "production" | "local"> = [];
          const primaryEnv = getEnv();
          envCandidates.push(primaryEnv);
          if (primaryEnv !== "production") {
            envCandidates.push("production");
          }
          if (primaryEnv !== "dev") {
            envCandidates.push("dev");
          }

          const identityCandidates = [
            walletAddress?.toLowerCase(),
            lensAccountAddress?.toLowerCase(),
          ].filter((value, idx, arr): value is string => !!value && arr.indexOf(value) === idx);

          updateStage("restore_session");
          for (const env of envCandidates) {
            for (const identity of identityCandidates) {
              const identifier: Identifier = {
                identifier: identity,
                identifierKind: IdentifierKind.Ethereum,
              };
              try {
                const builtClient = await withTimeout(
                  Client.build(identifier, { env }),
                  10000,
                  "Restoring XMTP session timed out."
                );
                setClient(builtClient);
                updateStage("connected");
                return builtClient;
              } catch (buildError) {
                console.warn(`XMTP build failed for ${identity} on ${env}.`, buildError);
              }
            }
          }

          updateStage("build_failed_fallback_create");

          const signerCandidates: Array<{ type: "EOA" | "SCW"; identity: string }> = [
            { type: "EOA", identity: walletAddress.toLowerCase() },
          ];
          if (
            lensAccountAddress &&
            lensAccountAddress.toLowerCase() !== walletAddress.toLowerCase()
          ) {
            signerCandidates.push({ type: "SCW", identity: lensAccountAddress.toLowerCase() });
          }

          for (const env of envCandidates) {
            for (const candidate of signerCandidates) {
              updateStage("create_client");
              const baseSigner = {
                getIdentifier: () =>
                  ({
                    identifier: candidate.identity,
                    identifierKind: IdentifierKind.Ethereum,
                  }) as Identifier,
                signMessage: async (message: string): Promise<Uint8Array> => {
                  updateStage("prompt_signature");
                  return await requestWalletSignature(message);
                },
              };

              const signer: EOASigner | SCWSigner =
                candidate.type === "SCW"
                  ? {
                      type: "SCW",
                      ...baseSigner,
                      getChainId: () => LENS_TESTNET_CHAIN_ID,
                    }
                  : {
                      type: "EOA",
                      ...baseSigner,
                    };

              try {
                const directClient = await withTimeout(
                  Client.create(signer, { env, disableAutoRegister: true }),
                  15000,
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
                  await withTimeout(directClient.register(), 20000, "XMTP registration timed out.");
                }

                setClient(directClient);
                updateStage("connected");
                return directClient;
              } catch (createError) {
                console.warn(
                  `XMTP create failed for ${candidate.identity} (${candidate.type}) on ${env}.`,
                  createError
                );
              }
            }
          }

          throw new Error("Creating XMTP client timed out.");
        })(),
        90000
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
    lensAccountAddress,
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
