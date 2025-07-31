// hooks/useXMTPClient.ts

import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState, useRef } from "react";
import { Client, type ClientOptions, type Signer, type Identifier } from "@xmtp/browser-sdk";
import { hexToBytes } from "viem";
import { useSignMessage } from "wagmi";
import { setError, setInitializing } from "@/redux/xmtp";
import { getLensClient } from "@/client";
import { RootState } from "@/redux/store";
import { useXMTP } from "@/app/XMTPContext";

export function useXMTPClient(address?: string) {
  const dispatch = useDispatch();
  const { client, initialize } = useXMTP();
  const xmtpState = useSelector((state: RootState) => state.xmtp);
  const [connectingXMTP, setConnectingXMTP] = useState(false);
  const { signMessageAsync } = useSignMessage();

  /**
   * Create and connect to an XMTP client using a signer
   */
  const createXMTPClient = useCallback(async () => {
    if (!address) return;
    setConnectingXMTP(true);
    dispatch(setInitializing(true));
    dispatch(setError(null));

    try {
      const sessionClient = await getLensClient();

      const accountIdentifier: Identifier = {
        identifier: address,
        identifierKind: "Ethereum",
      };

      const signer: Signer = {
        type: "EOA",
        getIdentifier: () => accountIdentifier,
        signMessage: async (message: string): Promise<Uint8Array> => {
          const signature = await signMessageAsync({ message });
          return hexToBytes(signature);
        },
      };

      const client = await initialize({ signer, env: "production" });
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
  }, [address, dispatch, signMessageAsync, initialize]);

  /**
   * Reconnect/initiate an existing XMTP client using `Client.build`
   */
  const initXMTPClient = useCallback(async () => {
    if (!address) return;

    dispatch(setInitializing(true));
    dispatch(setError(null));

    try {
      const sessionClient = await getLensClient();

      const identifier: Identifier = {
        identifier: address,
        identifierKind: "Ethereum",
      };

      const client = await Client.build(identifier, { env: "production" });

      return client;
    } catch (error) {
      dispatch(setError(error as Error));
      console.error("Failed to init XMTP client:", error);
    } finally {
      dispatch(setInitializing(false));
    }
  }, [address, dispatch]);

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
