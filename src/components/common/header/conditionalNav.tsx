"use client";

import React from "react";
import Navbar from "./navbar";
import { useEffect, useState } from "react";
import SecondNav from "./secondNav";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useDispatch, useSelector } from "react-redux";
import { setLensProfile, displayLoginModal } from "@/redux/app";
import { evmAddress } from "@lens-protocol/client";
import { fetchAccount, fetchAccounts } from "@lens-protocol/client/actions";
import { client } from "@/client";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { getLensClient } from "@/client";
import getLensAccountData from "@/utils/getLensProfile";

const ConditionalNav = () => {
  const { user: profile } = useSelector((state: any) => state.app);
  const { isConnected } = useAccount();
  const dispatch = useDispatch();

  useEffect(() => {
    // Don't block navigation - check auth asynchronously
    let mounted = true;
    
    async function getAuthenticatedAccount() {
      try {
        const client = await getLensClient();

        if (!mounted || !client.isSessionClient()) {
          return;
        }

        const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
        if (!mounted || !authenticatedUser) {
          return;
        }

        const account = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(
          null
        );

        if (!mounted) return;

        if (account) {
          const accountData = getLensAccountData(account);
          dispatch(setLensProfile({ profile: accountData }));
          dispatch(displayLoginModal({ display: false }));
        } else {
          dispatch(displayLoginModal({ display: true }));
        }
      } catch (error) {
        console.error("Error fetching authenticated account:", error);
        // Don't show login modal on error - let user navigate freely
      }
    }

    // Use requestIdleCallback or setTimeout to defer non-critical work
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        getAuthenticatedAccount();
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        getAuthenticatedAccount();
      }, 0);
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{isConnected && profile ? <SecondNav /> : <Navbar />}</>;
};

export default ConditionalNav;
