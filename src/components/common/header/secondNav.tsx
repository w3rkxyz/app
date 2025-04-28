"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ProfileDropdown from "@/components/ProfileDropdown/ProfileDropdown";
import { usePathname } from "next/navigation";
import MobileProfileDropdown from "./mobileMenu";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import { LimitType, SessionType, Profile, useSession, Session } from "@lens-protocol/react-web";
import { Oval } from "react-loader-spinner";
import getLensProfileData, {
  getLensAccountData,
  UserProfile,
  AccountData,
} from "@/utils/getLensProfile";
import { fetchAccounts } from "@lens-protocol/client/actions";
import { client } from "@/client";

const SecondNav = ({ session }: { session: Session }) => {
  // const { loginModal, user: profile } = useSelector((state: any) => state.app);
  const myDivRef = useRef<HTMLDivElement>(null);
  const drowdownRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  const [profile, setProfile] = useState<Profile>();
  // const { data: session, loading: sessionLoading } = useSession();
  const [profileData, setProfileData] = useState<UserProfile>();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const path = usePathname();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
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
      userLink: string;
    }[]
  >([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (myDivRef.current && !myDivRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (myDivRef.current && !myDivRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
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

  const searchProfiles = async (query: string) => {
    if (!query) {
      setProfiles([]);
      return;
    }

    setLoading(true);
    console.log(query);
    try {
      const result = await fetchAccounts(client, {
        filter: {
          searchBy: {
            localNameQuery: query,
          },
        },
      });

      if (result.isErr()) {
        console.error(result.error);
        setLoading(false);
        return;
      }

      console.log("Result: ", result);

      const { items } = result.value;

      const temp: {
        picture: string;
        coverPicture: string;
        displayName: string;
        handle: string;
        bio: string;
        attributes: any;
        id: any;
        profile: Profile;
        userLink: string;
      }[] = [];

      items.forEach(account => {
        const accountData = getLensAccountData(account);

        // Create a profile object for compatibility with existing UI
        const profileObj = {
          id: account.username?.id || "",
          handle: account.username,
          metadata: account.metadata,
        } as Profile;

        if (accountData.handle !== "") {
          temp.push({
            ...accountData,
            profile: profileObj,
          });
        }
      });

      setProfiles(temp);
    } catch (error) {
      console.error("Error searching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchText) {
      const debounceTimer = setTimeout(() => {
        searchProfiles(searchText);
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setProfiles([]);
    }
  }, [searchText]);

  useEffect(() => {
    if (session?.type === SessionType.WithProfile) {
      const profile = session.profile;

      const profileData = getLensProfileData(profile);
      setProfile(profile);
      setProfileData(profileData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.type, session?.authenticated]);

  return (
    <>
      <header className="header-section h-[60px] px-[156px] nav-lg:px-[100px] lg:px-[20px] sm:px-[16px] absolute w-screen top-0 left-0 bg-white border-b-[1px] border-b-[#EEEEEE] z-[998]">
        <div className="custom-container">
          <div className="header-wrapper">
            <nav className="navbar-nav-main h-[60px] flex items-center gap-3 justify-between w-full relative">
              <div className="header-brand-box sm:flex sm:items-center relative z-10">
                <Link href="/">
                  <Image
                    src="/images/brand-logo.svg"
                    className="relative h-[80px] w-[80px] translate-y-[5px]"
                    width={80}
                    height={80}
                    alt="company brand logo"
                  ></Image>
                </Link>
              </div>
              <div className="navbar-right-cont nav-center flex items-center absolute md:relative md:w-fit h-full w-full left-0 top-0 z-0">
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
              </div>

              {/* Right Items */}
              <div className="flex items-center gap-[18px] sm:hidden relative z-10">
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
                        setShowSearchResults(true);
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
                  {profiles && profiles.length > 0 && searchText !== "" && showSearchResults ? (
                    <div
                      className={`user-search-box mt-[0px] flex flex-col gap-[5px] absolute z-[9999] left-0 top-[47px] rounded-[10px] border-[1px] border-[#E4E4E7] bg-white py-[10px]`}
                      onClick={e => e.stopPropagation()}
                    >
                      {profiles.slice(0, 7).map((profile, index) => {
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
                                      `https://api.hey.xyz/avatar?id=${profile.id}`;
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
                  ) : loading && searchText !== "" && showSearchResults ? (
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
                        src={profileData ? profileData.picture : "/images/paco-square.svg"}
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            `https://api.hey.xyz/avatar?id=${profileData?.id}`;
                        }}
                        fill
                        className="rounded-[8px] sm:rounded-[8.16px] relative mt-[2px]"
                        alt="user icon"
                      />
                    </div>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-[0px] top-[55px] z-[9999]" ref={drowdownRef}>
                    {showProfileDropdown && (
                      <>
                        <ProfileDropdown handle={profile?.handle ? profile.handle : undefined} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="navbar-trigger hidden sm:block" onClick={handleMobileMenuToggle}>
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
              profilePic={profileData ? profileData.picture : "/images/paco-square.svg"}
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
