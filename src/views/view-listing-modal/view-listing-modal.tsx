"use client";

import React, { useRef, useEffect } from "react";

import MyButton from "@/components/reusable/Button/Button";

import CloseIcon from "@/icons/CloseIcon";
import Sidebar from "@/components/reusable/Sidebar/Sidebar";
import Link from "next/link";

type Props = {
  closeTalentModal?: () => void;
  closeJobCardModal?: () => void;
};

const ViewListingModal = ({ closeTalentModal, closeJobCardModal }: Props) => {
  const myDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        myDivRef.current &&
        !myDivRef.current.contains(event.target as Node)
      ) {
        if (closeTalentModal) {
          closeTalentModal();
        } else if (closeJobCardModal) {
          closeJobCardModal();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="view-listing-modal-section z-60" ref={myDivRef}>
      <div className="custom-container sm:mt-0">
        <div className="flex justify-center items-center">
          <div className="w-[1110px] bg-[#EFEFEF] pl-[63px] pr-[78px] pt-[47px] pb-[65px] md:p-5 sm:p-5 rounded-[20px] relative">
            <div
              onClick={() => {
                if (closeTalentModal) {
                  closeTalentModal();
                } else if (closeJobCardModal) {
                  closeJobCardModal();
                }
              }}
              className="w-[35px] h-[35px] sm:w-4 sm:h-4 absolute right-[23px] sm:right-[30px] top-[23px] sm:top-[10px]"
            >
              <CloseIcon />
            </div>

            <div className="view-listing-modal-section flex sm:flex-col justify-between">
              <div>
                <Sidebar height="auto" />
              </div>
              <div className="flex-1 pl-[79px] md:pl-5 sm:px-0">
                <h2 className="text-[36px] sm:text-[14px] font-secondary font-semibold leading-[80px] sm:leading-[20px] tracking-[-4%] sm:tracking-[-1] sm:pt-[16px] sm:pb-[24px] text-[#000000]">
                  Listing Name
                </h2>
                <div>
                  <div className="flex sm:flex-col justify-between">
                    <div className="mb-3">
                      <p className="text-[18px] sm:text-[14px] font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] text-[#000000]">
                        Description
                      </p>
                      <p className="text-[16px] h-[64px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-4 tracking-[-3%] sm:tracking-[-1%] text-[#00000080]">
                        [service description]
                      </p>
                    </div>
                    <div>
                      <div className="sm:hidden">
                        <div className="mb-[13px] sm:mb-3">
                          <p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
                            Price
                          </p>
                          <p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#000000]/50">
                            [amount in USD][fixed / hourly]
                          </p>
                        </div>
                        <div className="mb-[13px] sm:mb-3">
                          <p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
                            Accepted Tokens
                          </p>
                          <p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#000000]/50">
                            [amount in USD]
                          </p>
                        </div>
                        <div className="mb-[13px] sm:mb-3">
                          <p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
                            Tags
                          </p>
                          <p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#000000]/50">
                            [select 1-3 tags]
                          </p>
                        </div>
                        <div>
                          <p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
                            Portfolio
                          </p>
                          <p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#000000]/50">
                            [include attachments]
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <div className="flex gap-3">
                          <div>
                            <div className="mb-[13px] sm:mb-3">
                              <p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
                                Price
                              </p>
                              <p className="text-[10px] font-semibold font-secondary leading-[12px] tracking-[-1%] text-[#00000080]">
                                [amount in USD] <span className="pl-3"></span>
                                [fixed / hourly]
                              </p>
                            </div>
                            <div>
                              <p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
                                Portfolio
                              </p>
                              <p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#000000]/50">
                                [include attachments]
                              </p>
                            </div>
                          </div>
                          <div>
                            <div className="mb-[13px] sm:mb-3">
                              <p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
                                Accepted Tokens
                              </p>
                              <p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#000000]/50">
                                [amount in USD]
                              </p>
                            </div>
                            <div className="mb-[13px] sm:mb-3">
                              <p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
                                Tags
                              </p>
                              <p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#000000]/50">
                                [select 1-3 tags]
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:mt-6">
              <div className="flex justify-end sm:justify-center items-center -mt-10 sm:-mt-0">
                <Link href="/other-user-following">
                  <MyButton
                    buttonText="View Profile"
                    buttonType="tertiary"
                    buttonStyles="bg-white text-[#000000] mr-[14.14px] hover:bg-[#120037] hover:text-white duration-300"
                  />
                </Link>
                <Link href="/my-message">
                  <MyButton
                    buttonText="Message"
                    buttonType="tertiary"
                    buttonStyles="bg-[#A274FF]/50 text-white hover:bg-[#120037] duration-300"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewListingModal;
