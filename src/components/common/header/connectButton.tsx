import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { SessionType, useSession } from "@lens-protocol/react-web";

export const Connect = () => {
  const { data: session, loading: sessionLoading } = useSession();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const connected = account && chain;

        return (
          <>
            {(() => {
              if (
                connected &&
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
              } else if (chain?.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="button-primary ml-auto"
                  >
                    Wrong network
                  </button>
                );
              } else {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="button-primary ml-auto"
                  >
                    Connect Wallet
                  </button>
                );
              }
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
