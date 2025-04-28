import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { useDispatch } from "react-redux";
import { displayLoginModal } from "@/redux/app";

export const Connect = () => {
  const { data: session, loading: sessionLoading } = useSession();
  const dispatch = useDispatch();

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, address, ensName, chain }) => {
        if (isConnected && !sessionLoading && session?.type === SessionType.WithProfile) {
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
        } else {
          return (
            <button type="button" className="button-primary mx-auto" onClick={show}>
              Sign In
            </button>
          );
        }
      }}
    </ConnectKitButton.Custom>
  );
};
