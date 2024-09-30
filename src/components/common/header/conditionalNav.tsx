"use client";

import React from "react";
import Navbar from "./navbar";
import { useEffect, useState } from "react";
import SecondNav from "./secondNav";
import { usePathname } from "next/navigation";
import { useSession, SessionType } from "@lens-protocol/react-web";
import { useAccount } from "wagmi";
import { useDispatch } from "react-redux";
import { setLensProfile, displayLoginModal } from "@/redux/app";

const ConditionalNav = () => {
  const pathName = usePathname();
  const homePages = ["/"];
  const isHomePage = homePages.includes(pathName);
  const { data: session, loading: sessionLoading } = useSession();
  const { isConnected } = useAccount();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isConnected && !sessionLoading) {
      if (session?.type == SessionType.WithProfile) {
        dispatch(displayLoginModal({ display: false }));
        dispatch(setLensProfile({ profile: session.profile }));
      } else {
        dispatch(displayLoginModal({ display: true }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.type, session?.authenticated, isConnected]);

  return (
    <>
      {isConnected && session?.type === SessionType.WithProfile ? (
        <SecondNav session={session} />
      ) : (
        <Navbar />
      )}
    </>
  );
};

export default ConditionalNav;
