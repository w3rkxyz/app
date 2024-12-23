"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { HandleInfo, useLogout } from "@lens-protocol/react-web";
import { useAccount, useDisconnect } from "wagmi";
import { useDispatch } from "react-redux";
import { displayLoginModal, displaySwitchModal } from "@/redux/app";
import { wipeKeys } from "@/utils/xmtpHelpers";

const ProfileDropdown = ({ handle }: { handle?: HandleInfo }) => {
  const { execute: logout, loading } = useLogout();
  const dispatch = useDispatch();
  const { disconnect } = useDisconnect();

  const handleLogOut = async () => {
    if (handle) {
      await logout();
      disconnect();
      wipeKeys(handle.ownedBy);
      window.location.href = "/";
    }
  };

  const handleSwitchProfile = () => {
    if (handle) {
      dispatch(displaySwitchModal({ display: true }));
      wipeKeys(handle.ownedBy);
    }
  };

  return (
    <div className="profile-dropdown-section drop-down">
      {/* <div className="custom-container"></div> */}
      <div className="pl-[12px] drop-down-text py-[9px] bg-white border-b-[1px] border-b-[#E4E4E7] bg-[transparent] font-semibold">
        {handle ? `@${handle.localName}` : "@user"}
      </div>
      <div className="flex flex-col gap-[8px] pt-[10px] pb-[5px] pr-[15px] bg-white border-b-[1px] border-b-[#E4E4E7]">
        <Link href={`/u/${handle?.localName}`}>
          <div className="drop-down-item">
            <Image
              src="/images/user.svg"
              width={22}
              height={22}
              alt="person icon"
            ></Image>
            <span className="drop-down-text">My Profile</span>
          </div>
        </Link>
        <Link href="/contracts">
          <div className="drop-down-item">
            <Image
              src="/images/contract.svg"
              width={22}
              height={22}
              alt="person icon"
            ></Image>
            <span className="drop-down-text">My Contracts</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className="drop-down-item">
            <Image
              src="/images/settings.svg"
              width={22}
              height={22}
              alt="person icon"
            ></Image>
            <span className="drop-down-text">Settings</span>
          </div>
        </Link>
        <div className="drop-down-item" onClick={handleSwitchProfile}>
          <Image
            src="/images/switch.svg"
            width={22}
            height={22}
            alt="person icon"
          ></Image>
          <span className="drop-down-text">Switch Profile</span>
        </div>
      </div>
      <div className="drop-down-item pt-[8px] pb-[7px]" onClick={handleLogOut}>
        <Image
          src="/images/exit.svg"
          width={22}
          height={22}
          alt="person icon"
        ></Image>
        <span className="drop-down-text">Log Out</span>
      </div>
    </div>
  );
};

export default ProfileDropdown;
