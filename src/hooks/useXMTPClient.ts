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
import { useChainId, useSignMessage } from "wagmi";
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
  const { client, initialize } = useXMTP();
  const xmtpState = useSelector((state: RootState) => state.xmtp);
  const [connectingXMTP, setConnectingXMTP] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const chainId = useChainId();
  const walletAddress = params?.walletAddress;
  const lensAccountAddress = params?.lensAccountAddress;

  const xmtpAddress = lensAccountAddress ?? walletAddress;
  const useScwSigner =
    lensAccountAddress !== undefined &&
    walletAddress !== undefined &&
    lensAccountAddress.toLowerCase() !== walletAddress.toLowerCase();

  /**
   * Create and connect to an XMTP client using a signer
   */
  const createXMTPClient = useCallback(async () => {
    if (!xmtpAddress) return;
    setConnectingXMTP(true);
    dispatch(setInitializing(true));
    dispatch(setError(null));

    try {
      const accountIdentifier: Identifier = {
        identifier: xmtpAddress.toLowerCase(),
        identifierKind: IdentifierKind.Ethereum,
      };

      const baseSigner = {
        getIdentifier: () => accountIdentifier,
        signMessage: async (message: string): Promise<Uint8Array> => {
          const signature = await signMessageAsync({ message });
          return hexToBytes(signature);
        },
      };

      const signer: EOASigner | SCWSigner = useScwSigner
        ? {
            type: "SCW",
            ...baseSigner,
            getChainId: () => BigInt(chainId ?? Number(LENS_TESTNET_CHAIN_ID)),
          }
        : {
            type: "EOA",
            ...baseSigner,
          };

      const client = await initialize({ signer, env: getEnv() });
      if (client) {
        return client;
      } else {
        console.log("Client not defined");
      }
    } catch (error) {
      dispatch(setError(error as Error));
      console.error("Failed to create XMTP client:", error);
    } finally {
      dispatch(setInitializing(false));
      setConnectingXMTP(false);
    }
  }, [chainId, dispatch, initialize, signMessageAsync, useScwSigner, xmtpAddress]);

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
