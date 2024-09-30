import Image from "next/image";
import { useEffect } from "react";
import {
  profileId,
  useLogin,
  useProfiles,
  Profile,
  useLogout,
} from "@lens-protocol/react-web";
import { toast } from "react-hot-toast";
import style from "./form.module.css";
import { formatProfileIdentifier } from "../../../utils/formatProfileIdentifier";
import { useSelector, useDispatch } from "react-redux";
import { setLensProfile, displaySwitchModal } from "@/redux/app";
import { useState } from "react";
import getLensProfileData, { UserProfile } from "@/utils/getLensProfile";

export function SwitchForm({ owner }: { owner: string }) {
  const dispatch = useDispatch();
  const { execute: login, loading: isLoginPending } = useLogin();
  const { execute: logout, loading } = useLogout();
  const { data, loading: loadingProfiles } = useProfiles({
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

  const handleProfileClick = async (profile: string) => {
    const id = profileId(profile);

    logout();
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
          dispatch(displaySwitchModal({ display: false }));
        }
      });
    }
  };

  const handleCloseModal = () => {
    dispatch(displaySwitchModal({ display: false }));
  };

  useEffect(() => {
    if (data) {
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
    }
  }, [data]);

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
            <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">
              Loading...
            </span>
          ) : profiles?.length === 0 ? (
            <span className="text-[14px] leading-[14.52px] font-medium mb-[4px]">
              No Lens Handle Found
            </span>
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
