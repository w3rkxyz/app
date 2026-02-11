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
import { hexToBytes } from "viem";
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
      const requestWalletSignature = async (message: string): Promise<Uint8Array> => {
        const signature = await withTimeout(signMessageAsync({ message }), 25000);
        return hexToBytes(signature);
      };

      // Preflight signature to guarantee wallet prompt appears before XMTP initialization.
      await requestWalletSignature(
        `Enable XMTP on w3rk\nWallet: ${walletAddress}\nTime: ${new Date().toISOString()}`
      );

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
        const directClient = await withTimeout(Client.create(signer, { env: getEnv() }), 30000);
        setClient(directClient);
        return directClient;
      };

      let createdClient: Client | undefined;

      if (walletAddress) {
        try {
          createdClient = await connectWithSigner(walletAddress, "EOA");
        } catch (eoaError) {
          console.warn("EOA XMTP init failed.", eoaError);
          if (useScwSigner && lensAccountAddress) {
            console.warn("Retrying XMTP init with Lens SCW identity.");
            createdClient = await connectWithSigner(lensAccountAddress, "SCW");
          } else {
            throw eoaError;
          }
        }
      }

      if (createdClient) {
        return createdClient;
      }

      throw new Error("XMTP client was not created.");
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
