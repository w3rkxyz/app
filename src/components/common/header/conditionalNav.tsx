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

  async function getAuthenticatedAccount() {
    const client = await getLensClient();

    if (!client.isSessionClient()) {
      return null;
    }

    const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
    if (!authenticatedUser) {
      return null;
    }

    const account = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(
      null
    );

    if (account) {
      const accountData = getLensAccountData(account);
      dispatch(setLensProfile({ profile: accountData }));
      dispatch(displayLoginModal({ display: false }));
    } else {
      dispatch(displayLoginModal({ display: true }));
    }
  }

  useEffect(() => {
    getAuthenticatedAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{isConnected && profile ? <SecondNav /> : <Navbar />}</>;
};

export default ConditionalNav;
