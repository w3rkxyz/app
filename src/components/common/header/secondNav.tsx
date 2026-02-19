"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import getLensAccountData from "@/utils/getLensProfile";
import useSearchAccounts from "@/hooks/useSearchAccounts";
import { SVGGear, SVGLogout, SVGSearch, SVGUser, SVGUserProfile } from "@/assets/list-svg-icon";
import { Bell, ChevronDown, X } from "lucide-react";

const SecondNav = () => {
  const { user: profile } = useSelector((state: any) => state.app);
  const router = useRouter();
  const profileImage = profile?.picture || "https://static.hey.xyz/images/default.png";
  const profileHandle = profile?.handle || "@user";
  const profileName =
    profile?.displayName || profile?.handle?.replace(/^@/, "") || "User";
  const profileLink =
    profile?.userLink || (profile?.handle ? profile.handle.replace(/^@/, "") : "");
  const myDivRef = useRef<HTMLDivElement>(null);
  const drowdownRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const path = usePathname();
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { data: accounts, loading: accountsLoading } = useSearchAccounts({
    filter: {
      searchBy: {
        localNameQuery: searchText,
      },
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (myDivRef.current && !myDivRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openProfileDropdown = () => {
    setShowProfileDropdown(true);
  };

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };

  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      if (drowdownRef.current && !drowdownRef.current.contains(event.target as Node)) {
        closeProfileDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutsideModal);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideModal);
    };
  }, []);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleGoToProfile = () => {
    if (!profileLink) return;
    setIsProfileDropdownOpen(false);
    router.push(`/u/${profileLink}`);
  };

  const handleGoToSettings = () => {
    setIsProfileDropdownOpen(false);
    router.push("/settings");
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchText("");
    setShowSearchResults(false);
  };

  const handleSelectAccount = (handle: string) => {
    if (!handle) return;
    setShowSearchResults(false);
    setSearchText("");
    setIsSearchOpen(false);
    router.push(`/u/${handle}`);
  };

  useEffect(() => {
    if (searchText !== "") {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchText]);
  

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsProfileDropdownOpen(false);
        }
      };
  
      if (isProfileDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isProfileDropdownOpen]);

  return (
    <>
      <header className="header-section h-[60px] mx-auto nav-lg:px-[100px] lg:px-[20px] sm:px-[16px] absolute w-screen top-0 left-0 bg-white border-b-[1px] border-b-[#EEEEEE] z-[998]">
        <div className="custom-container">
          <div className="header-wrapper">
            <nav className="navbar-nav-main h-[60px] flex items-center gap-3 justify-between w-full relative">
              <div className="header-brand-box flex items-center gap-12">
                <Link href="/">
                  <Image
                    src="/images/brand-logo.svg"
                    className="relative h-[80px] w-[80px] translate-y-[5px]"
                    width={80}
                    height={80}
                    alt="company brand logo"
                  ></Image>
                </Link>
                <div className="navbar-right-cont nav-center flex items-center">
                  <ul className="navbar-nav flex items-center flex-grow-0 sm:hidden mx-auto gap-[7px]">
                    <li
                      className={`navbar-nav-items px-[12px] md:px-[3px] py-[5px] ${
                        path === "/find-work/" ? "text-[#212121] font-semibold" : "text-[#8A8A8A] "
                      }`}
                    >
                      <Link href="/find-work" className="">
                        Find Work
                      </Link>
                    </li>
                    <li
                      className={`navbar-nav-items px-[12px] md:px-[5px] py-[7px] ${
                        path === "/find-talent/" ? "text-[#212121] font-semibold" : "text-[#8A8A8A]"
                      }`}
                    >
                      <Link href="/find-talent" className="">
                        Find Talent
                      </Link>
                    </li>
                    <li
                      className={`navbar-nav-items px-[12px] md:px-[5px] py-[7px] ${
                        path === "/contracts/" ? "text-[#212121] font-semibold" : "text-[#8A8A8A]"
                      }`}
                    >
                      <Link href="/contracts" className="">
                        My Jobs
                      </Link>
                    </li>
                    <li
                      className={`navbar-nav-items px-[12px] md:px-[5px] py-[7px] ${
                        path === "/messages/" ? "text-[#212121] font-semibold" : "text-[#8A8A8A]"
                      }`}
                    >
                      <Link href="/messages" className="">
                        Messages
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              {/* <div className="navbar-right-cont nav-center flex items-center absolute md:relative md:w-fit h-full w-full left-0 top-0 z-0">
                <ul className="navbar-nav flex items-center flex-grow-0 sm:hidden mx-auto gap-[7px]">
                  <li
                    className={`navbar-nav-items px-[19px] md:px-[3px] py-[5px] ${
                      path === "/find-work/" ? "selected-path" : ""
                    }`}
                  >
                    <Link href="/find-work" className="">
                      Find Work
                    </Link>
                  </li>
                  <li
                    className={`navbar-nav-items px-[19px] md:px-[5px] py-[7px] ${
                      path === "/find-talent/" ? "selected-path" : ""
                    }`}
                  >
                    <Link href="/find-talent" className="">
                      Find Talent
                    </Link>
                  </li>
                </ul>
              </div> */}

              <div className="navbar-right-cont flex items-center gap-3">
                              <div className="relative" ref={myDivRef}>
                                <div
                                  className={`flex items-center overflow-hidden rounded-full border border-[#C3C7CE] bg-white transition-all duration-300 ease-in-out ${
                                    isSearchOpen
                                      ? "h-8 w-[280px] px-3 py-1"
                                      : "h-8 w-8 justify-center"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    aria-label="Search users"
                                    className="flex h-6 w-6 items-center justify-center"
                                    onClick={e => {
                                      e.stopPropagation();
                                      if (!isSearchOpen) openSearch();
                                    }}
                                  >
                                    <SVGSearch />
                                  </button>
                                  <input
                                    className={`bg-transparent text-sm text-[#212121] outline-none placeholder:text-[#A3A3A3] transition-all duration-200 ${
                                      isSearchOpen
                                        ? "ml-2 w-[200px] opacity-100"
                                        : "ml-0 w-0 opacity-0 pointer-events-none"
                                    }`}
                                    placeholder="Search Lens users"
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                    autoFocus={isSearchOpen}
                                  />
                                  <button
                                    type="button"
                                    aria-label="Close search"
                                    className={`flex items-center justify-center text-[#818181] transition-all duration-200 hover:text-[#212121] ${
                                      isSearchOpen
                                        ? "ml-2 h-5 w-5 opacity-100"
                                        : "ml-0 h-0 w-0 opacity-0 pointer-events-none"
                                    }`}
                                    onClick={closeSearch}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                                {isSearchOpen && searchText !== "" && (
                                  <div className="absolute right-0 mt-2 max-h-[320px] w-[320px] overflow-y-auto rounded-[12px] border border-[#E4E4E7] bg-white py-2 shadow-lg z-[1200]">
                                    {accountsLoading ? (
                                      <div className="px-3 py-2 text-sm text-[#818181]">Searching users...</div>
                                    ) : accounts.length > 0 ? (
                                      accounts.slice(0, 8).map(acc => {
                                        const accountProfile = getLensAccountData(acc);
                                        return (
                                          <button
                                            type="button"
                                            key={acc.address}
                                            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#F5F5F5]"
                                            onClick={() => handleSelectAccount(accountProfile.userLink)}
                                          >
                                            <Image
                                              src={accountProfile.picture || "https://static.hey.xyz/images/default.png"}
                                              alt="user"
                                              width={32}
                                              height={32}
                                              className="h-8 w-8 rounded-full object-cover"
                                            />
                                            <div className="min-w-0">
                                              <p className="truncate text-sm font-semibold text-[#212121]">
                                                {accountProfile.displayName || accountProfile.userLink}
                                              </p>
                                              <p className="truncate text-xs text-[#818181]">
                                                {accountProfile.handle || "@user"}
                                              </p>
                                            </div>
                                          </button>
                                        );
                                      })
                                    ) : (
                                      <div className="px-3 py-2 text-sm text-[#818181]">No users found</div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                aria-label="Notifications"
                                onClick={() => router.push("/notifications")}
                                className="border border-[#C3C7CE] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100"
                              >
                                <Bell strokeWidth={1} size={20} />
                              </button>
              
                              {/* Profile Dropdown */}
                              <div className="relative" ref={dropdownRef}>
                                <button
                                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                  className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#E0E0E0] hover:bg-gray-50 transition-colors"
                                >
                                  <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0">
                                    <Image
                                      src={profileImage}
                                      alt="profile"
                                      width={24}
                                      height={24}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-[#212121]  sm:inline">
                                    {profileHandle}
                                  </span>
                                  <ChevronDown
                                    size={16}
                                    className={`text-[#818181] transition-transform ${
                                      isProfileDropdownOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
              
                                {/* Dropdown Menu */}
                                {isProfileDropdownOpen && (
                                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[#E0E0E0] py-3 z-50">
                                    {/* User Header */}
                                    <div className="px-4 pb-3 border-b border-[#E0E0E0] flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0">
                                        <Image
                                          src={profileImage}
                                          alt="profile"
                                          width={40}
                                          height={40}
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-[#212121] truncate">
                                          {profileName}
                                        </p>
                                        <p className="text-sm text-[#818181] truncate">
                                          {profileHandle}
                                        </p>
                                      </div>
                                    </div>
              
                                    {/* Menu Items */}
                                    <button
                                      onClick={handleGoToProfile}
                                      className="w-full px-4 py-2 text-left text-sm text-[#212121] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                      <SVGUser />
                                      Profile
                                    </button>
                                    <button
                                      onClick={handleGoToSettings}
                                      className="w-full px-4 py-2 text-left text-sm text-[#212121] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                      <SVGGear />
                                      Settings
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-sm text-[#212121] hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                      <SVGUserProfile />
                                      Switch Profile
                                    </button>
              
                                    {/* Logout */}
                                    <div className="border-t border-[#E0E0E0] mt-2 pt-2">
                                      <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium">
                                        <SVGLogout />
                                        Log Out
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* <Connect /> */}
                            </div>

              {/* Right Items */}
              {/* <div className="flex items-center gap-[18px] sm:hidden relative z-10">
                <div
                  className="flex justify-start items-center w-[240px] lg:w-[220px] bg-white border-[1px] border-[#E4E4E7] rounded-[12px] pl-[8px] relative"
                  ref={myDivRef}
                >
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
                      onChange={e => {
                        setSearchText(e.target.value);
                      }}
                      value={searchText}
                    />
                  </>
                  <button className="search-button pr-[9px]" onClick={() => setSearchText("")}>
                    <Image
                      className="cursor-pointer"
                      src="/images/Close.svg"
                      alt="close icon"
                      width={20}
                      height={20}
                    />
                  </button>
                  {accounts && accounts.length > 0 && searchText !== "" && showSearchResults ? (
                    <div
                      className={`user-search-box mt-[0px] flex flex-col gap-[5px] absolute z-[9999] left-0 top-[47px] rounded-[10px] border-[1px] border-[#E4E4E7] bg-white py-[10px]`}
                      onClick={e => e.stopPropagation()}
                    >
                      {accounts.slice(0, 7).map((acc, index) => {
                        const profile = getLensAccountData(acc);
                        return (
                          <Link href={`/u/${profile.userLink}`} key={index}>
                            <div
                              className="text-[14px] hover:bg-[#f1f1f1] w-full gap-[8px] flex items-center cursor-pointer px-[10px] py-[8px]"
                              key={index}
                            >
                              <div className="circle-div relative bg-gray-200 dark:border-gray-700">
                                <Image
                                  src={profile.picture}
                                  onError={e => {
                                    (e.target as HTMLImageElement).src =
                                      "https://static.hey.xyz/images/default.png";
                                  }}
                                  fill
                                  className="circle-div relative bg-gray-200 dark:border-gray-700"
                                  alt="user icon"
                                />
                              </div>
                              <span className="text-[14px] text-black mt-[1px]">
                                {profile.displayName !== "" ? profile.displayName : `Display Name`}
                              </span>
                              <span className="text-[13px] text-[#c1c0c0] mt-[1px]">
                                {profile.handle !== "" ? profile.handle : "@lenshandle"}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : accountsLoading && searchText !== "" ? (
                    <div
                      className={`user-search-box mt-[0px] flex flex-col absolute top-[47px] left-0 rounded-[10px] border-[1px] border-[#E4E4E7] bg-white py-[10px] align-middle items-center`}
                      onClick={e => e.stopPropagation()}
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
                      <span className="font-bold text-[14px] mt-[6px]">Searching Users</span>
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
                        src={profile.picture}
                        fill
                        className="rounded-[8px] sm:rounded-[8.16px] relative mt-[2px]"
                        alt="user icon"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            "https://static.hey.xyz/images/default.png";
                        }}
                      />
                    </div>
                  </button>

                  <div className="absolute right-[0px] top-[55px] z-[9999]" ref={drowdownRef}>
                    {showProfileDropdown && (
                      <>
                        <ProfileDropdown />
                      </>
                    )}
                  </div>
                </div>
              </div> */}
              <div className="navbar-trigger hidden sm:block" onClick={handleMobileMenuToggle}>
                {/* <Image
                  src="/images/header-trigger.svg"
                  alt="navbar trigger"
                  width={20}
                  height={12}
                /> */}
              </div>
            </nav>

            {/* Mobile Menu */}
            {/* <MobileProfileDropdown menuOpen={isMobileMenuOpen} closeMenu={handleMobileMenuToggle} /> */}
          </div>
        </div>
        {/* Choose Account Modal */}
      </header>
      {/* {loginModal && address && <LoginForm owner={address} />} */}
    </>
  );
};

export default SecondNav;
