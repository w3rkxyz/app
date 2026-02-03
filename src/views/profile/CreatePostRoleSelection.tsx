"use client";

import React from "react";
import Image from "next/image";
import type { Step1RoleSelectionProps } from "@/types/onboarding";

const CreatePostRoleSelection: React.FC<
  Step1RoleSelectionProps & {
    title?: string;
    subtitle?: string;
    clientTitle?: string;
    clientSubtitle?: string;
    freelancerTitle?: string;
    freelancerSubtitle?: string;
    /** When true, the Continue button is not rendered (e.g. when modal provides its own footer) */
    hideContinueButton?: boolean;
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
  hideContinueButton = false,
}) => {
  return (
    <div className="flex w-full max-w-full flex-col items-center justify-center px-2 py-4 xs:px-4 sm:px-6">
      <div className="mb-4 w-full text-center xs:mb-6 sm:mb-8">
        <h1 className="mb-1 text-[20px] font-medium text-primary-black xs:mb-2 xs:text-[24px] sm:text-[28px]">
          {title}
        </h1>
        <p className="text-sm text-[#83899F] xs:text-base">{subtitle}</p>
      </div>

      <div className="mb-6 w-full max-w-full flex flex-row justify-center gap-4 xs:mb-8 sm:flex-col sm:gap-4 xs:gap-5">
        <button
          onClick={() => onRoleSelect("client")}
          className={`flex min-w-0 max-w-[390px] h-[276px] flex-col items-center flex-1 rounded-[8px] border bg-white transition-all hover:border-gray-400 hover:shadow-md ${
            selectedRole === "client" ? "border-[#212121] shadow-md" : "border-[#C3C7CE]"
          }`}
        >
          <div className="bg-[#FAFAFA] flex h-[180px] w-full items-center justify-center rounded-t-[8px] xs:h-[180px] sm:h-[200px] md:h-[234px]">
            <div className="relative h-[80px] w-[80px] xs:h-[100px] xs:w-[100px] sm:h-[122px] sm:w-[122px]">
              <Image
                src="/icons/client.svg"
                alt="Client icon"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h2 className="mt-3 mb-1 text-[24px] font-medium text-primary-black sm:mt-4 ">
            {clientTitle}
          </h2>
          <p className="mb-4 text-[#83899F] text-sm xs:mb-5 xs:text-base sm:mb-6 sm:mt-2 sm:text-[20px]">
            {clientSubtitle}
          </p>
        </button>

        <button
          onClick={() => onRoleSelect("freelancer")}
          className={`flex min-w-0 max-w-[390px] h-[276px] flex-col items-center flex-1 rounded-[8px] border bg-white transition-all hover:border-gray-400 hover:shadow-md ${
            selectedRole === "freelancer" ? "border-[#212121] shadow-md" : "border-[#C3C7CE]"
          }`}
        >
          <div className="bg-[#FAFAFA] flex h-[180px] w-full items-center justify-center rounded-t-[8px] xs:h-[180px] sm:h-[200px] md:h-[234px]">
            <div className="relative h-[80px] w-[80px] xs:h-[100px] xs:w-[100px] sm:h-[122px] sm:w-[122px]">
              <Image
                src="/icons/freelancer.svg"
                alt="Freelancer icon"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h2 className="mt-3 mb-1 text-[24px] font-medium text-primary-black xs:mt-4 ">
            {freelancerTitle}
          </h2>
          <p className="mb-4 text-[#83899F] text-sm xs:mb-5 xs:text-base sm:mb-6 sm:mt-2 sm:text-[20px]">
            {freelancerSubtitle}
          </p>
        </button>
      </div>

      {/* Continue Button (hidden when modal provides footer) */}
      {!hideContinueButton && (
        <div className="flex w-full max-w-full flex-col items-stretch border-t border-[#C3C7CE] pt-4 xs:flex-row xs:justify-end">
          <button
            onClick={onContinue}
            disabled={!selectedRole}
            className={`rounded-full px-4 py-2.5 text-base font-medium transition-all xs:py-2 ${
              selectedRole
                ? "bg-[#212121] text-white hover:bg-gray-800 cursor-pointer"
                : "bg-[#DCDCDC] text-[#969696] cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatePostRoleSelection;
