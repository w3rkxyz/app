import { ConnectKitButton } from "connectkit";
import React from "react";
import Link from "next/link";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { useAccount } from "wagmi";
import { useDispatch } from "react-redux";
import { displayLoginModal } from "@/redux/app";

export const Connect = () => {
  const { data: session, loading: sessionLoading } = useSession();
  const dispatch = useDispatch();
  const { isConnected } = useAccount();

  if (
    isConnected &&
    !sessionLoading &&
    session?.type === SessionType.WithProfile
  ) {
    return (
      <Link href={`/u/${session.profile.handle?.localName}`}>
        <button type="button" className="button-primary mx-auto">
          Get Started
        </button>
      </Link>
    );
  } else if (isConnected) {
    return (
      <button
        type="button"
        className="button-primary mx-auto"
        onClick={() => dispatch(displayLoginModal({ display: true }))}
      >
        Login
      </button>
    );
  }
  // else if (chain?.unsupported) {
  //   return (
  //     <button
  //       onClick={openChainModal}
  //       type="button"
  //       className="button-primary ml-auto"
  //     >
  //       Wrong network
  //     </button>
  //   );
  // }
  else {
    return (
      <div className="flex justify-center items-center w-full">
        <ConnectKitButton />
      </div>
    );
  }
};
