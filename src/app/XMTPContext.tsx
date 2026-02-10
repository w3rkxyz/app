"use client";

import {
  Client,
  type ClientOptions,
  type Signer,
  Dm,
} from "@xmtp/browser-sdk";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { AccountData } from "@/utils/getLensProfile";

export type ContentTypes = unknown;

export type InitializeClientOptions = {
  dbEncryptionKey?: Uint8Array;
  env?: ClientOptions["env"];
  loggingLevel?: ClientOptions["loggingLevel"];
  signer: Signer;
};

export type XMTPContextValue = {
  /**
   * The XMTP client instance
   */
  client?: Client<ContentTypes>;
  activeConversation: Dm<ContentTypes> | undefined;
  /**
   * Set the XMTP client instance
   */
  setClient: React.Dispatch<React.SetStateAction<Client<ContentTypes> | undefined>>;
  setActiveConversation: React.Dispatch<React.SetStateAction<Dm<ContentTypes> | undefined>>;
  initialize: (options: InitializeClientOptions) => Promise<Client<ContentTypes> | undefined>;
  initializing: boolean;
  notOnNetwork: boolean;
  setNotOnNetwork: React.Dispatch<React.SetStateAction<boolean>>;
  invalidUser: AccountData | undefined;
  setInvalidUser: React.Dispatch<React.SetStateAction<AccountData | undefined>>;
  error: Error | null;
  disconnect: () => void;
};

export const XMTPContext = createContext<XMTPContextValue>({
  setClient: () => {},
  activeConversation: undefined,
  setActiveConversation: () => {},
  initialize: () => Promise.reject(new Error("XMTPProvider not available")),
  initializing: false,
  notOnNetwork: false,
  setNotOnNetwork: () => {},
  invalidUser: undefined,
  setInvalidUser: () => {},
  error: null,
  disconnect: () => {},
});

export type XMTPProviderProps = React.PropsWithChildren & {
  /**
   * Initial XMTP client instance
   */
  client?: Client<ContentTypes>;
};

export const XMTPProvider: React.FC<XMTPProviderProps> = ({ children, client: initialClient }) => {
  const [client, setClient] = useState<Client<ContentTypes> | undefined>(initialClient);
  const [activeConversation, setActiveConversation] = useState<Dm<ContentTypes> | undefined>(
    undefined
  );
  const [notOnNetwork, setNotOnNetwork] = useState(false);
  const [invalidUser, setInvalidUser] = useState<AccountData | undefined>(undefined);

  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // client is initializing
  const initializingRef = useRef(false);

  /**
   * Initialize an XMTP client
   */
  const initialize = useCallback(
    async ({ dbEncryptionKey, env, loggingLevel, signer }: InitializeClientOptions) => {
      // only initialize a client if one doesn't already exist
      if (!client) {
        // if the client is already initializing, don't do anything
        if (initializingRef.current) {
          return undefined;
        }

        // flag the client as initializing
        initializingRef.current = true;

        // reset error state
        setError(null);
        // reset initializing state
        setInitializing(true);

        let xmtpClient: Client<ContentTypes>;

        try {
          // create a new XMTP client
          xmtpClient = await Client.create(signer, {
            env,
            loggingLevel,
            dbEncryptionKey,
          });
          setClient(xmtpClient);
        } catch (e) {
          setClient(undefined);
          setError(e as Error);
          // re-throw error for upstream consumption
          throw e;
        } finally {
          initializingRef.current = false;
          setInitializing(false);
        }

        return xmtpClient;
      }
      return client;
    },
    [client]
  );

  const disconnect = useCallback(() => {
    if (client) {
      client.close();
      setClient(undefined);
    }
  }, [client, setClient]);

  // memo-ize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      client,
      activeConversation,
      setActiveConversation,
      setClient,
      initialize,
      notOnNetwork,
      setNotOnNetwork,
      invalidUser,
      setInvalidUser,
      initializing,
      error,
      disconnect,
    }),
    [
      client,
      initialize,
      initializing,
      error,
      disconnect,
      activeConversation,
      notOnNetwork,
      invalidUser,
    ]
  );

  return <XMTPContext.Provider value={value}>{children}</XMTPContext.Provider>;
};

export const useXMTP = () => {
  return useContext(XMTPContext);
};
