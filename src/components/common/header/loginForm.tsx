import Image from "next/image";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setLensProfile, displayLoginModal } from "@/redux/app";
import { useCallback, useEffect, useMemo, useState } from "react";
import getLensAccountData from "@/utils/getLensProfile";
import { useAccount, useWalletClient } from "wagmi";
import { Oval } from "react-loader-spinner";
import { Account, evmAddress, uri } from "@lens-protocol/client";
import { useLogin, useAccountsAvailable, SessionClient } from "@lens-protocol/react";
import {
  canCreateUsername,
  createAccountWithUsername,
  fetchAccountsAvailable,
} from "@lens-protocol/client/actions";
import { signMessageWith, handleOperationWith } from "@lens-protocol/client/viem";
import { client } from "@/client";
import { jsonToDataURI } from "@/utils/dataUriHelpers";
import { openAlert, closeAlert } from "@/redux/alerts";

type AvailableAccountItem = {
  account: Account;
};

const LENS_TESTNET_CHAIN_ID = 37111;
const LENS_TESTNET_APP = "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.length > 0) {
      return msg;
    }
  }
  return fallback;
};

export default function LoginForm({ owner }: { owner: string }) {
  const dispatch = useDispatch();
  const { data: walletClient } = useWalletClient();
  const wallet = useAccount();

  const [creatingProfile, setCreatingProfile] = useState(false);
  const [sessionClient, setSessionClient] = useState<SessionClient | null>(null);
  const [handle, setHandle] = useState("");
  const [errorMessage, setErrorMessage] = useState("Sorry, handles cannot start with a number.");
  const [showError, setShowError] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [fallbackAccounts, setFallbackAccounts] = useState<AvailableAccountItem[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    data: availableAccounts,
    loading: accountsLoading,
    error: accountsError,
  } = useAccountsAvailable({
    managedBy: evmAddress(owner),
    includeOwned: true,
  });

  const { execute: authenticate, loading: authenticateLoading } = useLogin();

  const walletReady = Boolean(walletClient?.account.address);

  const accountItems = useMemo(() => {
    const hookItems = availableAccounts?.items ?? [];
    return hookItems.length > 0 ? hookItems : fallbackAccounts;
  }, [availableAccounts, fallbackAccounts]);

  const loadingProfiles = accountsLoading || fallbackLoading;
  const noProfiles = walletReady && !loadingProfiles && accountItems.length === 0;

  const accountsErrorMessage = useMemo(() => {
    if (accountsError) {
      return getErrorMessage(accountsError, "Could not load your Lens accounts.");
    }
    return fallbackError;
  }, [accountsError, fallbackError]);

  const ensureLensChain = useCallback(async () => {
    if (!walletClient) {
      toast.error("Wallet not ready. Please reconnect and try again.");
      return false;
    }

    const currentChainId = walletClient.chain?.id;
    if (currentChainId === LENS_TESTNET_CHAIN_ID) {
      return true;
    }

    try {
      await walletClient.switchChain({ id: LENS_TESTNET_CHAIN_ID });
      return true;
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err?.code !== 4902) {
        toast.error("Please switch to Lens Chain Testnet to continue.");
        return false;
      }

      try {
        await walletClient.addChain({
          chain: {
            id: LENS_TESTNET_CHAIN_ID,
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
        await walletClient.switchChain({ id: LENS_TESTNET_CHAIN_ID });
        return true;
      } catch {
        toast.error("Could not add Lens Chain Testnet to your wallet.");
        return false;
      }
    }
  }, [walletClient]);

  const loadAvailableAccounts = useCallback(async () => {
    setFallbackLoading(true);
    setFallbackError(null);

    const result = await fetchAccountsAvailable(client, {
      managedBy: evmAddress(owner),
      includeOwned: true,
    });

    if (result.isErr()) {
      setFallbackAccounts([]);
      setFallbackError(getErrorMessage(result.error, "Could not load your Lens accounts."));
      setFallbackLoading(false);
      return;
    }

    setFallbackAccounts(result.value.items as AvailableAccountItem[]);
    setFallbackLoading(false);
  }, [owner]);

  useEffect(() => {
    if (!walletReady) return;
    void loadAvailableAccounts();
  }, [walletReady, loadAvailableAccounts]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setHandle(input);

    if (/^\d/.test(input)) {
      setErrorMessage("Sorry, handles cannot start with a number.");
      setShowError(true);
    } else if (input.length > 26) {
      setErrorMessage("Sorry, handles must not be longer than 26 characters.");
      setShowError(true);
    } else {
      setShowError(false);
    }
  };

  const authenticateUser = async () => {
    setAuthError(null);

    if (!walletClient) {
      const msg = "Wallet not ready. Reconnect and try again.";
      setAuthError(msg);
      toast.error(msg);
      return;
    }

    setOnboardingLoading(true);

    try {
      const canContinue = await ensureLensChain();
      if (!canContinue) {
        setOnboardingLoading(false);
        return;
      }

      const appAddress = process.env.NEXT_PUBLIC_APP_ADDRESS_TESTNET || LENS_TESTNET_APP;

      const authenticated = await client.login({
        onboardingUser: {
          app: evmAddress(appAddress),
          wallet: walletClient.account.address,
        },
        signMessage: signMessageWith(walletClient),
      });

      if (authenticated.isErr()) {
        const msg = getErrorMessage(authenticated.error, "Lens authentication failed.");
        setAuthError(msg);
        toast.error(msg);
        setOnboardingLoading(false);
        return;
      }

      setSessionClient(authenticated.value);
      await loadAvailableAccounts();
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Lens authentication failed.");
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionClient || !walletClient || handle.trim() === "") {
      return;
    }

    setCreatingProfile(true);

    const result = await canCreateUsername(sessionClient, {
      localName: handle,
    });

    if (result.isErr()) {
      setErrorMessage("Sorry, that handle is not available.");
      setShowError(true);
      setCreatingProfile(false);
      return;
    }

    switch (result.value.__typename) {
      case "NamespaceOperationValidationPassed": {
        const metadata = {
          name: handle,
          bio: "",
          picture: "",
          coverPicture: "",
          attributes: [],
        };

        const metadataURI = await jsonToDataURI(metadata);

        const accountParams = {
          username: { localName: handle },
          metadataUri: uri(metadataURI),
        };

        try {
          await createAccountWithUsername(sessionClient, accountParams).andThen(
            handleOperationWith(walletClient)
          );

          setCreatingProfile(false);
          sessionClient.logout();
          dispatch(
            openAlert({
              displayAlert: true,
              data: {
                id: 1,
                variant: "Successful",
                classname: "text-black",
                title: "Submission Successful",
                tag1: "Profile minted!",
                tag2: "View on Lens Explorer",
              },
            })
          );
          setTimeout(() => {
            window.location.reload();
            dispatch(closeAlert());
          }, 3000);
        } catch {
          setCreatingProfile(false);
          setErrorMessage("Failed to create profile. Please try again.");
          setShowError(true);
        }
        break;
      }
      case "NamespaceOperationValidationFailed":
        setErrorMessage(result.value.reason);
        setShowError(true);
        setCreatingProfile(false);
        break;
      case "NamespaceOperationValidationUnknown":
        setErrorMessage("Sorry, something went wrong. Please try again.");
        setShowError(true);
        setCreatingProfile(false);
        break;
      case "UsernameTaken":
        setErrorMessage("Sorry, that handle is not available.");
        setShowError(true);
        setCreatingProfile(false);
        break;
    }
  };

  const handleSelectAccount = async (account: Account) => {
    if (!walletClient) {
      toast.error("Wallet not ready. Please reconnect and try again.");
      return;
    }

    try {
      const canContinue = await ensureLensChain();
      if (!canContinue) {
        return;
      }

      const appAddress = process.env.NEXT_PUBLIC_APP_ADDRESS_TESTNET || LENS_TESTNET_APP;
      const isOwner = wallet.address?.toLowerCase() === account.owner.toLowerCase();

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

      const profile = getLensAccountData(account);
      toast.success(`Welcome ${profile.handle}`);
      localStorage.setItem("activeHandle", profile.handle);
      dispatch(setLensProfile({ profile }));
      dispatch(displayLoginModal({ display: false }));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Lens account login failed."));
    }
  };

  const handleCloseModal = () => {
    dispatch(displayLoginModal({ display: false }));
  };

  return (
    <div className="fixed w-screen h-screen top-0 left-0 z-[99] flex items-center justify-center bg-[#80808080]">
      <div className="w-[360px] flex flex-col rounded-[12px] border-[1px] border-[#E4E4E7] bg-white">
        <div className="w-[360px] flex justify-between items-center px-[16px] py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
          <span className="leading-[14.52px] text-[16px] font-medium text-[black]">Login</span>
          <Image
            onClick={handleCloseModal}
            className="cursor-pointer"
            src="/images/Close.svg"
            alt="close icon"
            width={20}
            height={20}
          />
        </div>

        <div className="p-[16px] pt-[12px] flex flex-col gap-[10px]">
          {!walletReady && (
            <span className="text-[14px] leading-[20px] text-[#444]">
              Connect your wallet first, then click Login again.
            </span>
          )}

          {walletReady && loadingProfiles && (
            <span className="text-[14px] leading-[14.52px] font-medium">Loading your Lens accounts...</span>
          )}

          {accountsErrorMessage && walletReady && (
            <span className="text-[12px] leading-[16px] text-[#FF5555]">{accountsErrorMessage}</span>
          )}

          {accountItems.length > 0 && (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium">Please sign the message.</span>
              {accountItems.map((acc, index) => (
                <div
                  key={`${acc.account.address}-${index}`}
                  className="flex gap-[12px] items-center mt-[4px] cursor-pointer"
                  onClick={() => handleSelectAccount(acc.account)}
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
              ))}
            </>
          )}

          {noProfiles && sessionClient === null && (
            <>
              <span className="text-[14px] leading-[16px] font-medium">
                No Lens profile found for this wallet yet.
              </span>
              <button
                type="button"
                className="w-full bg-black rounded-[8px] text-white px-4 py-2 text-[14px]"
                onClick={authenticateUser}
                disabled={onboardingLoading || authenticateLoading}
              >
                {onboardingLoading || authenticateLoading ? "Waiting for signature..." : "Continue"}
              </button>
            </>
          )}

          {noProfiles && sessionClient !== null && (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium mb-[2px]">
                No Lens profile found, mint yours now.
              </span>
              <div className="w-[272px] rounded-[8px] bg-[#F5F5F5] p-[3px] pl-[5px] flex items-center gap-[4px] box-border">
                <Image
                  src="/images/search-handle.svg"
                  alt="search icon"
                  width={20}
                  height={20}
                  className="w-[20px] h-[20px]"
                />
                <input
                  className="text-[14px] leading-[14.52px] font-normal text-[#ADADAD] flex-1 outline-none bg-transparent"
                  placeholder="Mint your handle"
                  onChange={handleInput}
                />
                {creatingProfile ? (
                  <div className="w-[24px] h-[24px] bg-white flex items-center rounded-[6px]">
                    <Oval
                      visible={true}
                      height="20"
                      width="20"
                      color="#2D2D2D"
                      secondaryColor="#a2a2a3"
                      strokeWidth={8}
                      ariaLabel="oval-loading"
                      wrapperClass="mx-[auto]"
                    />
                  </div>
                ) : (
                  <Image
                    src="/images/arrow-handle.svg"
                    alt="arrow icon"
                    width={20}
                    height={20}
                    className="w-[24px] h-[24px] bg-white px-[5px] py-[4px] rounded-[6px] cursor-pointer"
                    onClick={handleSubmit}
                  />
                )}
              </div>
              {showError && (
                <span className="text-[12px] leading-[14px] text-[#FF5555] font-normal">{errorMessage}</span>
              )}
            </>
          )}

          {authError && <span className="text-[12px] leading-[16px] text-[#FF5555]">{authError}</span>}

          {walletReady && !loadingProfiles && noProfiles && (
            <button
              type="button"
              className="w-full border border-[#DDDDDD] rounded-[8px] text-[#222] px-4 py-2 text-[14px]"
              onClick={loadAvailableAccounts}
              disabled={fallbackLoading}
            >
              {fallbackLoading ? "Retrying..." : "Retry account lookup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
