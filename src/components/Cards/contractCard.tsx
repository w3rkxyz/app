"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnyPublication, Post } from "@lens-protocol/react-web";
import getLensProfileData from "@/utils/getLensProfile";

interface CardProps {
  userAvatar?: string;
  username?: string;
  jobName?: string;
  jobIcon?: string;
  cardStyles?: string;
  type: string;
  onClick?: () => void;
  onCardClick?: () => void;
  setType?: any;
  handlePostJobOpen?: () => void;
  publication?: Post;
}

type ContractTypeDetail = {
  text: string;
  buttonColor: string;
  textColor: string;
};

// Define the structure with a string index
type ContractTypes = {
  [key: string]: ContractTypeDetail;
};

// Create the object with the defined types
const contractTypes: ContractTypes = {
  Proposals: {
    text: "New Proposal",
    buttonColor: "bg-[#C6AAFF]",
    textColor: "text-[#FFFFFF]",
  },
  "In-Progress": {
    text: "5 Days Remaining",
    buttonColor: "bg-[#351A6B]",
    textColor: "text-[#FFFFFF]",
  },
  "Awaiting Approval": {
    text: "Awaiting Approval",
    buttonColor: "bg-[#E4E4E7]",
    textColor: "text-[#1E1E1E]",
  },
  "Open Disputes": {
    text: "Open Dispute",
    buttonColor: "bg-[#F4B731]",
    textColor: "text-[#FFFFFF]",
  },
  Completed: {
    text: "Completed",
    buttonColor: "bg-[#14AE5C]",
    textColor: "text-[#FFFFFF]",
  },
};

const ContractCard = ({ onCardClick, type }: CardProps) => {
  return (
    <div
      className="bg-[white] hover:bg-[#F0F0F0] border-[1px] border-[#E4E4E7] rounded-[12px] p-[16px] cursor-pointer w-full"
      onClick={() => {
        onCardClick?.();
      }}
    >
      <div className="flex sm:flex-col justify-between sm:justify-start align-top mb-[10px]">
        <div className="flex sm:flex-col gap-[15px]">
          <Image
            src="/images/brand-logo.svg"
            alt="w3rk logo"
            className="rounded-[8px] bg-[#FAFAFA] sm:border-[1px] sm: border-[#D9D9D9]"
            width={60}
            height={60}
          />
          <div className="flex flex-col gap-[4px]">
            <span className="text-[16px] leading-[19.36px] font-medium">
              Website Updates - Full Stack Developer
            </span>
            <span className="text-[14px] leading-[16.94px] font-medium text-[#14AE5C]">
              $0.00
            </span>
            <span className="text-[#707070] text-[12px] leading-[14.52px] font-medium">
              Other Users Display Name
            </span>
          </div>
        </div>
        <div
          className={`py-[8px] px-[16px] flex items-center justify-center leading-[14.52px] text-[12px] ${contractTypes[type].textColor} ${contractTypes[type].buttonColor} font-semibold rounded-[8px] h-fit w-fit cursor-default sm:mt-[12px]`}
        >
          {contractTypes[type].text}
        </div>
      </div>
      <p className="mt-[16px] w-full line-clamp-4 sm:line-clamp-11 leading-[22px] text-[13px] text-[#5A5A5A] font-normal">
        Contract information can go here, total character limit will have to be
        decided bc we don’t wanna run over the limit. Contract information can
        go here, total character limit will have to be decided bc we don’t wanna
        run over the limit. Contract information can go here along... service
        offered information, total character limit will have to be service
        offered information, total character limit will have to be service
        offered information, total character limit will have to be...
      </p>
    </div>
  );
};

export default ContractCard;
