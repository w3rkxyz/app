import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { displayLoginModal } from "@/redux/app";
import { useAuthenticatedUser } from "@lens-protocol/react";

export const Connect = () => {
  const dispatch = useDispatch();
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show }) => {
        if (isConnected && authenticatedUser) {
          return (
            <Link href={`/u/{session.profile.handle?.localName}`}>
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
