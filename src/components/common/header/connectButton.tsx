import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { displayLoginModal } from "@/redux/app";
import { useAuthenticatedUser, useAccount } from "@lens-protocol/react";
import { usePathname, useRouter } from "next/navigation";

export const Connect = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
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
            <button type="button" className="bg-black rounded-full text-white px-5 py-2" disabled>
              Loading...
            </button>
          );
        } else if (isConnected) {
          return (
            <button
              type="button"
              className="bg-black rounded-full text-white px-5 py-2"
              onClick={() => dispatch(displayLoginModal({ display: true }))}
            >
              Login
            </button>
          );
        } else {
          if (pathname === '/sign-in/') {
            return null;
          }
          return (
            <button type="button" className=" bg-black rounded-full text-white px-5 py-2" onClick={() => router.push('/sign-in')}>
              Sign In
            </button>
          );
        }
      }}
    </ConnectKitButton.Custom>
  );
};
