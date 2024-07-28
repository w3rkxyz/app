"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Notifications from "@/components/Notifications/Notifications";
import ProfileDropdown from "@/components/ProfileDropdown/ProfileDropdown";
import { usePathname } from "next/navigation";
import MobileProfileDropdown from "./mobileMenu";

const SecondNav = ({
  profile,
  setProfile,
}: {
  profile?: any;
  setProfile: any;
}) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const path = usePathname();
  console.log(path);
  console.log("Profile: ", profile);

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

  return (
    <header className="header-section py-[10px] px-[156px] sm:px-[16px] absolute w-full top-0 left-0 bg-white border-b-[1px] border-b-[#EEEEEE] z-[999]">
      <div className="custom-container">
        <div className="header-wrapper">
          <nav className="navbar-nav-main flex items-center gap-3 justify-between w-full relative">
            <div className="header-brand-box sm:flex sm:items-center sm:gap-6">
              <a href="/">
                <Image
                  src="/images/brand-logo.svg"
                  className="sm:hidden"
                  width={110}
                  height={35}
                  alt="company brand logo"
                ></Image>
                <Image
                  src="/images/brand-logo.svg"
                  className="hidden sm:block"
                  width={69}
                  height={24}
                  alt="company brand logo"
                />
              </a>
            </div>
            <div className="navbar-right-cont flex items-center">
              <ul className="navbar-nav flex items-center sm:hidden ml-auto gap-[43px]">
                <li
                  className={`navbar-nav-items ${
                    path === "/find-work" ? "selected-path" : ""
                  }`}
                >
                  <Link href="/find-work" className="">
                    Find Work
                  </Link>
                </li>
                <li
                  className={`navbar-nav-items ${
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
              <Link href="/notifications">
                <button>
                  <Image
                    src="/images/notification.svg"
                    alt="notification icon"
                    width={23}
                    height={26}
                  />
                </button>
              </Link>
              <Link href="/messages">
                <button style={{ paddingTop: "11px" }}>
                  <Image
                    className="mt-[-5px]"
                    src="/images/discuss.svg"
                    alt="message icon"
                    width={27.25}
                    height={25}
                  />
                </button>
              </Link>
              <div>
                <button onClick={openProfileDropdown}>
                  <div className="w-[50px] h-[50px] sm:w-[34px] sm:h-[34px] relative">
                    <Image
                      src={
                        profile?.metadata?.picture?.raw?.uri
                          ? profile.metadata.picture.raw.uri
                          : "/images/paco.svg"
                      }
                      layout="fill"
                      className="rounded-[12px] sm:rounded-[8.16px]"
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
                        setProfile={setProfile}
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
          />
        </div>
      </div>
    </header>
  );
};

export default SecondNav;
