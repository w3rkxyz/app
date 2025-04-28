"use client";
import Image from "next/image";
import Link from "next/link";
import { useSession, SessionType } from "@lens-protocol/react-web";
import { useEffect, useState } from "react";

interface height {
  height: string;
}

const defaultUserState = {
  handle: "adam.lens",
  picture: "/images/head.svg",
  following: 100,
  followers: 75,
  about:
    "bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla",
};

const Sidebar = ({ height }: height) => {
  const { data: session, error, loading: sessionLoading } = useSession();
  const [user, setUser] = useState<any>(defaultUserState);

  useEffect(() => {
    if (session?.type == SessionType.WithProfile) {
      setUser({
        handle:
          `${session.profile.handle?.localName}.${session.profile.handle?.namespace}` ||
          user.handle,
        picture:
          session.profile.metadata?.picture?.__typename == "ImageSet"
            ? session.profile.metadata?.picture?.raw.uri
            : user.picture,
        following: session.profile.stats.following,
        followers: session.profile.stats.followers,
        about: session.profile.metadata?.bio || user.about,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading]);

  return (
    <div>
      <div className="sm:hidden">
        <div
          className="w-[250px] flex-shrink-0 sm:w-full sm:h-auto bg-[#FFFFFF] rounded-[20px] py-[26px] px-[25px]"
          style={{ height: height }}
        >
          <div className="flex justify-center items-center">
            <div className="w-[120px] h-[110px] bg-[#FFFFFF]/70 flex justify-center items-center rounded-[16px]">
              <div>
                <Image
                  src={user.picture}
                  alt="head image"
                  className="w-[65px] h-[65px] mb-2 "
                  width={65}
                  height={65}
                />
                <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] ">
                  {user.handle}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[14px] font-semibold mt-5 mb-3 text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
              Job Title
            </p>
            <div className="flex justify-around items-center">
              <div>
                <p className="text-[14px] font-semibold text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                  Following
                </p>
                <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
                  {user.following}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                  Followers
                </p>
                <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
                  {user.followers}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
              About Me
            </p>
            <p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
              {user.about}
            </p>
          </div>

          <div className="mt-3">
            <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
              Skills
            </p>
            <p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
              [skill]
            </p>
            <p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
              [skill]
            </p>
            <p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
              [skill]
            </p>
          </div>

          <div className="mt-3">
            <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
              Links
            </p>
            <ul className="socials-widgets gap-[10px] flex mt-1">
              <li className="socials-widgets-items">
                <Link href="/">
                  <Image
                    className="w-[14.13px]  h-[13.18px]"
                    src="/images/twitter-fo.svg"
                    alt="socials icons images"
                    width={14.13}
                    height={13.18}
                  />
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-3">
            <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
              Accepted Tokens
            </p>
            <ul className="socials-widgets gap-[5px] flex mt-1">
              <li className="socials-widgets-items">
                <Link href="/">
                  <Image
                    className="w-[28px] h-[28px] bg-[#F7931A] p-1 rounded-full"
                    src="/images/token-1.svg"
                    alt="socials icons images"
                    width={28}
                    height={28}
                  />
                </Link>
              </li>
              <li className="socials-widgets-items">
                <Link href="/">
                  <Image
                    className="w-[28px]  h-[28px]"
                    src="/images/token2.svg"
                    alt="socials icons images"
                    width={28}
                    height={28}
                  />
                </Link>
              </li>
              <li className="socials-widgets-items">
                <Link href="/">
                  <Image
                    className="w-[28px]  h-[28px]"
                    src="/images/token3.svg"
                    alt="socials icons images"
                    width={28}
                    height={28}
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* small screen sidebar */}
      <div className="hidden sm:block">
        <div className="w-full h-auto rounded-[20px] py-[16px]">
          <div className="flex gap-5">
            <div className="flex justify-center items-center">
              <div className="w-[120px] h-[110px] bg-[#FFFFFF]/70 flex justify-center items-center rounded-[16px]  left-avatar-shadow">
                <div>
                  <Image
                    src="/images/head.svg"
                    alt="head image"
                    className="w-[65px] h-[65px] mb-2 "
                    width={65}
                    height={65}
                  />
                  <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] ">
                    adam.lens
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[14px] font-semibold mb-2  font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                Job Title
              </p>
              <div className="flex flex-wrap items-center gap-[17px]">
                <div>
                  <p className="text-[10px] font-semibold text-center font-secondary leading-[10px] tracking-[-1%] text-[#000000] mb-1">
                    Following
                  </p>
                  <p className="text-[10px] font-semibold font-secondary leading-[12px] tracking-[-1%] text-[#000000]/50">
                    100
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-center font-secondary leading-[10px] tracking-[-1%] text-[#000000] mb-1">
                    Followers
                  </p>
                  <p className="text-[10px] font-semibold font-secondary leading-[12px] tracking-[-1%] text-[#000000]/50">
                    735
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold font-secondary leading-[10px] tracking-[-1%] text-[#000000] mb-1">
                    Links
                  </p>
                  <ul className="socials-widgets gap-[10px] flex mt-1">
                    <li className="socials-widgets-items">
                      <Link href="/">
                        <Image
                          className="w-[14.13px]  h-[13.18px]"
                          src="/images/twitter-fo.svg"
                          alt="socials icons images"
                          width={14.13}
                          height={13.18}
                        />
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="">
                  <p className="text-[10px] font-semibold font-secondary leading-[10px] tracking-[-1%] text-[#000000]">
                    Accepted Tokens
                  </p>
                  <ul className="socials-widgets gap-[5px] flex mt-1">
                    <li className="socials-widgets-items">
                      <Link href="/">
                        <Image
                          className="w-[20px] h-[20px] bg-[#F7931A] p-1 rounded-full"
                          src="/images/token-1.svg"
                          alt="socials icons images"
                          width={20}
                          height={20}
                        />
                      </Link>
                    </li>
                    <li className="socials-widgets-items">
                      <Link href="/">
                        <Image
                          className="w-[20px]  h-[20px]"
                          src="/images/token2.svg"
                          alt="socials icons images"
                          width={20}
                          height={20}
                        />
                      </Link>
                    </li>
                    <li className="socials-widgets-items">
                      <Link href="/">
                        <Image
                          className="w-[20px]  h-[20px]"
                          src="/images/token3.svg"
                          alt="socials icons images"
                          width={20}
                          height={20}
                        />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mt-3">
              <p className="text-[12px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                About Me
              </p>
              <p className="text-[10px] font-semibold  font-secondary leading-[16px] tracking-[-1%] text-[#000000]/50">
                bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla
                bla bla bla bla bla bla bla bla bla bla bla
              </p>
            </div>

            <div className="mt-3">
              <p className="text-[12px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                Skills
              </p>
              <p className="text-[10px] font-semibold  font-secondary leading-[16px] tracking-[-1%] text-[#000000]/50">
                [skill]
              </p>
              <p className="text-[10px] font-semibold  font-secondary leading-[16px] tracking-[-1%] text-[#000000]/50">
                [skill]
              </p>
              <p className="text-[10px] font-semibold  font-secondary leading-[16px] tracking-[-1%] text-[#000000]/50">
                [skill]
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
