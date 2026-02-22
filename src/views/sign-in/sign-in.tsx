'use client'
import { useEffect } from "react";
import { useAuthenticatedUser, useAccount } from "@lens-protocol/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useConnect } from "wagmi";
import { SVGHardDrive, SVGHelp, SVGOtherWallet } from "@/assets/list-svg-icon";

const walletIcons: Record<string, string> = {
  MetaMask: "/images/metamask.svg",
  "Coinbase Wallet": "/images/coinbase.svg",
  WalletConnect: "/images/walletconnect.svg",
  Phantom: "/images/phantom.svg",
  Injected: "/images/metamask.svg", // Fallback for generic injected wallets
};


export const LoginPage = () => {
  const router = useRouter();
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();
  
  const { data: account, loading: accountLoading } = useAccount({
    address: authenticatedUser?.address,
  });

  useEffect(() => {
    if (authenticatedUser && account?.username?.localName && !accountLoading) {
      const handle = account.username.localName;
      router.push(`/u/${handle}`);
    }
  }, [authenticatedUser, account, accountLoading, router]);

  // Filter and organize connectors
  // ConnectKit typically provides: Injected (MetaMask/Phantom), Coinbase, WalletConnect
  const familyConnector = connectors[0]; // Assuming first is your primary
  const otherConnectors = connectors.slice(1);

  console.log("Available connectors:", connectors.map(c => ({ id: c.id, name: c.name })));

  return (
    <div className="min-h-screen bg-white">
      <div className="grid sm:grid-cols-1 grid-cols-2 justify-center h-screen items-center">
        <div className="flex flex-col items-center justify-center h-full">
            {/* Title */}
            <h2 className="text-[28px] font-bold text-center mb-6 flex items-center gap-2">
              Connect Wallet <SVGHelp />
            </h2>

            {/* Family Button */}
            {familyConnector && (
              <button 
                onClick={() => connect({ connector: familyConnector })} 
                disabled={isLoading && pendingConnector?.id === familyConnector.id}
                className="sm:w-[80%] w-[458px] bg-black text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-medium mb-6 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition"
              >
                <Image
                  src={"/images/family.svg"}
                  alt={"Family wallet"}
                  width={20}
                  height={20}
                />
                Continue with Family
                {isLoading && pendingConnector?.id === familyConnector.id && " (connecting...)"}
              </button>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6 ">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[#6C6C6C] sm:text-sm text-base">
                Or Select a wallet from the list below
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Wallet List */}
            <div className="flex flex-col gap-3 w-full items-center justify-center">
              {otherConnectors.map((connector) => {
                // Get the icon, with fallback
                const icon = walletIcons[connector.name] ?? "/images/default.svg";

                return (
                  <button
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    disabled={isLoading && pendingConnector?.id === connector.id}
                    className="
                      flex items-center justify-between
                      px-5 py-4
                      bg-gray-50 hover:bg-gray-100
                      rounded-2xl
                      transition
                      sm:w-[80%] w-[458px]
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {/* Wallet Name */}
                    <span className="font-medium text-gray-800">
                      {connector.name}
                      {isLoading && pendingConnector?.id === connector.id && " (connecting...)"}
                    </span>

                    {/* Wallet Icon */}
                    <Image
                      src={icon}
                      alt={connector.name}
                      width={32}
                      height={32}
                    />
                  </button>
                );
              })}
              <button
                // onClick={() => connect({ connector })}
                // disabled={isLoading && pendingConnector?.id === connector.id}
                className="
                  flex items-center justify-between
                  px-5 py-4
                  bg-gray-50 hover:bg-gray-100
                  rounded-2xl
                  transition
                  sm:w-[80%] w-[458px]
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {/* Wallet Name */}
                <span className="font-medium text-gray-800">
                  Phantom
                  {/* {isLoading && pendingConnector?.id === connector.id && " (connecting...)"} */}
                </span>

                {/* Wallet Icon */}
                <Image
                  src={"/images/phantom.svg"}
                  alt="Phantom"
                  width={32}
                  height={32}
                />
              </button>
              <button
                // onClick={() => connect({ connector })}
                // disabled={isLoading && pendingConnector?.id === connector.id}
                className="
                  flex items-center justify-between
                  px-5 py-4
                  bg-gray-50 hover:bg-gray-100
                  rounded-2xl
                  transition
                  sm:w-[80%] w-[458px]
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {/* Wallet Name */}
                <span className="font-medium text-gray-800">
                  Other Wallet
                  {/* {isLoading && pendingConnector?.id === connector.id && " (connecting...)"} */}
                </span>

                {/* Wallet Icon */}
                <SVGOtherWallet />
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 text-center mt-6 text-[#85868C] text-base font-bold cursor-pointer hover:text-gray-700 transition">
              <SVGHardDrive /> I don't have a wallet
            </div>
          </div>
        
        <div className="bg-[#FAFAFA] h-screen sm:hidden lg:flex items-center justify-center">
          <Image src={'/images/login-bg.svg'} alt="login" width={700} height={600} />
        </div>
      </div>
    </div>
  );
};