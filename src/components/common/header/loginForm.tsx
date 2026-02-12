import Image from "next/image";
import { useDispatch } from "react-redux";
import { setLensProfile, displayLoginModal } from "@/redux/app";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import getLensAccountData from "@/utils/getLensProfile";
import { useAccount, useWalletClient } from "wagmi";
import { Oval } from "react-loader-spinner";
import { Account, evmAddress, uri } from "@lens-protocol/client";
import { useLogin, useAccountsAvailable, SessionClient } from "@lens-protocol/react";
import { canCreateUsername, createAccountWithUsername } from "@lens-protocol/client/actions";
import { signMessageWith, handleOperationWith } from "@lens-protocol/client/viem";
import { client } from "@/client";
import { jsonToDataURI } from "@/utils/dataUriHelpers";

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
  const autoSelectedAccountRef = useRef<string | null>(null);

  const [creatingProfile, setCreatingProfile] = useState(false);
  const [sessionClient, setSessionClient] = useState<SessionClient | null>(null);
  const [errorMessage, setErrorMessage] = useState("Sorry, handles cannot start with a number.");
  const [showError, setShowError] = useState(false);
  const [handle, setHandle] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [continuing, setContinuing] = useState(false);
  const [mintSuccessMessage, setMintSuccessMessage] = useState<string | null>(null);
  const [autoSelecting, setAutoSelecting] = useState(false);

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
  const profileCount = availableAccounts?.items.length ?? 0;
  const showPrepare = walletReady && !accountsLoading && !availableAccounts && !accountsError;
  const singleAccount = profileCount === 1 ? availableAccounts?.items[0]?.account : null;

  const ensureLensChain = useCallback(async () => {
    if (!walletClient) {
      setAuthError("Wallet not ready. Reconnect and try again.");
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
        setAuthError("Please switch to Lens Chain Testnet to continue.");
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
        setAuthError("Could not add Lens Chain Testnet to your wallet.");
        return false;
      }
    }
  }, [walletClient]);

  const authenticateUser = useCallback(async () => {
    if (!walletClient) {
      setAuthError("Wallet not ready. Reconnect and try again.");
      return;
    }

    setAuthError(null);
    setMintSuccessMessage(null);
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
        setContinuing(false);
        return;
      }

      setSessionClient(authenticated.value);
    } catch (error: unknown) {
      const msg = getErrMsg(error, "Lens login failed");
      setAuthError(msg);
    } finally {
      setContinuing(false);
    }
  }, [ensureLensChain, walletClient]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setHandle(input);
    setMintSuccessMessage(null);

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

    setShowError(false);
    setAuthError(null);
    setMintSuccessMessage(null);
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
          setMintSuccessMessage("Profile minted successfully. Finalizing login...");
          setSessionClient(null);
          setHandle("");

          setTimeout(() => {
            window.location.reload();
          }, 1500);
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

  const handleSelectAccount = useCallback(async (account: Account) => {
    if (!walletClient) {
      return;
    }

    setAuthError(null);

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
      localStorage.setItem("activeHandle", profile.handle);
      dispatch(setLensProfile({ profile }));
      dispatch(displayLoginModal({ display: false }));
    } catch (error: unknown) {
      const msg = getErrMsg(error, "Lens authentication failed");
      setAuthError(msg);
    }
  }, [authenticate, dispatch, ensureLensChain, wallet.address, walletClient]);

  const handleCloseModal = () => {
    dispatch(displayLoginModal({ display: false }));
  };

  useEffect(() => {
    if (!singleAccount || accountsLoading || authenticateLoading || continuing || !walletReady) {
      return;
    }

    if (autoSelectedAccountRef.current === singleAccount.address) {
      return;
    }

    autoSelectedAccountRef.current = singleAccount.address;
    setAutoSelecting(true);

    void handleSelectAccount(singleAccount).finally(() => {
      setAutoSelecting(false);
    });
  }, [
    accountsLoading,
    authenticateLoading,
    continuing,
    handleSelectAccount,
    singleAccount,
    walletReady,
  ]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0F172A80] px-[16px] py-[24px]">
      <div className="max-h-[92vh] w-full max-w-[460px] overflow-y-auto rounded-[20px] border border-[#E2E8F0] bg-white shadow-[0_22px_65px_rgba(15,23,42,0.26)]">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-[20px] py-[16px]">
          <span className="text-[18px] font-semibold leading-[1.2] text-[#0F172A]">Complete Login</span>
          <Image
            onClick={handleCloseModal}
            className="cursor-pointer"
            src="/images/Close.svg"
            alt="close icon"
            width={20}
            height={20}
          />
        </div>

        <div className="flex flex-col gap-[12px] p-[20px]">
          {!walletReady && (
            <span className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-[12px] py-[10px] text-[13px] leading-[1.4] text-[#B91C1C]">
              Connect your wallet first, then retry.
            </span>
          )}

          {(accountsLoading || autoSelecting) && (
            <div className="flex items-center gap-[10px] rounded-[12px] border border-[#DBEAFE] bg-[#EFF6FF] px-[12px] py-[10px] text-[14px] font-medium text-[#1D4ED8]">
              <Oval
                visible={true}
                height="16"
                width="16"
                color="#1D4ED8"
                secondaryColor="#93C5FD"
                strokeWidth={7}
                ariaLabel="loading"
              />
              {singleAccount
                ? "Profile found. Completing sign-in..."
                : "Checking Lens profile availability..."}
            </div>
          )}

          {showPrepare && (
            <>
              <span className="text-[14px] font-medium leading-[1.4] text-[#0F172A]">
                Preparing Lens authentication.
              </span>
              <button
                type="button"
                className="h-[44px] w-full rounded-[12px] bg-[#0F172A] px-[14px] text-[14px] font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={authenticateUser}
                disabled={continuing || authenticateLoading}
              >
                {continuing || authenticateLoading ? "Waiting for signature..." : "Continue"}
              </button>
            </>
          )}

          {accountsError && (
            <>
              <span className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-[12px] py-[10px] text-[12px] leading-[1.4] text-[#B91C1C]">
                {getErrMsg(accountsError, "Could not load Lens profiles")}
              </span>
              <button
                type="button"
                className="h-[44px] w-full rounded-[12px] bg-[#0F172A] px-[14px] text-[14px] font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={authenticateUser}
                disabled={continuing || authenticateLoading}
              >
                {continuing || authenticateLoading ? "Retrying..." : "Continue"}
              </button>
            </>
          )}

          {availableAccounts && profileCount === 0 && sessionClient === null && walletReady && (
            <>
              <span className="text-[14px] font-semibold leading-[1.4] text-[#0F172A]">
                No Lens profile found, mint yours now!
              </span>
              <p className="text-[13px] leading-[1.4] text-[#64748B]">
                Continue once to initialize Lens, then choose your handle.
              </p>
              <button
                type="button"
                className="h-[44px] w-full rounded-[12px] bg-[#0F172A] px-[14px] text-[14px] font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={authenticateUser}
                disabled={continuing || authenticateLoading}
              >
                {continuing || authenticateLoading ? "Waiting for signature..." : "Continue"}
              </button>
            </>
          )}

          {availableAccounts && profileCount === 0 && sessionClient !== null && walletReady && (
            <>
              <span className="text-[14px] font-semibold leading-[1.4] text-[#0F172A]">
                No Lens profiles found, mint yours now!
              </span>
              <div className="w-full rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-[8px] pl-[10px]">
                <label htmlFor="mint-handle-input" className="mb-[8px] block text-[12px] text-[#64748B]">
                  Choose a handle
                </label>
                <div className="flex items-center gap-[8px]">
                  <span className="text-[14px] font-medium text-[#475569]">@</span>
                  <input
                    id="mint-handle-input"
                    value={handle}
                    className="h-[36px] flex-1 bg-transparent text-[14px] leading-[1.2] font-medium text-[#0F172A] outline-none"
                    placeholder="yourhandle"
                    onChange={handleInput}
                  />
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={creatingProfile || handle.trim().length === 0 || showError}
                    className="h-[32px] min-w-[88px] rounded-[10px] bg-[#0F172A] px-[12px] text-[13px] font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
                  >
                    {creatingProfile ? "Minting..." : "Mint"}
                  </button>
                </div>
              </div>
              {mintSuccessMessage && (
                <span className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-[12px] py-[10px] text-[12px] leading-[1.4] text-[#15803D]">
                  {mintSuccessMessage}
                </span>
              )}
              {showError && (
                <span className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-[12px] py-[10px] text-[12px] leading-[1.4] text-[#B91C1C]">
                  {errorMessage}
                </span>
              )}
            </>
          )}

          {availableAccounts && profileCount > 1 && !autoSelecting && (
            <>
              <span className="text-[14px] font-semibold leading-[1.4] text-[#0F172A]">
                Select your Lens profile
              </span>
              <div className="flex max-h-[280px] flex-col gap-[8px] overflow-y-auto pr-[4px]">
                {availableAccounts.items.map(item => (
                  <button
                    type="button"
                    key={item.account.address}
                    className="flex w-full items-center gap-[12px] rounded-[12px] border border-[#E2E8F0] px-[12px] py-[10px] text-left transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handleSelectAccount(item.account)}
                    disabled={authenticateLoading || continuing}
                  >
                    <Image
                      src={item.account.metadata?.picture || "https://static.hey.xyz/images/default.png"}
                      alt="profile pic"
                      height={40}
                      width={40}
                      className="h-[40px] w-[40px] rounded-[10px] border border-[#E2E8F0] object-cover"
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[14px] font-semibold text-[#0F172A]">
                        @{item.account.username?.localName || item.account.address.slice(0, 8)}
                      </span>
                      <span className="truncate text-[12px] text-[#64748B]">{item.account.address}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {singleAccount && !accountsLoading && !autoSelecting && (
            <span className="rounded-[12px] border border-[#DBEAFE] bg-[#EFF6FF] px-[12px] py-[10px] text-[12px] leading-[1.4] text-[#1D4ED8]">
              Profile detected. Completing authentication...
            </span>
          )}

          {authError && (
            <span className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-[12px] py-[10px] text-[12px] leading-[1.4] text-[#B91C1C]">
              {authError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
