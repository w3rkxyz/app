"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import MyButton from "@/components/reusable/Button/Button";
import { useAccount } from "wagmi";

type Props = {
  handleCloseModal?: () => void;
};

const AwaitingApprovalContractModal = ({ handleCloseModal }: Props) => {
  const myDivRef = useRef<HTMLDivElement>(null);
  const [showMobile, setShowMobile] = useState(false);
  const [showClientView, setShowClientView] = useState(false);

  useEffect(() => {
    setShowMobile(true);

    function handleClickOutside(event: any) {
      if (
        myDivRef.current &&
        !myDivRef.current.contains(event.target as Node)
      ) {
        if (handleCloseModal) {
          handleCloseModal();
        }
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
      className={`view-job-modal-section sm:w-full rounded-[12px] px-[16px] sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""} h-fit`}
      ref={myDivRef}
    >
      <div className="w-[667px] sm:w-full flex justify-between items-center py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
        <span className="leading-[14.52px] text-[14px] font-semibold text-[black]">
          Work Approval - {showClientView ? "Client" : "Freelancer"}
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
      <div className="bg-[white] rounded-[12px] sm:rounded-none py-[16px] sm:w-full max-w-[664px] flex flex-col">
        <div className="flex sm:flex-col justify-between gap-[8px] sm:gap-[16px] w-full">
          <div className="flex gap-[6px] items-center">
            <Image
              alt="jane cooper"
              src={"images/jane.svg"}
              height={46}
              width={46}
              className="rounded-[8px] w-[46px] h-[46px]"
              onClick={() => setShowClientView(!showClientView)}
            />
            <div className="flex flex-col gap-[0px]">
              <span className="text-[14px] leading-[16.94px] font-semibold">
                Jane Cooper
              </span>
              <span className="text-[14px] leading-[20px] font-normal text-[#5A5A5A]">
                janecooper@gmail.com
              </span>
            </div>
          </div>
          <button className="w-fit sm:w-full h-fit py-[10px] px-[24px] sm:px-[0px] text-[14px] leading-[16.94px] text-black bg-[#E4E4E7] hover:bg-[#351A6B] rounded-[8px] font-semibold">
            Message
          </button>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <h3 className="text-[16px] leading-[19.36px] font-semibold mb-[6px]">
          Website Updates - Full Stack Developer
        </h3>
        <p className="line-clamp-4 sm:line-clamp-6 text-[12px] leading-[20px] font-normal">
          User information can go here along with service offered information,
          total character limit will have to be decided bc we don’t wanna run
          over the limit. User infoormation can go here along with service
          offered information, total character limit will have to be decided bc
          we don’t wanna run over the limit. User infoormation can go here
          along... service offered information, total character limit will have
          to be
        </p>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">
            Client Wallet Address
          </span>
          <span className="text-[12px] leading-[14.52px] font-normal">
            Client Wallet Address
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">
            Freelancer Wallet Address
          </span>
          <span className="text-[12px] leading-[14.52px] font-normal">
            Freelancer Wallet Address
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">
            Payment Amount
          </span>
          <span className="text-[12px] leading-[14.52px] font-normal">
            $100.00
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">
            Due Date
          </span>
          <span className="text-[12px] leading-[14.52px] font-normal">
            21 March 2024
          </span>
        </div>
        <div className="flex flex-col gap-[6px] mt-[16px]">
          <span className="text-[14px] leading-[16.94px] font-medium text-[#351A6B]">
            {showClientView
              ? "Freelancer has requested payment."
              : "Awaiting client approval and payment release"}
          </span>
        </div>
        <div className="relative flex sm:flex-col w-full justify-center sm:items-center gap-[16px] sm:gap-[6px] mt-[30px] sm:mt-[16px]">
          {showClientView && (
            <>
              <button className="w-fit h-fit py-[10px] px-[23px] sm:px-[0px] sm:w-full text-[14px] leading-[14.5px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]">
                Request Extension
              </button>
              <button className="w-fit h-fit py-[10px] px-[23px] sm:px-[0px] sm:w-full text-[14px] leading-[14.5px] text-white bg-[#351A6B] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]">
                Release Payment
              </button>
            </>
          )}
          <button className="w-fit h-fit py-[10px] px-[23px] sm:px-[0px] sm:w-full text-[14px] leading-[14.5px] text-black bg-[#E4E4E7] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]">
            Open A Dispute
          </button>
        </div>
      </div>
    </div>
  );
};

export default AwaitingApprovalContractModal;
