"use client";

import { useState } from "react";
import Image from "next/image";
import MyButton from "../reusable/Button/Button";
import ViewJobModal from "@/views/view-job-modal/view-job-modal";

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
}

const JobCard = ({
  userAvatar,
  username,
  jobName,
  jobIcon,
  cardStyles,
  onCardClick,
  setType,
  type,
}: CardProps) => {
  return (
    <div
      className="bg-[white] hover:bg-[#F0F0F0] border-[1px] border-[#E4E4E7] rounded-[12px] p-[16px] cursor-pointer w-full"
      onClick={() => {
        setType?.(type);
        onCardClick?.();
      }}
    >
      <div className="flex justify-between align-top mb-[10px]">
        <div className="flex gap-[15px]">
          <Image
            src={`/images/${type === "job" ? "werk.svg" : "paco-square.svg"}`}
            alt="w3rk logo"
            className="rounded-[8px]"
            width={60}
            height={60}
          />
          <div className="flex flex-col gap-[5px] pt-[5px]">
            <span className="text-[14px] leading-[16.94px] font-semibold">
              Display Name
            </span>
            <span className="text-[14px] leading-[16.94px] font-semibold">
              Job Title
            </span>
            <span className="text-[#707070] text-[12px] leading-[14.52px] font-semibold">
              $0.00 /hr
            </span>
          </div>
        </div>
        {type === "job" ? (
          <button className="flex align-middle gap-[5px] text-[white] leading-[12.1px] text-[12px] font-semibold py-[5.4px] px-[17px] bg-[#C6AAFF] rounded-[4px] h-fit">
            <span>Job</span>
            <Image
              src="/images/case.svg"
              alt="suitcase icon"
              width={12}
              height={12}
            />
          </button>
        ) : (
          <button className="flex align-middle gap-[5px] text-[white] leading-[12.1px] text-[12px] font-semibold py-[5.4px] px-[17px] bg-[#351A6B] rounded-[4px] h-fit">
            <span>Service</span>
            <Image
              src="/images/service.svg"
              alt="suitcase icon"
              width={12}
              height={12}
            />
          </button>
        )}
      </div>
      <span className="leading-[16.94px] sm:leading-[1.94px] text-[14px] font-semibold mb-[4px] sm:mb-[8px]">
        {jobName}
      </span>
      <p className="line-clamp-6 leading-[15.52px] text-[13px] sm:text-[13px] font-normal mb-[12px] sm:mb-[17px] w-full laptop-x:text-[14px]">
        User information can go here along with service offered information,
        total character limit will have to be decided bc we don’t wanna run over
        the limit. User information can go here along with service offered
        information, total character limit will have to be decided bc we don’t
        wanna run over the limit. User information can go here along... service
        offered information, total character limit will have to be
      </p>
      <div className="flex sm:flex-col gap-[15px] sm:gap-[10px]">
        <button className="bg-[#E4E4E7] rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] px-[70px] sm:px-[66px] sm:max-w-[190px]">
          Tag Name
        </button>
        <button className="bg-[#E4E4E7] rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] px-[70px] sm:px-[66px] sm:max-w-[190px]">
          Tag Name
        </button>
        <button className="bg-[#E4E4E7] rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] px-[70px] sm:px-[66px] sm:max-w-[190px]">
          Tag Name
        </button>
      </div>
    </div>
  );
};

export default JobCard;
