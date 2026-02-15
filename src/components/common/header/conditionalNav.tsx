"use client";

import React from "react";
import Navbar from "./navbar";
import { useEffect, useState } from "react";
import SecondNav from "./secondNav";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setLensProfile, displayLoginModal, clearLensProfile } from "@/redux/app";
import { fetchAccount } from "@lens-protocol/client/actions";
import { getLensClient } from "@/client";
import getLensAccountData from "@/utils/getLensProfile";

const ConditionalNav = () => {
  const { user: profile } = useSelector((state: any) => state.app);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getAuthenticatedAccount = async () => {
      try {
        const lensClient = await getLensClient();

        if (!mounted) {
          return;
        }

        if (!lensClient.isSessionClient()) {
          dispatch(clearLensProfile());
          return;
        }

        const authenticatedUser = lensClient.getAuthenticatedUser().unwrapOr(null);
        if (!authenticatedUser) {
          dispatch(clearLensProfile());
          return;
        }

        const account = await fetchAccount(lensClient, {
          address: authenticatedUser.address,
        }).unwrapOr(null);

        if (!mounted) return;

        if (account) {
          const accountData = getLensAccountData(account);
          dispatch(setLensProfile({ profile: accountData }));
          dispatch(displayLoginModal({ display: false }));
        } else {
          dispatch(clearLensProfile());
        }
      } catch (error) {
        console.error("Error fetching authenticated account:", error);
        dispatch(clearLensProfile());
      } finally {
        if (mounted) {
          setIsSessionLoading(false);
        }
      }
    };

    void getAuthenticatedAccount();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pathname === "/") {
    return null;
  }

  if (isSessionLoading && !profile) {
    return null;
  }

  return <>{profile ? <SecondNav /> : <Navbar />}</>;
};

export default ConditionalNav;
