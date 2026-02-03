"use client";

import React from "react";
import Image from "next/image";
import type { Step1RoleSelectionProps } from "@/types/onboarding";

const Step1RoleSelection: React.FC<
  Step1RoleSelectionProps & {
    title?: string;
    subtitle?: string;
    clientTitle?: string;
    clientSubtitle?: string;
    freelancerTitle?: string;
    freelancerSubtitle?: string;
  }
> = ({
  selectedRole,
  onRoleSelect,
  onContinue,
  title = "Which Best Describes You?",
  subtitle = "Choose your role to get started.",
  clientTitle = "I'm a Client",
  clientSubtitle = "Post jobs & hire talent.",
  freelancerTitle = "I'm a Freelancer",
  freelancerSubtitle = "Offer services & get hired.",
}) => {
  return (
    <div className="flex w-[900px] sm:w-full  flex-col items-center justify-center px-6  py-4">
      <div className="xs:mb-10 mb-8 text-center w-full">
        <h1 className="mb-2 xs:text-[24px] text-[28px] font-medium text-primary-black ">{title}</h1>
        <p className="text-base text-[#83899F]">{subtitle}</p>
      </div>

      <div className=" xs:mb-4 mb-8  w-full max-w-[1047px] mx-auto flex  sm:flex-col gap-4 flex-row sm:gap-6">
        <button
          onClick={() => onRoleSelect("client")}
          className={`flex flex-col items-center sm:w-full md:w-[511px] flex-1 rounded-[8px] border bg-white  transition-all hover:border-gray-400 hover:shadow-md ${
            selectedRole === "client" ? "border-[#212121] shadow-md" : "border-[#C3C7CE]"
          }`}
        >
          <div className="bg-[#FAFAFA] w-full h-[234px] flex items-center justify-center rounded-t-[8px]">
            <div className="md:h-[132px] md:w-[122px] h-[122px]">
              <Image
                src="/icons/client.svg"
                alt="Client icon"
                width={128}
                height={128}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <h2 className="xs:mb-3 mb-1 mt-4 xs:text-[24px] text-[28px] font-medium text-primary-black">
            {clientTitle}
          </h2>
          <p className="text-[#83899F] text-[20px] font-normal mb-6">{clientSubtitle}</p>
        </button>

        <button
          onClick={() => onRoleSelect("freelancer")}
          className={`flex flex-col items-center sm:w-full md:w-[511px] flex-1 rounded-[8px] border bg-white transition-all hover:border-gray-400 hover:shadow-md  ${
            selectedRole === "freelancer" ? "border-[#212121] shadow-md" : "border-[#C3C7CE]"
          }`}
        >
          <div className="bg-[#FAFAFA] w-full h-[234px] flex items-center justify-center rounded-t-[8px]">
            <div className="md:h-[132px] md:w-[122px] h-[122px]">
              <Image
                src="/icons/freelancer.svg"
                alt="Freelancer icon"
                width={128}
                height={128}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <h2 className="xs:mb-3 mb-1 mt-4 xs:text-[24px] text-[28px] font-medium text-primary-black ">
            {freelancerTitle}
          </h2>
          <p className=" text-[#83899F] text-[20px] font-normal mb-6">{freelancerSubtitle}</p>
        </button>
      </div>

      {/* Continue Button */}
      <div className="w-full max-w-[1047px] flex xs:justify-center justify-end pt-4 xs:border-none border-t border-[#C3C7CE]">
        <button
          onClick={onContinue}
          disabled={!selectedRole}
          className={`rounded-full px-4 py-2 text-base font-medium transition-all  sm:text-lg ${
            selectedRole
              ? "bg-[#212121] text-white hover:bg-gray-800 cursor-pointer"
              : "bg-[#DCDCDC] text-[#969696] cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Step1RoleSelection;
