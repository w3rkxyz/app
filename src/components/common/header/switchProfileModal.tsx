import Image from "next/image";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setLensProfile, displaySwitchModal } from "@/redux/app";
import { Account, evmAddress } from '@lens-protocol/client'
import { useAccountsAvailable, useLogin } from '@lens-protocol/react'
import getLensAccountData, { AccountData } from "@/utils/getLensProfile";
import { useWalletClient, useAccount } from "wagmi";

export function SwitchForm() {
  const dispatch = useDispatch();
  const { data: walletClient } = useWalletClient();
  const wallet = useAccount();
  const { execute: authenticate, loading: authenticateLoading } = useLogin();
  const { data: availableAccounts, loading: loadingProfiles } = useAccountsAvailable({
    managedBy: walletClient?.account.address,
    includeOwned: true,
  });

  const handleProfileClick = async (account: Account) => {
    if (!walletClient) return;
    try {
      // Ensure wallet is on Lens Chain Testnet before authentication
      // Chain ID: 37111 (0x9117)
      const currentChainId = walletClient.chain?.id;
      if (currentChainId !== 37111) {
        try {
          await walletClient.switchChain({ id: 37111 });
        } catch (error: any) {
          if (error.code === 4902) {
            // Chain not added, add it
            await walletClient.addChain({
              chain: {
                id: 37111,
                name: "Lens Chain Testnet",
                nativeCurrency: {
                  name: "GHO",
                  symbol: "GHO",
                  decimals: 18,
                },
                rpcUrls: {
                  default: { http: ["https://rpc.testnet.lens.xyz"] },
                },
                blockExplorers: {
                  default: {
                    name: "Lens Explorer",
                    url: "https://block-explorer.testnet.lens.xyz",
                  },
                },
              },
            });
            await walletClient.switchChain({ id: 37111 });
          } else {
            console.error("Failed to switch to Lens Chain Testnet:", error);
            toast.error("Please switch to Lens Chain Testnet to continue");
            return;
          }
        }
      }

      // Use official Lens testnet test app (since we're on Lens Chain Testnet)
      // Official test app: 0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7
      // Always use testnet app address for Lens Chain Testnet
      const appAddress = process.env.NEXT_PUBLIC_APP_ADDRESS_TESTNET || "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7";

      const isOwner = wallet.address === account.owner;
      const authRequest = isOwner
        ? {
            accountOwner: {
              account: account.address,
              app: evmAddress(appAddress),
              owner: walletClient.account.address,
            },
          }
        : {
            accountManager: {
              account: account.address,
              app: evmAddress(appAddress),
              manager: walletClient.account.address,
            },
          };

      await authenticate({
        ...authRequest,
        signMessage: async (message: string) => {
          return await walletClient.signMessage({ message });
        },
      });

      const selectedAccount = availableAccounts?.items.find(
        acc => acc.account.address === account.address
      )?.account;
      const profile = getLensAccountData(selectedAccount!);

      console.log("Profile: ", profile);

      toast.success(`Welcome ${profile.handle}`);
      localStorage.setItem("activeHandle", profile.handle);
      dispatch(setLensProfile({ profile: profile }));
      dispatch(displaySwitchModal({ display: false }));
    } catch (error) {
      console.error("Lens authentication failed:", error);
    }
  };

  const handleCloseModal = () => {
    dispatch(displaySwitchModal({ display: false }));
  };

  // Shows list of available profiles associated with the connected wallet
  return (
    <div className="fixed w-screen h-screen top-0 left-0 z-[9999999] flex items-center justify-center bg-[#80808080]">
      <div className="w-[241px] flex flex-col rounded-[12px] border-[1px] border-[#E4E4E7] bg-white">
        <div className="w-[241px] flex justify-between items-center px-[16px] py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
          <span className="leading-[14.52px] text-[16px] font-medium text-[black]">
            Switch Profile
          </span>
          <Image
            onClick={handleCloseModal}
            className="cursor-pointer"
            src="/images/Close.svg"
            alt="close icon"
            width={20}
            height={20}
          />
        </div>
        <div className="p-[16px] pt-[12px] flex flex-col">
          {loadingProfiles ? (
            <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">Loading...</span>
          ) : availableAccounts?.items.length === 0 ? (
            <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">
              No Lens Handle Found
            </span>
          ) : (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">
                Please sign the message.
              </span>
              {availableAccounts?.items?.map((acc, index) => {
                return (
                  <div
                    key={index}
                    className="flex gap-[12px] items-center mt-[8px] cursor-pointer"
                    onClick={() => handleProfileClick(acc.account)}
                  >
                    <Image
                      src={acc.account.metadata?.picture || "https://static.hey.xyz/images/default.png"}
                      alt="profile pic"
                      height={40}
                      width={40}
                      className="w-[40px] h-[40px] rounded-[8px] border-[1px] border-[#E4E4E7]"
                    />
                    <span className="text-[14px] leading-[14.52px] font-medium">
                      {acc.account.username?.localName || acc.account.address}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
