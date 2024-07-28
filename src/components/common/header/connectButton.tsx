import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
export const Connect = () => {
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
              if (connected) {
                return (
                  <Link href="/other-user-follow">
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
