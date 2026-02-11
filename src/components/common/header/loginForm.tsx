import Image from "next/image";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setLensProfile, displayLoginModal } from "@/redux/app";
import { useMemo, useState } from "react";
import getLensAccountData from "@/utils/getLensProfile";
import { useAccount, useWalletClient } from "wagmi";
import { Oval } from "react-loader-spinner";
import { Account, evmAddress, uri } from "@lens-protocol/client";
import { useLogin, useAccountsAvailable, SessionClient } from "@lens-protocol/react";
import { canCreateUsername, createAccountWithUsername } from "@lens-protocol/client/actions";
import { signMessageWith, handleOperationWith } from "@lens-protocol/client/viem";
import { client } from "@/client";
import { jsonToDataURI } from "@/utils/dataUriHelpers";
import { openAlert, closeAlert } from "@/redux/alerts";

const LENS_TESTNET_CHAIN_ID = 37111;
const LENS_TESTNET_APP = "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7";

const getErrMsg = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim().length > 0) {
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
  const [errorMessage, setErrorMessage] = useState("Sorry, handles cannot start with a number.");
  const [showError, setShowError] = useState(false);
  const [handle, setHandle] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [continuing, setContinuing] = useState(false);

  const managedBy = useMemo(
    () => walletClient?.account.address ?? evmAddress(owner),
    [walletClient?.account.address, owner]
  );

  const {
    data: availableAccounts,
    loading: accountsLoading,
    error: accountsError,
  } = useAccountsAvailable({
    managedBy,
    includeOwned: true,
  });

  const { execute: authenticate, loading: authenticateLoading } = useLogin();
  const walletReady = Boolean(walletClient?.account.address);

  const ensureLensChain = async () => {
    if (!walletClient) {
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
        toast.error("Please switch to Lens Chain Testnet to continue");
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
        toast.error("Could not add Lens Chain Testnet to your wallet");
        return false;
      }
    }
  };

  const authenticateUser = async () => {
    if (!walletClient) {
      setAuthError("Wallet not ready. Reconnect and try again.");
      return;
    }

    setAuthError(null);
    setContinuing(true);

    try {
      const canContinue = await ensureLensChain();
      if (!canContinue) {
        setContinuing(false);
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
        const msg = getErrMsg(authenticated.error, "Lens login failed");
        setAuthError(msg);
        toast.error(msg);
        setContinuing(false);
        return;
      }

      setSessionClient(authenticated.value);
    } catch (error: unknown) {
      const msg = getErrMsg(error, "Lens login failed");
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setContinuing(false);
    }
  };

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

  const handleSubmit = async () => {
    if (sessionClient === null || handle.trim() === "" || !walletClient) {
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
      const msg = getErrMsg(error, "Lens authentication failed");
      setAuthError(msg);
      toast.error(msg);
    }
  };

  const handleCloseModal = () => {
    dispatch(displayLoginModal({ display: false }));
  };

  const profileCount = availableAccounts?.items.length ?? 0;
  const showPrepare = walletReady && !accountsLoading && !availableAccounts && !accountsError;

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

        <div className="p-[16px] pt-[12px] flex flex-col gap-[8px]">
          {!walletReady && (
            <span className="text-[14px] leading-[18px]">Connect your wallet first, then click Login again.</span>
          )}

          {accountsLoading && (
            <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">Loading...</span>
          )}

          {showPrepare && (
            <>
              <span className="text-[14px] leading-[16px] font-medium">Preparing your Lens login...</span>
              <button
                type="button"
                className="w-full bg-black rounded-[8px] text-white px-4 py-2 text-[14px]"
                onClick={authenticateUser}
                disabled={continuing || authenticateLoading}
              >
                {continuing || authenticateLoading ? "Waiting for signature..." : "Continue"}
              </button>
            </>
          )}

          {accountsError && (
            <>
              <span className="text-[12px] leading-[16px] text-[#FF5555]">
                {getErrMsg(accountsError, "Could not load Lens profiles")}
              </span>
              <button
                type="button"
                className="w-full bg-black rounded-[8px] text-white px-4 py-2 text-[14px]"
                onClick={authenticateUser}
                disabled={continuing || authenticateLoading}
              >
                {continuing || authenticateLoading ? "Retrying..." : "Continue"}
              </button>
            </>
          )}

          {availableAccounts && profileCount === 0 && sessionClient === null && walletReady && (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium mb-[12px]">
                No Lens profiles found, mint yours now!
              </span>
              <button
                type="button"
                className="w-full bg-black rounded-[8px] text-white px-4 py-2 text-[14px]"
                onClick={authenticateUser}
                disabled={continuing || authenticateLoading}
              >
                {continuing || authenticateLoading ? "Waiting for signature..." : "Continue"}
              </button>
            </>
          )}

          {availableAccounts && profileCount === 0 && sessionClient !== null && walletReady && (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium mb-[12px]">
                No Lens profiles found, mint yours now!
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
                  <div className="w-[24px] h-[24px] bg-white flex items-center align-middle rounded-[6px] cursor-pointer">
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
                <span className="text-[12px] leading-[14px] text-[#FF5555] font-normal mt-[6px]">
                  {errorMessage}
                </span>
              )}
            </>
          )}

          {availableAccounts && profileCount > 0 && (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">
                Please sign the message.
              </span>
              {availableAccounts.items.map((acc, index) => (
                <div
                  key={index}
                  className="flex gap-[12px] items-center mt-[8px] cursor-pointer"
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

          {authError && <span className="text-[12px] leading-[16px] text-[#FF5555]">{authError}</span>}
        </div>
      </div>
    </div>
  );
}
