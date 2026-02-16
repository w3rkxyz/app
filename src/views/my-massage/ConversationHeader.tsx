"use client";
import Image from "next/image";
import Link from "next/link";
import { useConversation } from "@/hooks/useConversation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const ConversationHeader = () => {
  const { setActiveConversation, otherUser, loadingOtherUser } = useConversation();

  if (!otherUser || loadingOtherUser) {
    return (
      <div className="flex justify-start sm:gap-[18px] items-center py-[12px] px-[0px]">
        <Skeleton width={24} height={24} circle />
        <div className="flex w-full justify-between items-center">
          <div className="flex gap-[10px]">
            <Skeleton width={43} height={43} borderRadius={10} />
            <div className="flex flex-col gap-[2px] pt-[5px]">
              <Skeleton width={100} height={16} />
              <Skeleton width={100} height={16} />
            </div>
          </div>
          <Skeleton width={110} height={36} borderRadius={12} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start sm:gap-[18px] items-center py-[12px] px-[0px]">
      <Image
        src={"/images/arrow-left.svg"}
        className="hidden sm:block cursor-pointer"
        alt="Back"
        width={24}
        height={24}
        onClick={() => setActiveConversation(undefined)}
      />
      <div className="flex w-full justify-between items-center">
        <div className="flex gap-[10px]">
          <Link href={`/u/${otherUser.userLink}`}>
            <Image
              src={otherUser.picture || "https://static.hey.xyz/images/default.png"}
              onError={e => {
                (e.target as HTMLImageElement).src = "https://static.hey.xyz/images/default.png";
              }}
              alt="Profile"
              width={43}
              height={43}
              className="rounded-[10px] object-cover"
            />
          </Link>
          <div className="flex flex-col gap-[2px] pt-[2px]">
            <span className="text-[14px] leading-[18px] font-semibold text-[#111111]">
              {otherUser.displayName}
            </span>
            <span className="text-[13px] leading-[16px] font-medium text-[#707070]">
              {otherUser.handle}
            </span>
          </div>
        </div>
        <Link href={`/contracts?freelancer=${otherUser.handle}`}>
          <button className="px-[14px] py-[8px] bg-[#C6AAFF] hover:bg-[#B996FC] rounded-[12px] w-fit h-fit text-[14px] leading-[18px] text-white font-semibold transition-colors">
            Create Contract
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ConversationHeader;
