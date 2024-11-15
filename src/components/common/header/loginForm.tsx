import Image from "next/image";
import { useEffect } from "react";
import {
  profileId,
  useLogin,
  useProfiles,
  Profile,
  useValidateHandle,
  useLazyProfiles,
  useCreateProfile,
  useOwnedHandles,
} from "@lens-protocol/react-web";
import { toast } from "react-hot-toast";
import style from "./form.module.css";
import { formatProfileIdentifier } from "../../../utils/formatProfileIdentifier";
import { useSelector, useDispatch } from "react-redux";
import { setLensProfile, displayLoginModal } from "@/redux/app";
import { useState } from "react";
import getLensProfileData, { UserProfile } from "@/utils/getLensProfile";
import { create_new_profile, create_profile } from "@/api";
import { useAccount } from "wagmi";
import { Oval } from "react-loader-spinner";
import { useAppKitAccount } from "@reown/appkit/react";
import { LensClient, development } from "@lens-protocol/client";
import { openAlert, closeAlert } from "@/redux/alerts";

export function LoginForm({
  owner,
}: // setProfile,
// onClose,
{
  owner: string;
}) {
  const dispatch = useDispatch();
  // const { address } = useAccount();
  const { address } = useAppKitAccount();
  // const [owner, setOwner] = useState(address as string);
  const { execute: validateHandle, loading: verifying } = useValidateHandle();
  // const { execute: createProfile, loading: creating } = useCreateProfile();
  const { execute: login, loading: isLoginPending } = useLogin();
  const [creatingProfile, setCreatingProfile] = useState(false);
  const { called, data, execute } = useLazyProfiles();
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const { data: profilesData } = useProfiles({
    where: {
      ownedBy: [owner],
    },
  });
  const [profiles, setProfiles] = useState<
    {
      picture: string;
      coverPicture: string;
      displayName: string;
      handle: string;
      bio: string;
      attributes: any;
      id: any;
      profile: Profile;
    }[]
  >();
  const [errorMessage, setErrorMessage] = useState(
    "Sorry, handles cannot start with a number."
  );
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
    setCreatingProfile(true);
    const result = await validateHandle({ localName: handle });

    if (result.isFailure()) {
      setErrorMessage("Sorry, that handle is not available.");
      setShowError(true);
      setCreatingProfile(false);
      return;
    }

    // const hash = await create_profile(handle, address as string, dispatch);
    // if (hash) {
    //   console.log("Success: ", hash);
    // } else {
    //   console.log("error dey");
    // }

    // console.log("Name: ", handle);
    // console.log("address: ", address as string);

    const client = new LensClient({
      environment: development,
    });

    const result2 = await client.wallet.createProfileWithHandle({
      handle: handle,
      to: address as string,
    });

    setLoadingProfiles(true);
    setTimeout(() => {
      execute({
        where: {
          ownedBy: [owner],
        },
      });
      setInterval(() => {
        execute({
          where: {
            ownedBy: [owner],
          },
        });
      }, 2000);
    }, 5000);
    // setOwner("0x");
    // setTimeout(() => {
    //   setOwner(address as string);
    // }, 1000);

    // const paginatedAccounts = await client.wallet.ownedHandles({
    //   for: address as string,
    // });
    // const firstResult = paginatedAccounts.items[0];
    // console.log("Id: ", firstResult.id);
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
      // window.location.reload();
      dispatch(closeAlert());
    }, 3000);
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
    setCreatingProfile(false);
  };

  const handleProfileClick = async (profile: string) => {
    const id = profileId(profile);

    const result = await login({
      address: owner,
      profileId: id,
    });

    if (result.isSuccess()) {
      toast.success(
        `Welcome ${String(
          result.value && formatProfileIdentifier(result.value)
        )}`
      );

      profiles?.map((profile: any) => {
        if (profile.id === id) {
          localStorage.setItem("activeHandle", profile.handle?.fullHandle);
          // setProfile(profile);
          // onClose();

          dispatch(setLensProfile({ profile: profile }));
          dispatch(displayLoginModal({ display: false }));
        }
      });
    }
  };

  const handleCloseModal = () => {
    dispatch(displayLoginModal({ display: false }));
  };

  useEffect(() => {
    console.log("Found a profile!");

    if (data) {
      console.log("Data: ", data);
      var temp: {
        picture: string;
        coverPicture: string;
        displayName: string;
        handle: string;
        bio: string;
        attributes: any;
        id: any;
        profile: Profile;
      }[] = [];

      data.map((profile: Profile) => {
        var profileData = getLensProfileData(profile);
        if (profileData.handle !== "") {
          temp.push({ ...profileData, profile: profile });
        }
      });

      setProfiles(temp);
      setLoadingProfiles(false);
    } else if (profilesData) {
      var temp: {
        picture: string;
        coverPicture: string;
        displayName: string;
        handle: string;
        bio: string;
        attributes: any;
        id: any;
        profile: Profile;
      }[] = [];

      profilesData.map((profile: Profile) => {
        var profileData = getLensProfileData(profile);
        if (profileData.handle !== "") {
          temp.push({ ...profileData, profile: profile });
        }
      });

      setProfiles(temp);
      setLoadingProfiles(false);
    }
  }, [data, profilesData]);

  useEffect(() => {
    execute({
      where: {
        ownedBy: [owner],
      },
    }).then((result) => {
      if (result.isFailure()) {
        setLoadingProfiles(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shows list of available profiles associated with the connected wallet
  return (
    <div className="fixed w-screen h-screen top-0 left-0 z-[99] flex items-center justify-center bg-[#80808080]">
      <div className="w-[360px] flex flex-col rounded-[12px] border-[1px] border-[#E4E4E7] bg-white">
        <div className="w-[360px] flex justify-between items-center px-[16px] py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
          <span className="leading-[14.52px] text-[16px] font-medium text-[black]">
            Login
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
            <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">
              Loading...
            </span>
          ) : profiles?.length === 0 ? (
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
          ) : (
            <>
              <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">
                Please sign the message.
              </span>
              {profiles?.map((profile, index) => {
                return (
                  <div
                    key={index}
                    className="flex gap-[12px] items-center mt-[8px] cursor-pointer"
                    onClick={() => handleProfileClick(profile.id)}
                  >
                    <Image
                      src={profile.picture}
                      alt="profile pic"
                      height={40}
                      width={40}
                      className="w-[40px] h-[40px] rounded-[8px] border-[1px] border-[#E4E4E7]"
                    />
                    <span className="text-[14px] leading-[14.52px] font-medium">
                      {profile.handle}
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
