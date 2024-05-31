"use client";

import {
  useProfile,
  useFollow,
  useSession,
  Profile,
  SessionType,
  TriStateValue,
} from "@lens-protocol/react-web";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import JobCard from "@/components/JobCard/JobCard";
import Image from "next/image";
import ViewJobModal from "../view-job-modal/view-job-modal";
import ViewListingModal from "../view-listing-modal/view-listing-modal";
import Link from "next/link";

const OtherUserFollow = () => {
  const [selectedJobName, setSelectedJobName] = useState("");
  const [isJobCardOpen, setIsJobCardOpen] = useState(false);
  const { data: profile, loading } = useProfile({
    forHandle: "lens/handle44",
  });
  const { data: session, loading: sessionLoading } = useSession();
  const { execute: follow, loading: followLoading } = useFollow();
  const [userData, setUserData] = useState<any>({
    handle: "adam.lens",
    picture: "/images/head.svg",
    following: 100,
    followers: 75,
    about:
      "bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla",
  });

  const handleJobCardOpen = (jobName: string) => {
    setIsJobCardOpen(true);
    setSelectedJobName(jobName);
  };
  const handleJobCardClose = () => {
    setIsJobCardOpen(false);
  };

  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      if (
        isJobCardOpen &&
        (event.target as HTMLElement).closest(".modal-content") === null
      ) {
        handleJobCardClose();
      }
    };

    document.addEventListener("click", handleClickOutsideModal);

    return () => {
      document.removeEventListener("click", handleClickOutsideModal);
    };
  }, [isJobCardOpen]);

  useEffect(() => {}, [profile]);

  const handleFollow = async () => {
    if (profile) {
      if (profile.operations.canFollow === "NO") {
        toast.error("Must navigate here from homepage");
        return null;
      }

      if (session?.type === SessionType.WithProfile) {
        const result = await follow({ profile });

        if (result.isFailure()) {
          // handle failure scenarios
          toast.error("couldn't follow user, try again later");
          return;
        }

        // this might take a while depending on the congestion of the network
        const completion = await result.value.waitForCompletion();

        if (completion.isFailure()) {
          console.log(
            "There was an error processing the transaction",
            completion.error.message
          );
          return;
        }

        toast.success("Followed successfully");
      }
    }
  };

  return (
    <div className="other-user-follow-section pt-[105px] pb-10">
      <div className="custom-container">
        <div className="tags-section flex sm:flex-col justify-center items-center md:items-start gap-[25px] mt-7">
          <div>
            <div className="sm:hidden">
              <div className="w-[250px] h-[744px] flex-shrink-0 sm:w-full sm:h-auto bg-[#FFFFFF] rounded-[20px] py-[26px] px-[25px]">
                <div className="flex justify-center items-center">
                  <div className="w-[120px] h-[110px] bg-[#FFFFFF]/70 flex justify-center items-center rounded-[16px]">
                    <div>
                      <Image
                        src={
                          profile?.metadata?.picture?.raw?.uri ||
                          userData.picture
                        }
                        alt="head image"
                        className="w-[65px] h-[65px] mb-2 "
                        width={65}
                        height={65}
                      />
                      <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] ">
                        {profile?.handle?.localName
                          ? `${profile?.handle?.localName}.${profile?.handle?.namespace}`
                          : "adam.lens"}
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
                        {profile ? profile.stats.following : 100}
                      </p>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                        Followers
                      </p>
                      <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
                        {profile ? profile.stats.followers : 75}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-[5px] my-[22px]">
                  {/* <Link href="/other-user-following"> */}
                  {profile?.operations.isFollowedByMe.value ? (
                    <button className="w-[34px] h-[34px] rounded-[10px] bg-[#A274FF80] hover:bg-[#120037] duration-300 text-white font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] flex justify-center items-center gap-[9px] ">
                      <Image
                        src="/images/man-icon.svg"
                        alt="man icon"
                        width={19}
                        height={19}
                      />{" "}
                    </button>
                  ) : (
                    <button
                      className="w-[93px] h-[34px] rounded-[10px] bg-[#A274FF80] hover:bg-[#120037] duration-300 text-white font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] flex justify-center items-center gap-[9px] "
                      onClick={handleFollow}
                      title={
                        profile?.operations.canFollow === TriStateValue.Yes
                          ? "Click to follow"
                          : "Unfollow request not finalized yet"
                      }
                    >
                      <Image
                        src="/images/man-icon.svg"
                        alt="man icon"
                        width={19}
                        height={19}
                      />{" "}
                      Follow
                    </button>
                  )}
                  {/* </Link> */}
                  <button className="w-[93px] h-[34px] rounded-[10px] bg-white text-[#000000] font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] hover:bg-[#120037] duration-300 hover:text-white">
                    <Link href="/my-message">Message</Link>
                  </button>
                </div>

                <div>
                  <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                    About Me
                  </p>
                  <p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
                    {profile?.metadata?.bio
                      ? profile.metadata.bio
                      : userData.about}
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
                      <a href="/">
                        <Image
                          className="w-[14.13px]  h-[13.18px]"
                          src="/images/twitter-fo.svg"
                          alt="socials icons images"
                          width={14.13}
                          height={13.18}
                        />
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="mt-3">
                  <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                    Accepted Tokens
                  </p>
                  <ul className="socials-widgets gap-[5px] flex mt-1">
                    <li className="socials-widgets-items">
                      <a href="/">
                        <Image
                          className="w-[28px] h-[28px] bg-[#F7931A] p-1 rounded-full"
                          src="/images/token-1.svg"
                          alt="socials icons images"
                          width={28}
                          height={28}
                        />
                      </a>
                    </li>
                    <li className="socials-widgets-items">
                      <a href="/">
                        <Image
                          className="w-[28px]  h-[28px]"
                          src="/images/token2.svg"
                          alt="socials icons images"
                          width={28}
                          height={28}
                        />
                      </a>
                    </li>
                    <li className="socials-widgets-items">
                      <a href="/">
                        <Image
                          className="w-[28px]  h-[28px]"
                          src="/images/token3.svg"
                          alt="socials icons images"
                          width={28}
                          height={28}
                        />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* small screen sidebar */}
            <div className="hidden sm:block">
              <div className="w-full h-auto rounded-[20px] py-[16px] bg-[#FFFFFF] p-5 ">
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
                        <p className="text-[14px] font-bold font-secondary text-center leading-[17.6px] ml-[-5px]">
                          adam.lens
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[14px] font-semibold mb-2  font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                      Job Title
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
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
                            <a href="/">
                              <Image
                                className="w-[14.13px]  h-[13.18px]"
                                src="/images/twitter-fo.svg"
                                alt="socials icons images"
                                width={14.13}
                                height={13.18}
                              />
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div className="">
                        <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                          Accepted Tokens
                        </p>
                        <ul className="socials-widgets gap-[5px] flex mt-1">
                          <li className="socials-widgets-items">
                            <a href="/">
                              <Image
                                className="w-[28px] h-[28px] bg-[#F7931A] p-1 rounded-full"
                                src="/images/token-1.svg"
                                alt="socials icons images"
                                width={28}
                                height={28}
                              />
                            </a>
                          </li>
                          <li className="socials-widgets-items">
                            <a href="/">
                              <Image
                                className="w-[28px]  h-[28px]"
                                src="/images/token2.svg"
                                alt="socials icons images"
                                width={28}
                                height={28}
                              />
                            </a>
                          </li>
                          <li className="socials-widgets-items">
                            <a href="/">
                              <Image
                                className="w-[28px]  h-[28px]"
                                src="/images/token3.svg"
                                alt="socials icons images"
                                width={28}
                                height={28}
                              />
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-[5px] my-[22px]">
                  <button className="w-[93px] h-[34px] rounded-[10px] bg-[#A274FF80] text-white font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] flex justify-center items-center gap-[9px] ">
                    <Image
                      src="/images/man-icon.svg"
                      alt="man icon"
                      width={19}
                      height={19}
                    />{" "}
                    Follow
                  </button>
                  <button className="w-[93px] h-[34px] rounded-[10px] bg-white text-[#000000] font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] ">
                    Message
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="mt-3">
                    <p className="text-[12px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                      About Me
                    </p>
                    <p className="text-[10px] font-semibold  font-secondary leading-[16px] tracking-[-1%] text-[#000000]/50">
                      bla bla bla bla bla bla bla bla bla bla bla bla bla bla
                      bla bla bla bla bla bla bla bla bla bla bla bla bla bla
                      bla bla bla bla
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

          <div className="w-full">
            <JobCard
              jobName="Job Name"
              jobIcon="/images/man.svg"
              cardStyles={"!flex !justify-evenly !items-center"}
              onCardClick={() => handleJobCardOpen("Job Name")}
            />
            <JobCard
              jobName="Service Name"
              jobIcon="/images/man.svg"
              cardStyles={"!flex !justify-evenly !items-center"}
              onCardClick={() => handleJobCardOpen("Service Name")}
            />
            <JobCard
              jobName="Job Name"
              jobIcon="/images/man.svg"
              cardStyles={"!flex !justify-evenly !items-center"}
              onCardClick={() => handleJobCardOpen("Job Name")}
            />
            <JobCard
              jobName="Service Name"
              jobIcon="/images/man.svg"
              cardStyles={"!flex !justify-evenly !items-center"}
              onCardClick={() => handleJobCardOpen("Service Name")}
            />
            <JobCard
              jobName="Job Name"
              jobIcon="/images/man.svg"
              cardStyles={"!flex !justify-evenly !items-center"}
              onCardClick={() => handleJobCardOpen("Job Name")}
            />

            {isJobCardOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
                <div className="w-full">
                  {selectedJobName === "Service Name" ? (
                    <ViewListingModal closeJobCardModal={handleJobCardClose} />
                  ) : selectedJobName === "Job Name" ? (
                    <ViewJobModal closeJobCardModal={handleJobCardClose} />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherUserFollow;
