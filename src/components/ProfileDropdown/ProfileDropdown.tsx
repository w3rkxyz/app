import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { HandleInfo, useLogout } from "@lens-protocol/react-web";
import { LoginForm } from "../common/header/loginForm";
import { useAccount } from "wagmi";

const ProfileDropdown = ({
  handle,
  setProfile,
}: {
  handle?: HandleInfo;
  setProfile: any;
}) => {
  const { execute: logout, loading } = useLogout();
  const { isConnected, address } = useAccount();
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLogOut = () => {
    if (handle) {
      logout();
    }
  };

  const handleSwitchProfile = () => {
    if (handle) {
      setShowLoginForm(true);
      logout();
    }
  };

  return (
    <div className="profile-dropdown-section drop-down">
      {/* <div className="custom-container"></div> */}
      <div className="pl-[12px] drop-down-text py-[9px] bg-white border-b-[1px] border-b-[#E4E4E7] bg-[transparent] font-semibold">
        {handle ? `@${handle.localName}.${handle.namespace}` : "@user.lens"}
      </div>
      <div className="flex flex-col gap-[8px] pt-[10px] pb-[5px] pr-[15px] bg-white border-b-[1px] border-b-[#E4E4E7]">
        <Link href="/profile">
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
      {showLoginForm && (
        <LoginForm
          owner={address as string}
          setProfile={setProfile}
          onClose={() => setShowLoginForm(false)}
        />
      )}
    </div>
  );
};

export default ProfileDropdown;
