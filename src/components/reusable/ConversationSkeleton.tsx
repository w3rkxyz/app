"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ConversationSkeleton = () => {
  return (
    <div className="p-[10px] rounded-[12px] border border-[#ECECF0] bg-white">
      <div className="flex justify-between items-start mb-[8px] w-full">
        <div className="flex gap-[10px] w-full min-w-0">
          <Skeleton
            className="w-[40px] h-[40px]"
            baseColor="#ECECF0"
            width={"40px"}
            height={"40px"}
            borderRadius={"10px"}
          />
          <div className="flex flex-col gap-[4px] pt-[2px] w-full">
            <Skeleton
              className="w-[150px] h-[12px] p-0"
              width={"150px"}
              baseColor="#ECECF0"
              borderRadius={"5px"}
            />
            <Skeleton className="w-full h-[12px] p-0" baseColor="#ECECF0" borderRadius={"5px"} />
          </div>
        </div>
        <Skeleton className="w-[44px] h-[12px]" baseColor="#ECECF0" borderRadius={"5px"} />
      </div>
      <Skeleton className="w-[72%] h-[12px]" width={"72%"} baseColor="#ECECF0" borderRadius={"5px"} />
    </div>
  );
};

export default ConversationSkeleton;
