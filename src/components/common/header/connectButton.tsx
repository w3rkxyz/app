import { ConnectKitButton } from "connectkit";
import React from "react";
import Link from "next/link";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { useAccount } from "wagmi";
import { useDispatch } from "react-redux";
import { displayLoginModal } from "@/redux/app";
import { useModal } from "connectkit";
import { useChainId, useConfig } from "wagmi";

export const Connect = () => {
  const { data: session, loading: sessionLoading } = useSession();
  const dispatch = useDispatch();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const { openSwitchNetworks } = useModal();
  const currentChain = config.chains.find((chain) => chain.id === chainId);
  const isUnsupported = !currentChain;
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
  } else if (isUnsupported) {
    return (
      <button onClick={openSwitchNetworks} className="button-primary mx-auto">
        Wrong Network
      </button>
    );
  } else {
    return (
      <ConnectKitButton.Custom>
        {({ isConnected, show, address, ensName }) => {
          return (
            <button className="button-primary mx-auto" onClick={show}>
              {isConnected ? ensName ?? address : "Sign In"}
            </button>
          );
        }}
      </ConnectKitButton.Custom>
    );
  }
};
