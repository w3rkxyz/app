"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const Notifications = () => {
  return (
    <div className="px-[320px] sm:px-[16px] pt-[120px] sm:pt-[90px]">
      <button className="rounded-[8px] bg-[#E4E4E7] text-black px-[16px] py-[7px] sm:px-[14px] sm:py-[4px] text-[14px] w-fit h-fit cursor-pointer mb-[9px]">
        All Notifications
      </button>
      <div className="notification-box rounded-[16px] border-[1px] border-[#E4E4E7] px-[16px] py-[12px] flex flex-col gap-[9px] mb-[20px]">
        <div className="p-[16px] flex items-center pl-[32px] sm:pl-[16px] bg-white rounded-[8px] h-fit relative border-[1px] border-[#E4E4E7] hover:bg-[#F0F0F0] cursor-pointer">
          <Image
            src={"/images/add-file.svg"}
            alt="file add pic"
            className="mr-[32px] sm:mr-[12px] sm:w-[20px] sm:h-[20px]"
            width={24}
            height={24}
          />
          <div className="flex flex-col gap-[8px]">
            <Image src={"/images/paco.svg"} alt="paco" width={32} height={32} />
            <span className="font-medium text-[14px] leading-[16.94px] ">
              @0xPaco has sent you a contract offer!
            </span>
          </div>
          <span className="absolute right-[16px] top-[12px] text-[12px] sm:hidden">
            4m ago
          </span>
        </div>
        <div className="p-[16px] flex items-center pl-[32px] sm:pl-[16px] bg-white rounded-[8px] h-fit relative border-[1px] border-[#E4E4E7] hover:bg-[#F0F0F0] cursor-pointer">
          <Image
            src={"/images/add-user.svg"}
            alt="file add pic"
            className="mr-[32px] sm:mr-[12px] sm:w-[20px] sm:h-[20px]"
            width={24}
            height={24}
          />
          <div className="flex flex-col gap-[8px]">
            <Image src={"/images/paco.svg"} alt="paco" width={32} height={32} />
            <span className="font-medium text-[14px] leading-[16.94px] ">
              @0xPaco followed you!
            </span>
          </div>
          <span className="absolute right-[16px] top-[12px] text-[12px] sm:hidden">
            10m ago
          </span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
