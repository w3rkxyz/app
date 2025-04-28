"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
    publication && publication.metadata.__typename === "TextOnlyMetadataV3"
      ? publication
      : undefined;

  var attributes: any = {};
  if (publication) {
    publication.metadata.attributes?.map(attribute => {
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
          {profileData ? (
            <Link
              href={`/u/${profileData?.userLink}`}
              onClick={e => e.stopPropagation()}
              className="p-0 m-0 h-[60px] w-[60px]"
            >
              <Image
                src={profileData.picture}
                alt="w3rk logo"
                className="rounded-[8px] h-[60px] w-[60px] p-0"
                width={60}
                height={60}
              />
            </Link>
          ) : (
            <Image
              src={type === "job" ? "/images/werk.svg" : "/images/paco-square.svg"}
              alt="w3rk logo"
              className="rounded-[8px]"
              width={60}
              height={60}
            />
          )}
          <div className="flex flex-col gap-[5px] pt-[5px]">
            <span className="text-[14px] leading-[16.94px] font-semibold">
              {attributes["title"]}
            </span>
            <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
              {profileData ? profileData.displayName : "w3rk"}
            </span>
            <span className="text-[#707070] text-[12px] leading-[14.52px] font-medium">
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
            <Image src="/images/case.svg" alt="suitcase icon" width={12} height={12} />
          </button>
        ) : (
          <button className="flex align-middle gap-[5px] text-[white] leading-[12.1px] text-[12px] font-semibold py-[5.4px] px-[17px] bg-[#351A6B] rounded-[4px] h-fit">
            <span>Service</span>
            <Image src="/images/service.svg" alt="suitcase icon" width={12} height={12} />
          </button>
        )}
      </div>
      <p
        className={`line-clamp-6 leading-[22px] text-[12px] sm:text-[13px] font-normal mb-[12px] sm:mb-[17px] w-full laptop-x:text-[14px] ${
          data ? "whitespace-pre-wrap" : ""
        }`}
      >
        {attributes["content"]
          ? attributes["content"]
          : `User information can go here along with service offered information, total character limit will have to be decided bc
           we don’t wanna run over the limit. User infoormation can go here along with service offered information, total
            character limit will have to be decided bc we don’t wanna run over the limit. User infoormation can go here along... `}
      </p>
      <div className="flex sm:flex-col gap-[15px] sm:gap-[10px]">
        {data?.metadata.tags?.slice(0, 3).map((tag, index) => {
          if (tag !== "w3rk" && tag !== "job" && tag !== "service") {
            return (
              <button
                key={index}
                className={`${
                  data?.metadata.tags
                    ? `bg-[${tagColors[data?.metadata.tags[index]]}]`
                    : "bg-[#E4E4E7]"
                } rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] w-[200px] sm:px-0 sm:w-[190px] sm:flex sm:justify-center min-w-[200px]`}
              >
                {data?.metadata.tags ? data?.metadata.tags[index] : "Tag Name"}
              </button>
            );
          }
        })}
      </div>
    </div>
  );
};

export default JobCard;
