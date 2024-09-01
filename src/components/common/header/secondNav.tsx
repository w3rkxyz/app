"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Notifications from "@/components/Notifications/Notifications";
import ProfileDropdown from "@/components/ProfileDropdown/ProfileDropdown";
import { usePathname } from "next/navigation";
import MobileProfileDropdown from "./mobileMenu";
import { useSelector } from "react-redux";
import { LoginForm } from "./loginForm";
import { useAccount } from "wagmi";
import {
  useSearchProfiles,
  LimitType,
  Profile,
} from "@lens-protocol/react-web";
import { Oval } from "react-loader-spinner";
import getLensProfileData from "@/utils/getLensProfile";

const SecondNav = ({}: // profile,
{}) => {
  const { loginModal, user: profile } = useSelector((state: any) => state.app);
  const { address } = useAccount();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const path = usePathname();
  const [searchText, setSearchText] = useState("");
  const { data, error, loading } = useSearchProfiles({
    query: searchText,
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

  const openModal = () => {
    setShowNotifications(true);
  };
  const closeModal = () => {
    setShowNotifications(false);
  };
  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      if (
        showNotifications &&
        (event.target as HTMLElement).closest(".modal-content") === null
      ) {
        closeModal();
      }
    };

    document.addEventListener("click", handleClickOutsideModal);

    return () => {
      document.removeEventListener("click", handleClickOutsideModal);
    };
  }, [showNotifications]);

  const openProfileDropdown = () => {
    setShowProfileDropdown(true);
  };
  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };
  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      if (
        showProfileDropdown &&
        (event.target as HTMLElement).closest(".modal-content") === null
      ) {
        closeProfileDropdown();
      }
    };

    document.addEventListener("click", handleClickOutsideModal);

    return () => {
      document.removeEventListener("click", handleClickOutsideModal);
    };
  }, [showProfileDropdown]);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
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

  return (
    <>
      <header className="header-section h-[60px] px-[156px] sm:px-[16px] absolute w-full top-0 left-0 bg-white border-b-[1px] border-b-[#EEEEEE] z-[999]">
        <div className="custom-container">
          <div className="header-wrapper">
            <nav className="navbar-nav-main h-[60px] flex items-center gap-3 justify-between w-full relative">
              <div className="header-brand-box sm:flex sm:items-center">
                <a href="/">
                  <Image
                    src="/images/brand-logo.svg"
                    className="relative h-[80px] w-[80px] translate-y-[5px]"
                    width={80}
                    height={80}
                    alt="company brand logo"
                  ></Image>
                </a>
              </div>
              <div className="navbar-right-cont nav-center flex items-center absolute h-full w-fit">
                <ul className="navbar-nav flex items-center sm:hidden ml-auto gap-[7px]">
                  <li
                    className={`navbar-nav-items px-[19px] py-[5px] ${
                      path === "/find-work" ? "selected-path" : ""
                    }`}
                  >
                    <Link href="/find-work" className="">
                      Find Work
                    </Link>
                  </li>
                  <li
                    className={`navbar-nav-items px-[19px] py-[7px] ${
                      path === "/find-talent" ? "selected-path" : ""
                    }`}
                  >
                    <Link href="/find-talent" className="">
                      Find Talent
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Right Items */}
              <div className="flex items-center gap-[18px] sm:hidden">
                <div className="flex justify-start items-center w-[240px] bg-white border-[1px] border-[#E4E4E7] rounded-[12px] pl-[8px] relative">
                  <>
                    <Image
                      className="cursor-pointer"
                      src="/images/search.svg"
                      alt="close icon"
                      width={20}
                      height={20}
                    />
                    <input
                      className="search-input rounded-[12px] p-[11px] pl-[3px]"
                      placeholder="Search..."
                      onChange={(e) => setSearchText(e.target.value)}
                      value={searchText}
                    />
                  </>
                  <button
                    className="search-button pr-[9px]"
                    onClick={() => setSearchText("")}
                  >
                    <Image
                      className="cursor-pointer"
                      src="/images/Close.svg"
                      alt="close icon"
                      width={20}
                      height={20}
                    />
                  </button>
                  {profiles && profiles.length > 0 && searchText !== "" ? (
                    <div
                      className={`user-search-box mt-[0px] flex flex-col gap-[5px] absolute z-[9999] left-0 top-[47px] rounded-[10px] border-[1px] border-[#E4E4E7] bg-white py-[10px]`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {profiles.slice(0, 7).map((profile, index) => {
                        return (
                          <Link
                            href={`/other-user-follow?handle=${profile.handle}`}
                            key={index}
                          >
                            <div
                              className="text-[14px] hover:bg-[#f1f1f1] w-full gap-[8px] flex items-center cursor-pointer px-[10px] py-[8px]"
                              key={index}
                            >
                              <div className="circle-div relative bg-gray-200 dark:border-gray-700">
                                <Image
                                  src={profile.picture}
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).src = `https://api.hey.xyz/avatar?id=${profile.id}`;
                                  }}
                                  fill
                                  className="circle-div relative bg-gray-200 dark:border-gray-700"
                                  alt="user icon"
                                />
                              </div>
                              <span className="text-[14px] text-black mt-[1px]">
                                {profile.displayName !== ""
                                  ? profile.displayName
                                  : `Display Name`}
                              </span>
                              <span className="text-[13px] text-[#c1c0c0] mt-[1px]">
                                {profile.handle !== ""
                                  ? profile.handle
                                  : "@lenshandle"}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : loading && searchText !== "" ? (
                    <div
                      className={`user-search-box mt-[0px] flex flex-col absolute top-[47px] left-[16px] rounded-[10px] border-[1px] border-[#E4E4E7] bg-white py-[20px] align-middle items-center`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Oval
                        visible={true}
                        height="24"
                        width="24"
                        color="#000000"
                        secondaryColor="#E4E4E7"
                        strokeWidth={"5"}
                        ariaLabel="oval-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                      />
                      <span className="font-bold text-[14px] mt-[6px]">
                        Searching Users
                      </span>
                    </div>
                  ) : null}
                </div>
                <Link href="/notifications" style={{ paddingTop: "5px" }}>
                  <button>
                    <Image
                      src="/images/notification.svg"
                      alt="notification icon"
                      width={17}
                      height={20}
                    />
                  </button>
                </Link>
                <Link href="/messages">
                  <button style={{ paddingTop: "13px" }}>
                    <Image
                      className="mt-[-5px]"
                      src="/images/discuss.svg"
                      alt="message icon"
                      width={20}
                      height={17}
                    />
                  </button>
                </Link>
                <div>
                  <button onClick={openProfileDropdown}>
                    <div className="w-[34px] h-[34px] sm:w-[34px] sm:h-[34px] relative">
                      <Image
                        src={
                          profile?.metadata &&
                          profile?.metadata?.picture?.raw?.uri
                            ? profile.metadata.picture.raw.uri
                            : "/images/paco-square.svg"
                        }
                        layout="fill"
                        className="rounded-[8px] sm:rounded-[8.16px] relative mt-[2px]"
                        alt="user icon"
                      />
                    </div>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-[0px] top-[55px] z-[9999]">
                    {showProfileDropdown && (
                      <>
                        <ProfileDropdown
                          handle={profile?.handle ? profile.handle : undefined}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div
                className="navbar-trigger hidden sm:block"
                onClick={handleMobileMenuToggle}
              >
                <Image
                  src="/images/header-trigger.svg"
                  alt="navbar trigger"
                  width={20}
                  height={12}
                />
              </div>
            </nav>

            {/* Mobile Menu */}
            <MobileProfileDropdown
              handle={profile?.handle ? profile.handle : undefined}
              menuOpen={isMobileMenuOpen}
              closeMenu={handleMobileMenuToggle}
              profilePic={
                profile?.metadata && profile?.metadata?.picture?.raw?.uri
                  ? profile.metadata.picture.raw.uri
                  : "/images/paco.svg"
              }
            />
          </div>
        </div>
        {/* Choose Account Modal */}
      </header>
      {/* {loginModal && address && <LoginForm owner={address} />} */}
    </>
  );
};

export default SecondNav;
