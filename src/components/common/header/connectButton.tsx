import { ConnectButton } from "@rainbow-me/rainbowkit";
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
              if (!connected) {
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
              if (chain?.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="button-primary ml-auto"
                  >
                    Wrong network
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
