"use client";

import { useState, useEffect } from "react";
import { client } from "@/client";
import { currentSession, fetchAccountsAvailable } from "@lens-protocol/client/actions";
import { AuthenticatedSession, SessionClient, evmAddress } from "@lens-protocol/client";
import { signer } from "@/signer";
import { signMessageWith } from "@lens-protocol/client/viem";
import { Hex } from "viem";
import getLensAccountData, { AccountData } from "@/utils/getLensProfile";

export const useSessionManager = () => {
  const [session, setSession] = useState<AuthenticatedSession | null>(null);
  const [sessionClient, setSessionClient] = useState<SessionClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<AccountData | null>(null);

  const initSession = async () => {
    try {
      setLoading(true);
      const resumed = await client.resumeSession();

      if (resumed.isErr()) {
        throw resumed.error;
      }

      const sessionClient = resumed.value;
      const result = await currentSession(sessionClient);

      if (result.isErr()) {
        throw result.error;
      }

      var temp: AccountData[] = [];

      const accountsResult = await fetchAccountsAvailable(client, {
        managedBy: evmAddress(result.value.signer),
        includeOwned: true,
      });

      if (accountsResult.isOk()) {
        const account = accountsResult.value.items[0];

        const accountData = getLensAccountData(account.account);
        if (accountData.handle !== "") {
          setProfile(accountData);
        }
      }

      setSession(result.value);
      setSessionClient(sessionClient);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Session initialization failed"));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const resumed = await client.resumeSession();
      if (resumed.isErr()) {
        throw resumed.error;
      }

      const sessionClient = resumed.value;
      const result = await sessionClient.logout();

      if (result.isErr()) {
        throw result.error;
      }
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Logout failed"));
    }
  };

  const login = async (address: Hex, account: AccountData) => {
    setLoginLoading(true);
    console.log("Address: ", address);
    const authenticated = await client.login({
      accountManager: {
        account: address,
        app: process.env.NEXT_PUBLIC_APP_ADDRESS,
        manager: address,
      },
      signMessage: signMessageWith(signer),
    });

    if (authenticated.isErr()) {
      return { isError: () => true, isSuccess: () => false };
    }

    if (authenticated.isOk()) {
      // SessionClient: { ... }
      const sessionClient = authenticated.value;
      setSessionClient(sessionClient);
      setLoginLoading(false);
      setProfile(account);

      return { isSuccess: () => true, isError: () => false };
    }
    return { isError: () => true, isSuccess: () => false };
  };

  useEffect(() => {
    initSession();
  }, []);

  return {
    session,
    sessionClient,
    profile,
    loading,
    error,
    logout,
    login,
    loginLoading,
  };
};
