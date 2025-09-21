import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { displayLoginModal } from "@/redux/app";
import { useAuthenticatedUser, useAccount } from "@lens-protocol/react";

export const Connect = () => {
  const dispatch = useDispatch();
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();
  
  // Get the account details for the authenticated user
  const { data: account, loading: accountLoading } = useAccount({
    address: authenticatedUser?.address,
  });

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show }) => {
        console.log('Connect Button State:', { isConnected, authenticatedUser, authUserLoading, account, accountLoading });
        
        if (isConnected && authenticatedUser && account?.username?.localName) {
          const handle = account.username.localName;
          console.log('Navigating to profile:', `/u/${handle}`);
          return (
            <Link href={`/u/${handle}`}>
              <button type="button" className="button-primary mx-auto">
                Get Started
              </button>
            </Link>
          );
        } else if (isConnected && (authUserLoading || accountLoading)) {
          return (
            <button type="button" className="button-primary mx-auto" disabled>
              Loading...
            </button>
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
