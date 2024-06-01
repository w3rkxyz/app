"use client";

import React, { useEffect, useState } from "react";

import JobCard from "@/components/JobCard/JobCard";
import Image from "next/image";
import ViewListingModal from "../view-listing-modal/view-listing-modal";
import ViewJobModal from "../view-job-modal/view-job-modal";
import Link from "next/link";

const OtherUserFollowing = () => {
  const [selectedJobName, setSelectedJobName] = useState("");
  const [isJobCardOpen, setIsJobCardOpen] = useState(false);

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

  return (
    <div className="other-user-following-section pt-[105px] pb-10">
      <div className="custom-container">
        <div className="tags-section flex sm:flex-col justify-center items-center md:items-start gap-[25px] mt-7">
          <div>
            <div className="sm:hidden">
              <div className="w-[250px] h-[744px] flex-shrink-0 sm:w-full sm:h-auto bg-[#FFFFFF] rounded-[20px] py-[26px] px-[25px]">
                <div className="flex justify-center items-center">
                  <div className="w-[120px] h-[110px] bg-[#FFFFFF]/70 flex justify-center items-center rounded-[16px]">
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
                  <p className="text-[14px] font-semibold mt-5 mb-3 text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                    Job Title
                  </p>
                  <div className="flex justify-around items-center">
                    <div>
                      <p className="text-[14px] font-semibold text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                        Following
                      </p>
                      <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
                        100
                      </p>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                        Followers
                      </p>
                      <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
                        735
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-[5px] my-[22px]">
                  <button className="w-[34px] h-[34px] rounded-[10px] bg-[#A274FF80] hover:bg-[#120037] duration-300 text-white font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] flex justify-center items-center gap-[9px] ">
                    <Image
                      src="/images/man-icon.svg"
                      alt="man icon"
                      width={19}
                      height={19}
                    />{" "}
                  </button>
                  <button className="w-[93px] h-[34px] rounded-[10px] bg-white text-[#000000] font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] hover:bg-[#120037] duration-300 hover:text-white">
                    <Link href="/my-message">Message</Link>
                  </button>
                </div>

                <div>
                  <p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
                    About Me
                  </p>
                  <p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
                    bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla
                    bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla
                    bla bla
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
                    <div className="w-[120px] h-[110px] bg-[#FFFFFF]/70 flex justify-center items-center rounded-[16px]">
                      <div className="items-center">
                        <Image
                          src="/images/head.svg"
                          alt="head image"
                          className="w-[65px] h-[65px] mb-2 "
                          width={65}
                          height={65}
                        />
                        <p className="text-[14px] font-secondary text-center font-bold leading-[17.6px] ml-[-5px]">
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
                  <button className="w-[34px] h-[34px] rounded-[10px] bg-[#A274FF80] text-white font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] flex justify-center items-center gap-[9px] ">
                    <Image
                      src="/images/man-icon.svg"
                      alt="man icon"
                      width={19}
                      height={19}
                    />{" "}
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

export default OtherUserFollowing;
