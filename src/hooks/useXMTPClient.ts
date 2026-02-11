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
  const walletAddress = params?.walletAddress?.toLowerCase();
  const lensAccountAddress = params?.lensAccountAddress?.toLowerCase();

  const xmtpAddress = lensAccountAddress ?? walletAddress;
  const useScwSigner =
    lensAccountAddress !== undefined &&
    walletAddress !== undefined &&
    lensAccountAddress !== walletAddress;

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
      const buildSigner = (identityAddress: string, signerType: "SCW" | "EOA") => {
        const accountIdentifier: Identifier = {
          identifier: identityAddress,
          identifierKind: IdentifierKind.Ethereum,
        };

        const baseSigner = {
          getIdentifier: () => accountIdentifier,
          signMessage: async (message: string): Promise<Uint8Array> => {
            const signature = await signMessageAsync({
              account: walletAddress as `0x${string}`,
              message,
            });
            return hexToBytes(signature);
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
        const directClient = await withTimeout(Client.create(signer, { env: getEnv() }));
        setClient(directClient);
        return directClient;
      };

      let createdClient: Client | undefined;

      if (useScwSigner && lensAccountAddress) {
        try {
          createdClient = await connectWithSigner(lensAccountAddress, "SCW");
        } catch (scwError) {
          console.warn("SCW XMTP init failed; retrying with wallet EOA identity.", scwError);
          if (!walletAddress) {
            throw scwError;
          }
          createdClient = await connectWithSigner(walletAddress, "EOA");
        }
      } else if (walletAddress) {
        createdClient = await connectWithSigner(walletAddress, "EOA");
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
