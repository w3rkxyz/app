"use client";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ConversationSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="relative">
        <Skeleton
          className="w-[44px] h-[44px]"
          baseColor="#ECECF0"
          width={"44px"}
          height={"44px"}
          borderRadius={"999px"}
        />
      </div>
      <div className="w-full min-w-0">
        <div className="flex justify-between items-center mb-[4px] gap-2">
          <Skeleton
            className="w-[150px] h-[14px]"
            baseColor="#ECECF0"
            width={"150px"}
            height={"14px"}
            borderRadius={"5px"}
          />
          <Skeleton className="w-[44px] h-[12px]" baseColor="#ECECF0" borderRadius={"5px"} />
        </div>
        <Skeleton className="w-[72%] h-[12px]" width={"72%"} baseColor="#ECECF0" borderRadius={"5px"} />
      </div>
    </div>
  );
};

export default ConversationSkeleton;
