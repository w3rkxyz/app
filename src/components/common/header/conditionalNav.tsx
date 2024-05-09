"use client";

import React from "react";
import Navbar from "./navbar";
import SecondNav from "./secondNav";
import { usePathname } from "next/navigation";
import { useSession, SessionType } from "@lens-protocol/react-web";

const ConditionalNav = () => {
  const pathName = usePathname();
  const homePages = ["/", "/find-work"];
  const isHomePage = homePages.includes(pathName);
  const { data: session, loading: sessionLoading } = useSession();

  return (
    <>
      {isHomePage ? (
        <Navbar />
      ) : (
        <SecondNav
          profile={
            session?.type === SessionType.WithProfile ? session.profile : null
          }
        />
      )}
    </>
  );
};

export default ConditionalNav;
