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
      <div className="flex justify-between items-center gap-[12px] w-full">
        <div className="flex items-center gap-[10px] min-w-0">
          <Skeleton width={24} height={24} circle className="sm:block hidden" />
          <Skeleton width={40} height={40} borderRadius={999} />
          <div className="flex flex-col gap-[3px]">
            <Skeleton width={140} height={16} />
            <Skeleton width={90} height={12} />
          </div>
        </div>
        <div className="sm:hidden">
          <Skeleton width={140} height={36} borderRadius={999} />
        </div>
        <div className="hidden sm:block">
          <Skeleton width={32} height={32} borderRadius={999} />
        </div>
      </div>
    );
  }

  const displayNameCandidate = otherUser.displayName?.trim() || "";
  const displayHandleCandidate = otherUser.handle?.trim() || "";
  const hasValidName =
    displayNameCandidate !== "" &&
    displayNameCandidate.toLowerCase() !== otherUser.address.toLowerCase() &&
    displayNameCandidate.toLowerCase() !== "unknown user";
  const hasValidHandle =
    displayHandleCandidate !== "" && displayHandleCandidate.toLowerCase() !== "@eth";
  const headerName = hasValidName
    ? displayNameCandidate
    : hasValidHandle
      ? displayHandleCandidate
      : "Unknown user";
  const headerHandle = hasValidName && hasValidHandle ? displayHandleCandidate : "";

  return (
    <div className="flex justify-between items-center gap-[12px] w-full">
      <div className="flex items-center gap-[10px] min-w-0">
        <button
          type="button"
          className="hidden sm:block cursor-pointer"
          aria-label="Back"
          onClick={() => setActiveConversation(undefined)}
        >
          <Image src={"/images/arrow-left.svg"} alt="Back" width={24} height={24} />
        </button>
        <Link href={`/u/${otherUser.userLink}`}>
          <Image
            src={otherUser.picture || "https://static.hey.xyz/images/default.png"}
            onError={e => {
              (e.target as HTMLImageElement).src = "https://static.hey.xyz/images/default.png";
            }}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </Link>
        <div className="min-w-0">
          <span className="text-[16px] leading-[20px] font-semibold text-[#212121] truncate block">
            {headerName}
          </span>
          {headerHandle && (
            <span className="text-[13px] leading-[16px] text-[#6C6C6C] truncate">{headerHandle}</span>
          )}
        </div>
      </div>

      <Link href={`/contracts?freelancer=${otherUser.handle}`} className="sm:hidden">
        <button className="px-[16px] py-[8px] bg-[#212121] text-white text-[14px] leading-[18px] rounded-full hover:bg-[#111111] transition-colors flex items-center gap-[8px]">
          <Image src={"/images/add.svg"} width={20} height={20} alt="" />
          Create Contract
        </button>
      </Link>

      <button
        type="button"
        className="hidden sm:flex p-[6px] rounded-full hover:bg-[#F2F2F2]"
        onClick={() => setActiveConversation(undefined)}
        aria-label="Back"
      >
        <Image src={"/images/arrow-left.svg"} alt="Back" width={20} height={20} />
      </button>
    </div>
  );
};

export default ConversationHeader;
