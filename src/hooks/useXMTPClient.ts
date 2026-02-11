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

const LENS_TESTNET_CHAIN_ID = 37111n;

type UseXMTPClientParams = {
  walletAddress?: string;
  lensAccountAddress?: string;
};

export function useXMTPClient(params?: UseXMTPClientParams) {
  const dispatch = useDispatch();
  const { client, setClient } = useXMTP();
  const xmtpState = useSelector((state: RootState) => state.xmtp);
  const [connectingXMTP, setConnectingXMTP] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const walletAddress = params?.walletAddress;
  const lensAccountAddress = params?.lensAccountAddress;

  // XMTP identity is wallet-based. Use wallet EOA first for reliable signing UX.
  const xmtpAddress = walletAddress?.toLowerCase();
  const useScwSigner =
    lensAccountAddress !== undefined &&
    walletAddress !== undefined &&
    lensAccountAddress.toLowerCase() !== walletAddress.toLowerCase();

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

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 45000): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("XMTP connection timed out. Please retry."));
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
  const createXMTPClient = useCallback(async () => {
    if (client) {
      return client;
    }

    if (!xmtpAddress) {
      throw new Error("Missing XMTP identity address.");
    }

    if (!walletAddress) {
      throw new Error("Wallet is not connected. Reconnect your wallet and try again.");
    }

    setConnectingXMTP(true);
    dispatch(setInitializing(true));
    dispatch(setError(null));

    try {
      const createdClient = await withTimeout(
        (async () => {
          const requestWalletSignature = async (message: string): Promise<Uint8Array> => {
            const wagmiSignature = await withTimeout(signMessageAsync({ message }), 25000).catch(
              async () => null
            );
            const signature =
              typeof wagmiSignature === "string"
                ? wagmiSignature
                : await withTimeout(signWithEthereumProvider(message), 25000);
            if (!signature) {
              throw new Error("Wallet signature request failed or was cancelled.");
            }
            return hexToBytes(signature);
          };

          // Preflight signature to guarantee wallet prompt appears before XMTP initialization.
          await requestWalletSignature(
            `Enable XMTP on w3rk\nWallet: ${walletAddress}\nTime: ${new Date().toISOString()}`
          );

          // Fast-path for existing XMTP users: rebuild from identifier without extra registration flow.
          try {
            const builtClient = await withTimeout(
              Client.build(
                {
                  identifier: xmtpAddress,
                  identifierKind: IdentifierKind.Ethereum,
                },
                { env: getEnv() }
              ),
              15000
            );
            setClient(builtClient);
            return builtClient;
          } catch (buildError) {
            console.warn("XMTP build failed, falling back to create flow.", buildError);
          }

          const buildSigner = (identityAddress: string, signerType: "SCW" | "EOA") => {
            const accountIdentifier: Identifier = {
              identifier: identityAddress.toLowerCase(),
              identifierKind: IdentifierKind.Ethereum,
            };

            const baseSigner = {
              getIdentifier: () => accountIdentifier,
              signMessage: async (message: string): Promise<Uint8Array> => {
                return await requestWalletSignature(message);
              },
            };

            if (signerType === "SCW") {
              const scwSigner: SCWSigner = {
                type: "SCW",
                ...baseSigner,
                // Lens account verification must resolve on Lens Testnet even if wallet is currently on another chain.
                getChainId: () => LENS_TESTNET_CHAIN_ID,
              };
              return scwSigner;
            }

            const eoaSigner: EOASigner = {
              type: "EOA",
              ...baseSigner,
            };
            return eoaSigner;
          };

          const connectWithSigner = async (identityAddress: string, signerType: "SCW" | "EOA") => {
            const signer = buildSigner(identityAddress, signerType);
            const directClient = await withTimeout(
              Client.create(signer, { env: getEnv(), disableAutoRegister: true }),
              30000
            );
            const isRegistered = await withTimeout(directClient.isRegistered(), 10000);
            if (!isRegistered) {
              await withTimeout(directClient.register(), 25000);
            }
            setClient(directClient);
            return directClient;
          };

          if (walletAddress) {
            try {
              return await connectWithSigner(walletAddress, "EOA");
            } catch (eoaError) {
              console.warn("EOA XMTP init failed.", eoaError);
              if (useScwSigner && lensAccountAddress) {
                console.warn("Retrying XMTP init with Lens SCW identity.");
                return await connectWithSigner(lensAccountAddress, "SCW");
              }
              throw eoaError;
            }
          }

          throw new Error("XMTP client was not created.");
        })(),
        65000
      );

      return createdClient;
    } catch (error) {
      dispatch(setError(error as Error));
      setClient(undefined);
      throw error;
    } finally {
      dispatch(setInitializing(false));
      setConnectingXMTP(false);
    }
  }, [
    client,
    dispatch,
    lensAccountAddress,
    setClient,
    signMessageAsync,
    signWithEthereumProvider,
    useScwSigner,
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
    createXMTPClient,
    initXMTPClient,
  };
}
