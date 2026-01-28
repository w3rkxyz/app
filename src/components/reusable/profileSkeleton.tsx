"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// export const dynamic = "force-dynamic";

const ProfileSkeleton = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="px-[156px] profile-md:px-[80px] profile-sm:px-[20px] sm:px-[16px] pt-[110px] sm:pt-[122px] sm:w-full mb-[40px]">
        <div className="absolute w-full mx-0 left-0 top-156px sm:top-[79px] px-[156px] profile-sm:px-[20px] profile-md:px-[80px] sm:px-[16px] -z-40">
          <Skeleton
            className="w-full h-[196px] sm:h-[110px] rounded-[16px] relative"
            baseColor="#E4E4E7"
            borderRadius={"12px"}
          />
        </div>
        <div className="flex sm:flex-col sm:w-full gap-[24px] pt-[116px] sm:pt-[26px] px-[32px] sm:px-[0px]">
          <div className=" max-w-[320px] min-w-[320px] sm:w-full">
            <div className="w-[160px] h-[160px] sm:w-[80px] sm:h-[80px] relative mb-[16px] ml-[16px]">
              <Skeleton className="w-full h-full" baseColor="#E4E4E7" borderRadius={"12px"} />
            </div>
            <h3 className="leading-[19px] text-[16px] font-semibold mb-[0px] sm:mb-[0px]">
              <Skeleton className="w-full h-[19px]" baseColor="#E4E4E7" borderRadius={"5px"} />
            </h3>
            <span className="text-[#707070] leading-[16.94px] text-[14px] font-medium mb-[12px] sm:mb-[20px]">
              <Skeleton className="w-full h-[16.94px]" baseColor="#E4E4E7" borderRadius={"5px"} />
            </span>
            <h3 className="leading-[19px] text-[16px] font-semibold mt-[10px] mb-[12px] sm:mt-[6px]">
              <Skeleton className="w-full h-[19px]" baseColor="#E4E4E7" borderRadius={"5px"} />
            </h3>
            <div className="flex gap-[4px] leading-[16.94px] text-[14px] font-medium">
              <span>About me</span>
              <span className="text-[#F71919]">max. 260 characters</span>
            </div>
            <p className="leading-[16.94px] text-[14px] font-medium text-[#707070] mb-[16px]">
              <Skeleton className="w-full h-[50px]" baseColor="#E4E4E7" borderRadius={"5px"} />
            </p>

            <div className="flex gap-[13px] mb-[16px]">
              <div className="flex flex-col">
                <Skeleton className="w-full h-[16.94px]" baseColor="#E4E4E7" borderRadius={"5px"} />
                <span className="leading-[16.94px] text-[14px] font-medium text-[#707070]">
                  Following
                </span>
              </div>
              <div className="flex flex-col">
                <Skeleton className="w-full h-[16.94px]" baseColor="#E4E4E7" borderRadius={"5px"} />
                <span className="leading-[16.94px] text-[14px] font-medium text-[#707070]">
                  Followers
                </span>
              </div>
            </div>
            <div className="flex gap-[16px] mb-[16px]">
              <button className="rounded-[8px] bg-[#C6AAFF] hover:bg-[#351A6B] text-white px-[16px] py-[6px] text-[14px] leading-[24px]">
                Follow
              </button>
              <button className="rounded-[8px] bg-[#E4E4E7] text-black px-[16px] py-[6px] text-[14px] leading-[24px]">
                Message
              </button>
            </div>
            <hr className="bg-[#E4E4E7] h-[1px] mb-[16px]" />
            <div className="flex gap-[12px] mb-[19px]">
              <Image src="/images/twitter-social.svg" alt="user icon" width={24} height={24} />

              <Image src="/images/github-social.svg" alt="user icon" width={24} height={24} />

              <Image src="/images/linkedin-social.svg" alt="user icon" width={24} height={24} />
            </div>
            <div className="flex flex-col gap-[16px] mb-[20px] sm:mb-[0px]">
              <div className="flex gap-[11.6px] items-center">
                <Image src="/images/earth.svg" alt="earth icon" width={24} height={24} />
                <Skeleton
                  className="h-full"
                  width={"200px"}
                  baseColor="#E4E4E7"
                  borderRadius={"4px"}
                />
              </div>
              <div className="flex gap-[14.2px] items-center pl-[3.2px]">
                <Image src="/images/location.svg" alt="earth icon" width={18.33} height={24} />
                <Skeleton
                  className="h-full"
                  width={"200px"}
                  baseColor="#E4E4E7"
                  borderRadius={"4px"}
                />
              </div>
              <div className="flex gap-[12.7px] items-center">
                <Image src="/images/w.svg" alt="earth icon" width={24} height={15.3} />
                <Skeleton
                  className="h-full"
                  width={"200px"}
                  baseColor="#E4E4E7"
                  borderRadius={"4px"}
                />
              </div>
            </div>
          </div>
          <hr className="bg-[#E4E4E7] h-[1px] mb-[0px] hidden sm:block" />
          <div className="pt-[96px] sm:pt-[0px] flex-1">
            <div className="flex sm:flex-col sm:gap-[16px] justify-between sm:justify-start mb-[16px] align-middle">
              <button className="leading-[19.36px] text-[16px] font-semibold text-[black] px-[10px] py-[7px] bg-[#E4E4E7] rounded-[8px] sm:w-fit">
                Posts
              </button>
            </div>
            <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-col gap-[16px] sm:mb-[14px]">
              <>
                <Skeleton
                  className="h-[208px] rounded-[16px] sm:h-[340px]"
                  baseColor="#E4E4E7"
                  borderRadius={"12px"}
                />
                <Skeleton
                  className="h-[208px] rounded-[16px] sm:h-[340px]"
                  baseColor="#E4E4E7"
                  borderRadius={"12px"}
                />
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
