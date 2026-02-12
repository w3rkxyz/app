"use client";

import Image from "next/image";
import type { DummyConversation } from "./dummyConversations";

type DummyConversationCardProps = {
  conversation: DummyConversation;
  isSelected?: boolean;
  onClick?: () => void;
};

const DummyConversationCard = ({ conversation, isSelected = false, onClick }: DummyConversationCardProps) => {
  return (
    <div
      className={`p-[8px] w-full ${
        isSelected ? "bg-[#E4E4E7]" : "hover:bg-[#F3F3F3]"
      } rounded-[8px] cursor-pointer transition-colors`}
      onClick={onClick}
    >
      <div className="flex justify-between align-start gap-[10px]">
        <div className="flex gap-[12px] flex-1 min-w-0">
          <Image
            src={conversation.picture}
            onError={e => {
              (e.target as HTMLImageElement).src = "https://static.hey.xyz/images/default.png";
            }}
            className="rounded-[8px] flex-shrink-0"
            alt="user pic"
            width={40}
            height={40}
          />
          <div className="flex flex-col gap-[4px] flex-1 min-w-0">
            <div className="flex justify-between items-baseline gap-[8px]">
              <span className="text-[14px] leading-[16.94px] font-medium text-black">
                {conversation.displayName}
              </span>
              <span className="text-[12px] leading-[14px] font-medium text-[#999] flex-shrink-0">
                {conversation.timestamp}
              </span>
            </div>
            <p className="line-clamp-1 text-[13px] leading-[15px] text-[#707070]">
              {conversation.message}
            </p>
          </div>
        </div>
        {conversation.hasUnread && (
          <div className="w-[8px] h-[8px] bg-black rounded-full mt-[6px] flex-shrink-0"></div>
        )}
      </div>
    </div>
  );
};

export default DummyConversationCard;
