"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useDisconnect } from "wagmi";
import { useDispatch, useSelector } from "react-redux";
import { displaySwitchModal } from "@/redux/app";
import { wipeKeys } from "@/utils/xmtpHelpers";
import { getLensClient } from "@/client";
import { useRouter } from "next/navigation";

const ProfileDropdown = () => {
  const { user: profile } = useSelector((state: any) => state.app);
  const dispatch = useDispatch();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleLogOut = async () => {
    if (!profile) return;

    try {
      // Perform logout via the session client
      const client = await getLensClient();

      if (client.isSessionClient()) {
        await client.logout();
      }

      disconnect();
      wipeKeys(profile.address);

      router.push("/"); // Redirect to the homepage or any other page

      window.location.reload(); // Refresh the page to clear the session
    } catch (error) {
      console.error("Lens logout failed:", error);
    }
  };

  const handleSwitchProfile = () => {
    if (profile) {
      dispatch(displaySwitchModal({ display: true }));
      wipeKeys(profile.address);
    }
  };

  return (
    <div className="profile-dropdown-section drop-down">
      {/* <div className="custom-container"></div> */}
      <div className="pl-[12px] drop-down-text py-[9px] bg-white border-b-[1px] border-b-[#E4E4E7] bg-[transparent] font-semibold">
        {profile ? `${profile.handle}` : "@user"}
      </div>
      <div className="flex flex-col gap-[8px] pt-[10px] pb-[5px] pr-[15px] bg-white border-b-[1px] border-b-[#E4E4E7]">
        <Link href={`/u/${profile?.userLink}`}>
          <div className="drop-down-item">
            <Image src="/images/user.svg" width={22} height={22} alt="person icon"></Image>
            <span className="drop-down-text">My Profile</span>
          </div>
        </Link>
        <Link href="/contracts">
          <div className="drop-down-item">
            <Image src="/images/contract.svg" width={22} height={22} alt="person icon"></Image>
            <span className="drop-down-text">My Contracts</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className="drop-down-item">
            <Image src="/images/settings.svg" width={22} height={22} alt="person icon"></Image>
            <span className="drop-down-text">Settings</span>
          </div>
        </Link>
        <div className="drop-down-item" onClick={handleSwitchProfile}>
          <Image src="/images/switch.svg" width={22} height={22} alt="person icon"></Image>
          <span className="drop-down-text">Switch Profile</span>
        </div>
      </div>
      <div className="drop-down-item pt-[8px] pb-[7px]" onClick={handleLogOut}>
        <Image src="/images/exit.svg" width={22} height={22} alt="person icon"></Image>
        <span className="drop-down-text">Log Out</span>
      </div>
    </div>
  );
};

export default ProfileDropdown;
