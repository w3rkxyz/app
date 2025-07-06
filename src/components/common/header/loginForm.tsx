import Image from "next/image";
import { toast } from "react-hot-toast";
import style from "./form.module.css";
import { useDispatch } from "react-redux";
import { setLensProfile, displayLoginModal } from "@/redux/app";
import { useEffect, useState } from "react";
import getLensAccountData, { AccountData } from "@/utils/getLensProfile";
import { useAccount, useWalletClient } from "wagmi";
import { Oval } from "react-loader-spinner";
import { Account, evmAddress, uri, nonNullable } from "@lens-protocol/client";
import { useLogin, useAccountsAvailable, SessionClient } from "@lens-protocol/react";
import {
  canCreateUsername,
  createAccountWithUsername,
  fetchAccount,
} from "@lens-protocol/client/actions";
import { signMessageWith, handleOperationWith } from "@lens-protocol/client/viem";
import { client } from "@/client";
import { uploadJsonToIPFS } from "@/utils/uploadToIPFS";
import { openAlert, closeAlert } from "@/redux/alerts";

export default function LoginForm({
  owner,
}: // setProfile,
// onClose,
{
  owner: string;
}) {
  const dispatch = useDispatch();
  const [creatingProfile, setCreatingProfile] = useState(false);
  const { data: walletClient } = useWalletClient();
  const [sessionClient, setSessionClient] = useState<SessionClient | null>(null);
  const { data: availableAccounts, loading: accountsLoading } = useAccountsAvailable({
    managedBy: walletClient?.account.address,
    includeOwned: true,
  });
  const { execute: authenticate, loading: authenticateLoading } = useLogin();
  const wallet = useAccount();
  const [errorMessage, setErrorMessage] = useState("Sorry, handles cannot start with a number.");
  const [showError, setShowError] = useState(false);
  const [handle, setHandle] = useState("");

  const handleInput = (e: any) => {
    const input: string = e.target.value;
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
    if (sessionClient !== null && handle !== "" && walletClient) {
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
        case "NamespaceOperationValidationPassed":
          // Creating a username is allowed

          const metadata = {
            name: handle,
            bio: "",
            picture: "",
            coverPicture: "",
            attributes: [],
          };
          console.log("Got here 0");

          const metadataURI = await uploadJsonToIPFS(metadata);
          console.log("Got here 1");

          const accountResult = await createAccountWithUsername(sessionClient, {
            username: { localName: handle },
            metadataUri: uri(metadataURI),
          })
            .andThen(handleOperationWith(walletClient))
            .then(() => {
              sessionClient.logout()
              dispatch(
                openAlert({
                  displayAlert: true,
                  data: {
                    id: 1,
                    variant: "Successful",
                    classname: "text-black",
                    title: "Submission Successful",
                    tag1: "Profile minted!",
                    tag2: "View on etherscan",
                  },
                })
              );
              setTimeout(() => {
                window.location.reload();
                dispatch(closeAlert());
              }, 3000);
            });
          break;

        case "NamespaceOperationValidationFailed":
          // Creating a username is not allowed
          setErrorMessage(result.value.reason);
          setShowError(true);
          setCreatingProfile(false);
          break;

        case "NamespaceOperationValidationUnknown":
          // Validation outcome is unknown
          setErrorMessage("Sorry, something went wrong. Please try again.");
          setShowError(true);
          setCreatingProfile(false);
          break;

        case "UsernameTaken":
          // The desired username is not available
          setErrorMessage("Sorry, that handle is not available.");
          setShowError(true);
          setCreatingProfile(false);
          break;
      }

      // const hash = await create_profile(handle, address as string, dispatch);
      // if (hash) {
      //   console.log("Success: ", hash);
      // } else {
      //   console.log("error dey");
      // }

      // console.log("Name: ", handle);
      // console.log("address: ", address as string);

      // const client = new LensClient({
      //   environment: development,
      // });

      // const result2 = await client.wallet.createProfileWithHandle({
      //   handle: handle,
      //   to: address as string,
      // });

      // setLoadingProfiles(true);
      // setTimeout(() => {
      //   execute({
      //     where: {
      //       ownedBy: [owner],
      //     },
      //   });
      //   setInterval(() => {
      //     execute({
      //       where: {
      //         ownedBy: [owner],
      //       },
      //     });
      //   }, 2000);
      // }, 5000);

      // setOwner("0x");
      // setTimeout(() => {
      //   setOwner(address as string);
      // }, 1000);

      // const paginatedAccounts = await client.wallet.ownedHandles({
      //   for: address as string,
      // });
      // const firstResult = paginatedAccounts.items[0];
      // console.log("Id: ", firstResult.id);

      // Uncomment
      // dispatch(
      //   openAlert({
      //     displayAlert: true,
      //     data: {
      //       id: 1,
      //       variant: "Successful",
      //       classname: "text-black",
      //       title: "Submission Successful",
      //       tag1: "Profile minted!",
      //       tag2: "View on etherscan",
      //     },
      //   })
      // );
      // setTimeout(() => {
      //   // window.location.reload();
      //   dispatch(closeAlert());
      // }, 3000);
      // Stop here

      // dispatch(displayLoginModal({ display: false }));
      // const result2 = await createProfile({
      //   localName: handle,
      //   to: address as string,
      // });

      // if (result2.isFailure()) {
      //   window.alert(result2.error.message);
      //   setCreatingProfile(false);
      //   return;
      // }

      // const profile = result.value;
      // console.log("Profile: ", profile);
      // setCreatingProfile(false);
    }
  };

  // const isNameAvailable = async (name: string) => {
  //   if(sessionClient) {
  //     const result = await canCreateUsername(sessionClient, {
  //       localName: name,
  //     });

  //     if (result.isErr()) {
  //       return console.error(result.error);
  //     }

  //     return result.value;
  //   }
  // }

  // useEffect(() => {
  //   if (handle !== "" && sessionClient) {

  //   }
  // }, [handle]);

  const authenticateUser = async () => {
    if (sessionClient === null && walletClient) {
      const authenticated = await client.login({
        onboardingUser: {
          app: evmAddress(process.env.NEXT_PUBLIC_APP_ADDRESS_TESTNET as string),
          wallet: walletClient.account.address,
        },
        signMessage: signMessageWith(walletClient),
      });

      if (authenticated.isErr()) {
        return console.error(authenticated.error);
      }

      const newSessionClient = authenticated.value;
      setSessionClient(newSessionClient);
    }
  };

  const handleSelectAccount = async (account: Account) => {
    if (!walletClient) return;
    try {
      const isOwner = wallet.address === account.owner;
      const authRequest = isOwner
        ? {
            accountOwner: {
              account: account.address,
              app:
                process.env.NEXT_PUBLIC_ENVIRONMENT === "development"
                  ? process.env.NEXT_PUBLIC_APP_ADDRESS_TESTNET
                  : process.env.NEXT_PUBLIC_APP_ADDRESS_MAINNET,
              owner: walletClient.account.address,
            },
          }
        : {
            accountManager: {
              account: account.address,
              app:
                process.env.NEXT_PUBLIC_ENVIRONMENT === "development"
                  ? process.env.NEXT_PUBLIC_APP_ADDRESS_TESTNET
                  : process.env.NEXT_PUBLIC_APP_ADDRESS_MAINNET,
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
      dispatch(displayLoginModal({ display: false }));
    } catch (error) {
      console.error("Lens authentication failed:", error);
    }
  };

  const handleCloseModal = () => {
    dispatch(displayLoginModal({ display: false }));
  };

  useEffect(() => {
    
  }, [availableAccounts])

  // Shows list of available profiles associated with the connected wallet
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
        <div className="p-[16px] pt-[12px] flex flex-col">
          {accountsLoading && (
            <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">Loading...</span>
          )}
          {availableAccounts && availableAccounts.items.length === 0 && sessionClient === null && (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium mb-[12px]">
                No Lens profiles found, mint yours now!
              </span>
              <div className="w-[272px] flex items-center space-between gap-[20px] box-border">
                <span className="text-[14px] leading-[14.52px] font-medium">
                  Create your first lens account now
                </span>
                <Image
                  src={"/images/arrow-handle.svg"}
                  alt="arrow icon"
                  width={20}
                  height={20}
                  className="w-[24px] h-[24px] bg-[#F5F5F5] px-[5px] py-[4px] rounded-[6px] cursor-pointer"
                  onClick={authenticateUser}
                />
              </div>
            </>
          )}
          {availableAccounts && availableAccounts.items.length === 0 && sessionClient !== null && (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium mb-[12px]">
                No Lens profiles found, mint yours now!
              </span>
              <div className="w-[272px] rounded-[8px] bg-[#F5F5F5] p-[3px] pl-[5px] flex items-center gap-[4px] box-border">
                <Image
                  src={"/images/search-handle.svg"}
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
                  <div className="w-[24px] h-[24px] bg-white flex items-center align-middle  rounded-[6px] cursor-pointer">
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
                    src={"/images/arrow-handle.svg"}
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
          {availableAccounts && availableAccounts.items.length > 0 && (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">
                Please sign the message.
              </span>
              {availableAccounts.items.map((acc, index) => {
                return (
                  <div
                    key={index}
                    className="flex gap-[12px] items-center mt-[8px] cursor-pointer"
                    onClick={() => handleSelectAccount(acc.account)}
                  >
                    <Image
                      src={
                        acc.account.metadata?.picture || "https://static.hey.xyz/images/default.png"
                      }
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
