import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { useAccount } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useDispatch } from "react-redux";
import { displayLoginModal } from "@/redux/app";

export const Connect = () => {
  const { data: session, loading: sessionLoading } = useSession();
  const dispatch = useDispatch();
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

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
      <button
        type="button"
        className="button-primary mx-auto"
        onClick={() => open()}
      >
        Connect Wallet
      </button>
    );
  }
};
