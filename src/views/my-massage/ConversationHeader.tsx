"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useConversation } from "@/hooks/useConversation";
import { useXMTP } from "@/app/XMTPContext";
import { useAccount } from "wagmi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const ConversationHeader = () => {
  const { setActiveConversation, otherUser, loadingOtherUser, activeConversation } =
    useConversation();

  if (!otherUser || loadingOtherUser) {
    return (
      <div className="flex justify-start sm:gap-[18px] items-center py-[10px] px-[0px]">
        <Skeleton width={24} height={24} circle />
        <div className="flex w-full justify-between items-center">
          <div className="flex gap-[10px]">
            <Skeleton width={43} height={43} circle />
            <div className="flex flex-col gap-[2px] pt-[5px]">
              <Skeleton width={100} height={16} />
              <Skeleton width={100} height={16} />
            </div>
          </div>
          <Skeleton width={100} height={30} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start sm:gap-[18px] items-center py-[10px] px-[0px]">
      <Image
        src={"/images/arrow-left.svg"}
        className="hidden sm:block cursor-pointer"
        alt="paco pic"
        width={24}
        height={24}
        onClick={() => setActiveConversation(undefined)}
      />
      <div className="flex w-full justify-between items-center">
        <div className="flex gap-[10px]">
          <Link href={`/u/${otherUser.userLink}`}>
            <Image
              src={otherUser.picture}
              onError={e => {
                (e.target as HTMLImageElement).src = "https://static.hey.xyz/images/default.png";
              }}
              alt="paco pic"
              width={43}
              height={43}
              className="rounded-[8px]"
            />
          </Link>
          <div className="flex flex-col gap-[2px] pt-[5px]">
            <span className="text-[14px] leading-[16.94px] font-medium">
              {otherUser.displayName}
            </span>
            <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
              {otherUser.handle}
            </span>
          </div>
        </div>
        <Link href={`/contracts?freelancer=${otherUser.handle}`}>
          <button className="px-[15px] py-[6px] bg-[#351A6B] hover:bg-[#2f1b57] rounded-[8px] w-fit h-fit text-[14px] leading-[20px] text-white font-medium">
            Create Contract
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ConversationHeader;
