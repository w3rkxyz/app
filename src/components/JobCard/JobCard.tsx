"use client";

import { useState } from "react";
import Image from "next/image";
import { AnyPublication, Post } from "@lens-protocol/react-web";
import getLensProfileData from "@/utils/getLensProfile";

const tagColors: any = {
  "Blockchain Development": "#FFC2C2",
  "Programming & Development": "#FFD8C2",
  Design: "#FFF2C2",
  Marketing: "#EFFFC2",
  "Admin Support": "#C2FFC5",
  "Customer Service": "#C2FFFF",
  "Security & Auditing": "#C2CCFF",
  "Consulting & Advisory": "#D9C2FF",
  "Community Building": "#FAC2FF",
  Other: "#E4E4E7",
};

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

const JobCard = ({
  userAvatar,
  username,
  jobName,
  jobIcon,
  cardStyles,
  onCardClick,
  setType,
  type,
  publication,
}: CardProps) => {
  const data =
    publication && publication.metadata.__typename === "ArticleMetadataV3"
      ? publication
      : undefined;

  var attributes: any = {};
  if (publication) {
    publication.metadata.attributes?.map((attribute) => {
      attributes[attribute.key] = attribute.value;
    });
  }

  var profileData;
  if (data) {
    profileData = getLensProfileData(data?.by);
  }

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
            src={
              profileData && profileData?.picture !== ""
                ? profileData?.picture
                : type === "job"
                ? "/images/werk.svg"
                : "/images/paco-square.svg"
            }
            alt="w3rk logo"
            className="rounded-[8px]"
            width={60}
            height={60}
          />
          <div className="flex flex-col gap-[5px] pt-[5px]">
            <span className="text-[14px] leading-[16.94px] font-semibold">
              {profileData && profileData?.displayName !== ""
                ? profileData.displayName
                : "Display Name"}
            </span>
            <span className="text-[14px] leading-[16.94px] font-semibold">
              {data && data.metadata.__typename === "ArticleMetadataV3"
                ? data.metadata.title
                : "Job Title"}
            </span>
            <span className="text-[#707070] text-[12px] leading-[14.52px] font-semibold">
              {attributes["payement type"]
                ? attributes["payement type"] === "hourly"
                  ? `$${attributes["hourly"]} /hr`
                  : `$${attributes["fixed"]} - Fixed Price`
                : "$0.00 /hr"}
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
        {data && data.metadata.__typename === "ArticleMetadataV3"
          ? data.metadata.title
          : "Post Title"}
      </span>
      <p
        className={`line-clamp-6 leading-[15.52px] text-[13px] sm:text-[13px] font-normal mb-[12px] sm:mb-[17px] w-full laptop-x:text-[14px] ${
          data ? "whitespace-pre-wrap" : ""
        }`}
      >
        {data && data.metadata.__typename === "ArticleMetadataV3"
          ? data.metadata.content
          : `User information can go here along with service offered information,
                total character limit will have to be decided bc we don’t wanna run over
                the limit. User information can go here along with service offered
                information, total character limit will have to be decided bc we don’t
                wanna run over the limit. User information can go here along... service
                offered information, total character limit will have to be`}
      </p>
      <div className="flex sm:flex-col gap-[15px] sm:gap-[10px]">
        <button
          className={`${
            data?.metadata.tags
              ? `bg-[${tagColors[data?.metadata.tags[0]]}]`
              : "bg-[#E4E4E7]"
          } rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] px-[70px] sm:px-0 sm:w-[190px] sm:flex sm:justify-center`}
        >
          {data?.metadata.tags ? data?.metadata.tags[0] : "Tag Name"}
        </button>
        <button
          className={`${
            data?.metadata.tags
              ? `bg-[${tagColors[data?.metadata.tags[1]]}]`
              : "bg-[#E4E4E7]"
          } rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] px-[70px] sm:px-0 sm:w-[190px] sm:flex sm:justify-center`}
        >
          {data?.metadata.tags ? data?.metadata.tags[1] : "Tag Name"}
        </button>
        <button
          className={`${
            data?.metadata.tags
              ? `bg-[${tagColors[data?.metadata.tags[2]]}]`
              : "bg-[#E4E4E7]"
          } rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] px-[70px] sm:px-0 sm:w-[190px] sm:flex sm:justify-center`}
        >
          {data?.metadata.tags ? data?.metadata.tags[2] : "Tag Name"}
        </button>
      </div>
    </div>
  );
};

export default JobCard;
