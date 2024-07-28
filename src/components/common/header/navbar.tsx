"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SecondNav from "./secondNav";
import { Connect } from "./connectButton";
import { useAccount } from "wagmi";
import { LoginForm } from "./loginForm";
import { useSession, SessionType, Profile } from "@lens-protocol/react-web";

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const { isConnected, address } = useAccount();
  const [loginForm, setLoginForm] = useState(false);
  const { data: session, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<Profile>();

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

  const handleConnectWallet = () => {
    setShowNavbar(false);
  };

  // Checks if the user is authenticated on Lens and stores their profile or displays the login modal
  useEffect(() => {
    if (isConnected) {
      if (!session?.authenticated && !sessionLoading) {
        setLoginForm(true);
      } else {
        setLoginForm(false);
        if (session?.type == SessionType.WithProfile) {
          setProfile(session.profile);
        }
      }
    }
  }, [isConnected, session?.authenticated]);

  return (
    <>
      {isConnected && profile ? (
        <SecondNav profile={profile} setProfile={setProfile} />
      ) : (
        <header className="header-section py-[10px] px-[156px] sm:px-[16px] absolute w-full top-0 left-0 bg-white border-b-[1px] border-b-[#EEEEEE] z-[999]">
          <div className="custom-container">
            <div className="header-wrapper">
              <nav className="navbar-nav-main flex items-center gap-3 justify-between w-full">
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
                <div className="navbar-right-cont">
                  <Connect />
                </div>
              </nav>
            </div>
          </div>
        </header>
      )}

      {/* Choose Account Modal */}
      {loginForm && address && (
        <LoginForm
          owner={address}
          setProfile={setProfile}
          onClose={() => setLoginForm(false)}
        />
      )}
    </>
  );
};

export default Navbar;
