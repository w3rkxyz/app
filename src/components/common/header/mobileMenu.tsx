import Link from "next/link";
import Image from "next/image";
import React from "react";
import { HandleInfo, useLogout } from "@lens-protocol/react-web";
import { useDisconnect } from "wagmi";

const MobileProfileDropdown = ({
  handle,
  menuOpen,
  closeMenu,
  profilePic,
}: {
  handle?: HandleInfo;
  profilePic: string;
  menuOpen: boolean;
  closeMenu: () => void;
}) => {
  const { execute: logout, loading } = useLogout();
  const { disconnect } = useDisconnect();

  const handleLogOut = async () => {
    if (handle) {
      await logout();
      disconnect();
      closeMenu();
      window.location.href = "/";
    }
  };

  return (
    <div
      className={`mobile-menu fixed top-0 right-0 z-[99999] bg-white w-full h-screen p-[16px] ${
        menuOpen ? "open-menu" : ""
      }`}
    >
      <button onClick={closeMenu} className="mb-[8px]">
        <Image
          className="rounded-[12px] sm:w-[34px] sm:h-[34px] sm:rounded-[8.16px]"
          src={"/images/close-black.svg"}
          alt="close button"
          width={24}
          height={24}
        />
      </button>
      <div className="rounded-[12px] border-[1px] border-[#E4E4E7] flex align-middle p-[12px] gap-[12px] mb-[12px]">
        <div className="w-[50px] h-[50px] relative">
          <Image
            src={profilePic}
            layout="fill"
            className="rounded-[12px]"
            alt="user icon"
          />
        </div>
        <div className="flex flex-col justify-center gap-[6px] py-[2px]">
          <span className="bold-h2">Display Name</span>
          <span className="bold-h2-subtext">
            {handle ? `@${handle.localName}.${handle.namespace}` : "@0xPaco"}
          </span>
        </div>
      </div>
      <hr className="w-full h-[1px] bg-[#E4E4E7] border-0 mb-[14px]" />
      <div className="flex flex-col gap-[19px] pt-[10px] pb-[5px] pr-[15px] bg-white mb-[20px]">
        <Link href="/find-work" onClick={closeMenu}>
          <div className="drop-down-item">
            <Image
              src="/images/case-grey.svg"
              width={22}
              height={22}
              alt="notification icon"
            ></Image>
            <span className="drop-down-text">Find Work</span>
          </div>
        </Link>
        <Link href="/find-talent" onClick={closeMenu}>
          <div className="drop-down-item">
            <Image
              src="/images/find-talent-grey.svg"
              width={22}
              height={22}
              alt="discuss icon"
            ></Image>
            <span className="drop-down-text">Find Talent</span>
          </div>
        </Link>
      </div>
      <hr className="w-full h-[1px] bg-[#E4E4E7] border-0 mb-[14px]" />
      <div className="flex flex-col gap-[19px] pt-[10px] pb-[5px] pr-[15px] bg-white mb-[20px]">
        <Link href="/notifications" onClick={closeMenu}>
          <div className="drop-down-item">
            <Image
              src="/images/notification-grey.svg"
              width={22}
              height={22}
              alt="notification icon"
            ></Image>
            <span className="drop-down-text">Notifications</span>
          </div>
        </Link>
        <Link href="/messages" onClick={closeMenu}>
          <div className="drop-down-item">
            <Image
              src="/images/discuss-grey.svg"
              width={22}
              height={22}
              alt="discuss icon"
            ></Image>
            <span className="drop-down-text">Messages</span>
          </div>
        </Link>
        <Link href="/profile" onClick={closeMenu}>
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
        <Link href="/settings" onClick={closeMenu}>
          <div className="drop-down-item">
            <Image
              src="/images/settings.svg"
              width={22}
              height={22}
              alt="settinfs icon"
            ></Image>
            <span className="drop-down-text">Settings</span>
          </div>
        </Link>
      </div>
      <hr className="w-full h-[1px] bg-[#E4E4E7] border-0 mb-[19px]" />
      <div
        className="drop-down-item pt-[8px] pb-[7px]"
        onClick={() => {
          handleLogOut();
        }}
      >
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

export default MobileProfileDropdown;
