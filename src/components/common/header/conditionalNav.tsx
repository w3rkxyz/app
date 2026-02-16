"use client";

import React from "react";
import Navbar from "./navbar";
import { useEffect, useRef } from "react";
import SecondNav from "./secondNav";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setLensProfile, displayLoginModal, clearLensProfile } from "@/redux/app";
import { fetchAccount } from "@lens-protocol/client/actions";
import { getLensClient } from "@/client";
import getLensAccountData from "@/utils/getLensProfile";
import { useAuthenticatedUser } from "@lens-protocol/react";

const ConditionalNav = () => {
  const { user: profile } = useSelector((state: any) => state.app);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const hydratedProfileForAddressRef = useRef<string | null>(null);
  const { data: authenticatedUser, loading: sessionLoading } = useAuthenticatedUser();

  useEffect(() => {
    let mounted = true;

    if (sessionLoading) {
      return () => {
        mounted = false;
      };
    }

    if (!authenticatedUser) {
      hydratedProfileForAddressRef.current = null;
      dispatch(clearLensProfile());
      return () => {
        mounted = false;
      };
    }

    const authenticatedAddress = authenticatedUser.address.toLowerCase();

    if (hydratedProfileForAddressRef.current === authenticatedAddress) {
      return () => {
        mounted = false;
      };
    }

    const hydrateProfile = async () => {
      try {
        const lensClient = await getLensClient();
        if (!mounted || !lensClient.isSessionClient()) {
          return;
        }

        const account = await fetchAccount(lensClient, {
          address: authenticatedUser.address,
        }).unwrapOr(null);

        if (!mounted) {
          return;
        }

        if (account) {
          hydratedProfileForAddressRef.current = authenticatedAddress;
          const accountData = getLensAccountData(account);
          dispatch(setLensProfile({ profile: accountData }));
          dispatch(displayLoginModal({ display: false }));
        }
      } catch (error) {
        console.error("Error hydrating authenticated account:", error);
      }
    };

    void hydrateProfile();

    return () => {
      mounted = false;
    };
  }, [authenticatedUser, dispatch, sessionLoading]);

  if (pathname === "/") {
    return null;
  }

  if (sessionLoading && !profile) {
    return null;
  }

  return <>{profile || authenticatedUser ? <SecondNav /> : <Navbar />}</>;
};

export default ConditionalNav;
