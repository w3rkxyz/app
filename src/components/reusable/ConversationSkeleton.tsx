"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ConversationSkeleton = () => {
  return (
    <div>
      <div className="flex justify-between align-top mb-[6px] w-full">
        <div className="flex gap-[10px] w-full">
          <Skeleton
            className="w-[40px] h-[40px]"
            baseColor="#E4E4E7"
            width={"40px"}
            height={"40px"}
            borderRadius={"8px"}
          />
          <div className="flex flex-col gap-[0px] sm:gap-[1px] pt-[5px]">
            <Skeleton
              className="w-[150px] h-[11.94px] p-0"
              width={"150px"}
              baseColor="#E4E4E7"
              borderRadius={"5px"}
            />
            <Skeleton
              className="w-full h-[11.94px] p-0"
              baseColor="#E4E4E7"
              borderRadius={"5px"}
            />
          </div>
        </div>
        <Skeleton
          className="w-full h-[12.1px]"
          baseColor="#E4E4E7"
          borderRadius={"5px"}
        />
      </div>
      <Skeleton
        className="w-[300px] h-[12px]"
        width={"300px"}
        baseColor="#E4E4E7"
        borderRadius={"5px"}
      />
    </div>
  );
};

export default ConversationSkeleton;
