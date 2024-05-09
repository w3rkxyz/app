"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Notifications from "@/components/Notifications/Notifications";
import ProfileDropdown from "@/components/ProfileDropdown/ProfileDropdown";

const SecondNav = ({ profile }: { profile?: any }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        (event.target as HTMLElement).closest(".modal-content") === null
      ) {
        closeMobileMenu();
      }
    };

    document.addEventListener("click", handleClickOutsideModal);

    return () => {
      document.removeEventListener("click", handleClickOutsideModal);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="header-section py-[42px] sm:py-[16px] absolute w-full top-0 left-0">
      <div className="custom-container">
        <div className="header-wrapper">
          <nav className="navbar-nav-main flex items-center gap-3 justify-between w-full relative">
            <div className="header-brand-box sm:flex sm:items-center sm:gap-6">
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
              <a href="/">
                <Image
                  src="/images/brand-logo.svg"
                  className="sm:hidden"
                  width={135}
                  height={47}
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
              <ul className="navbar-nav flex items-center sm:hidden ml-auto">
                <li className="navbar-nav-items">
                  <a href="/" className="px-5 py-3">
                    Home
                  </a>
                </li>
                <li className="navbar-nav-items">
                  <Link href="/find-work" className="px-5 py-3">
                    Find Work
                  </Link>
                </li>
                <li className="navbar-nav-items">
                  <Link href="/find-talent" className="px-5 py-3">
                    Find Talent
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <button onClick={openModal}>
                  <Image
                    src="/images/Nofication-icon.svg"
                    alt="notification icon"
                    width={22}
                    height={26.25}
                  />
                </button>
                <div className="absolute right-0 top-[55px] z-[9999]">
                  {showNotifications && (
                    <>
                      {" "}
                      <Notifications />{" "}
                      <div
                        className="absolute top-2 right-10 cursor-pointer"
                        onClick={closeModal}
                      >
                        <Image
                          src="/images/Close-2.svg"
                          alt="close icon"
                          width={20}
                          height={20}
                        />
                      </div>{" "}
                    </>
                  )}
                </div>
              </div>
              <Link href="/my-message">
                <button>
                  <Image
                    className="mt-[-5px]"
                    src="/images/message-icon.svg"
                    alt="message icon"
                    width={27.25}
                    height={25}
                  />
                </button>
              </Link>
              <div>
                <button onClick={openProfileDropdown}>
                  <Image
                    className="rounded-[12px] sm:w-[34px] sm:h-[34px] sm:rounded-[8.16px]"
                    src={
                      profile
                        ? profile.metadata.picture.raw.uri
                        : "/images/profile-image.svg"
                    }
                    alt="notification icon"
                    width={50}
                    height={50}
                  />
                </button>
                <div className="absolute right-[-40px] top-[55px] z-[9999]">
                  {showProfileDropdown && (
                    <>
                      <ProfileDropdown handle={profile.handle} />{" "}
                      <div
                        className="absolute top-2 right-10 cursor-pointer"
                        onClick={closeProfileDropdown}
                      >
                        <Image
                          src="/images/Close-2.svg"
                          alt="close icon"
                          width={20}
                          height={20}
                        />
                      </div>{" "}
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
          <div
            className={`mobile-menu absolute top-0 left-0 z-[99999] px-8 pt-4 pb-8 rounded-br-[10px] bg-white ${
              isMobileMenuOpen ? "open-menu" : ""
            }`}
          >
            <button
              className="close-trigger ml-auto w-[16px] block cursor-pointer h-[16px] relative right-[-16px]"
              onClick={closeMobileMenu}
            >
              <Image
                src="/images/Close.svg"
                alt="navbar trigger close"
                width={16}
                height={16}
              />
            </button>
            <div className="navbar-right-cont">
              <ul className="navbar-nav">
                <li className="navbar-nav-items block">
                  <a
                    href="/"
                    className="py-4 border-b border-b-[#00000010] block text-dark !text-left"
                  >
                    Home
                  </a>
                </li>
                <li className="navbar-nav-items block">
                  <a
                    href="/find-work"
                    className="py-4 border-b border-b-[#00000010] block text-dark !text-left"
                  >
                    Find Work
                  </a>
                </li>
                <li className="navbar-nav-items block">
                  <a
                    href="/find-talent"
                    className="py-4 border-b border-b-[#00000010] block text-dark !text-left"
                  >
                    Find Talent
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SecondNav;
