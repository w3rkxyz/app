"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

import MyButton from "@/components/reusable/Button/Button";

import Sidebar from "@/components/reusable/Sidebar/Sidebar";
import Link from "next/link";

type Props = {
  handleCloseModal?: () => void;
  type: string;
  closeJobCardModal?: () => void;
};

const ProfileModal = ({ handleCloseModal, closeJobCardModal, type }: Props) => {
  const myDivRef = useRef<HTMLDivElement>(null);
  const tagModalRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tokenModalRef = useRef<HTMLDivElement>(null);
  const [showMobile, setShowMobile] = useState(false);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [showTokens, setShowTokens] = useState(false);

  const handleTagClick = (id: number) => {
    setSelectedTag(selectedTag === id ? null : id);
  };

  useEffect(() => {
    setShowMobile(true);

    function handleClickOutside(event: MouseEvent) {
      if (
        myDivRef.current &&
        !myDivRef.current.contains(event.target as Node)
      ) {
        if (handleCloseModal) {
          handleCloseModal();
        } else if (closeJobCardModal) {
          closeJobCardModal();
        }
      } else if (tagModalRefs.current) {
        let clickedOutside = true;
        for (let i = 0; i < tagModalRefs.current.length; i++) {
          if (tagModalRefs.current[i]?.contains(event.target as Node)) {
            clickedOutside = false;
            break;
          }
        }
        if (clickedOutside) {
          setSelectedTag(null);
        }
      }

      if (
        tokenModalRef.current &&
        !tokenModalRef.current.contains(event.target as Node)
      ) {
        setShowTokens(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  return (
    <div
      className={`view-job-modal-section sm:w-full rounded-[12px] sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white nav-space sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""}`}
      ref={myDivRef}
    >
      <div className="w-[664px] sm:w-full flex justify-between items-center px-[16px] py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
        <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
          {type === "job" ? "Create a Job Post" : "Create a Service Listing"}
        </span>
        <Image
          onClick={handleCloseModal}
          className="cursor-pointer"
          src="/images/Close.svg"
          alt="close icon"
          width={20}
          height={20}
        />
      </div>
      <div className="bg-[white] rounded-[12px] sm:rounded-none p-[16px] sm:w-full max-w-[664px] flex flex-col">
        <div className="flex flex-col gap-[4px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            {type === "job" ? "Job Title" : "Service Title"}
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Title your post.."
          />
        </div>
        <div className="flex flex-col gap-[4px] sm:gap-[6px] mb-[16px]">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Description
          </span>
          <textarea
            className="form-input rounded-[12px] p-[11px] h-[160px] border-[1px] border-[#E4E4E7] resize-none sm:w-full"
            placeholder="Type a description.."
          />
        </div>
        <div className="flex gap-[10px] mb-[16px]">
          <div className="w-[100px]">
            <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
              Hourly Rate
            </span>
            <input
              className="form-input rounded-[8px] px-[11px] py-[7px] border-[1px] border-[#E4E4E7]"
              placeholder="$ /hr..."
            />
          </div>
          <span className="mt-[26px] text-[#707070]">or</span>
          <div className="w-[100px]">
            <span className="leading-[14.52px] text-[14px] font-medium text-[#E4E4E7]">
              Fixed Price
            </span>
            <input
              className="form-input rounded-[8px] px-[11px] py-[7px] border-[1px] border-[#E4E4E7]"
              placeholder="$ Amount..."
            />
          </div>
        </div>
        <div className="w-[100px] sm:w-full mb-[16px]">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            {type === "job" ? "Paid In" : "Tokens Accepted"}
          </span>
          <button
            className="w-[250px] sm:w-full rounded-[8px] border-[1px] border-[#E4E4E7] p-[7px] flex justify-between items-center relative"
            onClick={() => setShowTokens(true)}
          >
            <span className="font-normal leading-[14.52px] text-[12px] text-[#707070]">
              Select Tokens
            </span>
            <Image
              src="/images/drop-down.svg"
              alt="drop-down icon"
              width={20}
              height={20}
            />
            <div
              className={`find-work-message-section w-[100%] bg-[#FFFFFF] rounded-[8px] p-[16px] sm:items-start gap-[6px] absolute top-[100%] sm:top-[-265px] left-0
              border-[1px] border-[#E4E4E7] ${
                showTokens ? "flex" : "hidden"
              } flex-col z-[999]`}
              ref={tokenModalRef}
            >
              <button className="flex gap-[8px] items-center">
                <Image
                  src="/images/btc.svg"
                  alt="token icon"
                  width={20}
                  height={20}
                />
                <span className="font-medium text-[11px] leading-[20px] text-black">
                  Bitcoin (BTC)
                </span>
              </button>
              <button className="flex gap-[8px] items-center">
                <Image
                  src="/images/eth.svg"
                  alt="token icon"
                  width={20}
                  height={20}
                />
                <span className="font-medium text-[11px] leading-[20px] text-black">
                  Ethereum (ETH)
                </span>
              </button>
              <button className="flex gap-[8px] items-center">
                <Image
                  src="/images/usdt.svg"
                  alt="token icon"
                  width={20}
                  height={20}
                />
                <span className="font-medium text-[11px] leading-[20px] text-black">
                  Tether (USDT)
                </span>
              </button>
              <button className="flex gap-[8px] items-center">
                <Image
                  src="/images/bnb.svg"
                  alt="token icon"
                  width={20}
                  height={20}
                />
                <span className="font-medium text-[11px] leading-[20px] text-black">
                  BNB (BNB)
                </span>
              </button>
              <button className="flex gap-[8px] items-center">
                <Image
                  src="/images/solana.svg"
                  alt="token icon"
                  width={20}
                  height={20}
                />
                <span className="font-medium text-[11px] leading-[20px] text-black">
                  Solana (SOL)
                </span>
              </button>
              <button className="flex gap-[8px] items-center">
                <Image
                  src="/images/usdc.svg"
                  alt="token icon"
                  width={20}
                  height={20}
                />
                <span className="font-medium text-[11px] leading-[20px] text-black">
                  USDC (USDC)
                </span>
              </button>
              <button className="flex gap-[8px] items-center">
                <Image
                  src="/images/dai.svg"
                  alt="token icon"
                  width={20}
                  height={20}
                />
                <span className="font-medium text-[11px] leading-[20px] text-black">
                  Dai (DAI)
                </span>
              </button>
              <button className="flex gap-[8px] items-center">
                <Image
                  src="/images/green-coin.svg"
                  alt="token icon"
                  width={20}
                  height={20}
                />
                <span className="font-medium text-[11px] leading-[20px] text-black">
                  GHO (GHO)
                </span>
              </button>
              <button className="flex gap-[8px] items-center">
                <Image
                  src="/images/bw-coin.svg"
                  alt="token icon"
                  width={20}
                  height={20}
                />
                <span className="font-medium text-[11px] leading-[20px] text-black">
                  Bonsai (BONSAI)
                </span>
              </button>
            </div>
          </button>
        </div>
        <span className="leading-[14.52px] text-[14px] font-medium text-[black] mb-[4px]">
          Select Tags
        </span>
        <div className="flex sm:flex-col sm:gap-[10px] justify-between sm:justify-start mb-[24px]">
          {[1, 2, 3].map((id) => (
            <button
              key={id}
              className="rounded-[8px] border-[1px] border-[#E4E4E7] p-[7px] flex justify-between items-center w-[200px] relative"
              onClick={() => handleTagClick(id)}
            >
              <span className="font-normal leading-[14.52px] text-[12px] text-[#707070]">
                Add Tag
              </span>
              <Image
                src="/images/plus.svg"
                alt="drop-down icon"
                width={20}
                height={20}
              />
              <div
                className={`find-work-message-section w-[206px] bg-[#FFFFFF] rounded-[8px] p-[8px] sm:items-center gap-[3px] absolute top-[-575px] sm:top-[-478px] left-0
              border-[1px] border-[#E4E4E7] ${
                selectedTag === id ? "flex" : "hidden"
              } flex-col z-[999]`}
                ref={(el) => (tagModalRefs.current[id] = el)}
              >
                <MyButton
                  buttonText="Blockchain Development"
                  buttonType="secondary"
                  buttonStyles="bg-[#FFC2C2] mb-[8px] sm:font-bold sm:text-[10px] sm:leading-[11px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="Programming & Development"
                  buttonType="secondary"
                  buttonStyles="bg-[#FFD8C2] mb-[8px] sm:font-bold sm:text-[10px] sm:leading-[11px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="Design"
                  buttonType="secondary"
                  buttonStyles="bg-[#FFF2C2] mb-[8px] w-[150px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="Marketing"
                  buttonType="secondary"
                  buttonStyles="bg-[#EFFFC2] mb-[8px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="Admin Support"
                  buttonType="secondary"
                  buttonStyles="bg-[#C2FFC5] mb-[8px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="Customer Service"
                  buttonType="secondary"
                  buttonStyles="bg-[#C2FFFF] mb-[8px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="IT & Networking"
                  buttonType="secondary"
                  buttonStyles="bg-[#C2EAFF] mb-[8px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="Writing"
                  buttonType="secondary"
                  buttonStyles="bg-[#C2D1FF] mb-[8px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="Translation"
                  buttonType="secondary"
                  buttonStyles="bg-[#E3C2FF] mb-[8px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="Legal"
                  buttonType="secondary"
                  buttonStyles="bg-[#FFC2E5] mb-[8px] sm:w-full"
                ></MyButton>
                <MyButton
                  buttonText="Engineering & Architecture"
                  buttonType="secondary"
                  buttonStyles="bg-[#DDDDDD] mb-[8px] sm:w-full"
                ></MyButton>
              </div>
            </button>
          ))}
        </div>
        <button className="mx-auto w-fit py-[8px] px-[23px] tx-[14px] leading-[14.5px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]">
          Post
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
