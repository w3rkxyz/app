'use client'

import React from 'react'
import Image from 'next/image'
import type { Step1RoleSelectionProps } from '@/types/onboarding'

const Step1RoleSelection: React.FC<Step1RoleSelectionProps & {
  title?: string;
  subtitle?: string;
  clientTitle?: string;
  clientSubtitle?: string;
  freelancerTitle?: string;
  freelancerSubtitle?: string;
}> = ({
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
      <div className="flex  flex-col items-center w-full justify-center px-6  py-4">
        <div className="mb-8 text-center w-full">
          <h1 className="mb-2 xs:text-[24px] text-[28px] font-medium text-primary-black ">
            {title}
          </h1>
          <p className="text-base text-[#83899F]">
            {subtitle}
          </p>
        </div>

        <div className="mb-8  w-full max-w-[1047px] mx-auto flex  xs:flex-col gap-4 sm:flex-row sm:gap-6">
          <button
            onClick={() => onRoleSelect('client')}
            className={`flex flex-col items-center xs:w-full md:w-[511px] flex-1 rounded-sm border bg-white  transition-all hover:border-gray-400 hover:shadow-md ${selectedRole === 'client'
              ? 'border-[#212121] shadow-md'
              : 'border-[#C3C7CE]'
              }`}
          >
            <div className="bg-[#FAFAFA] w-full h-[234px] flex items-center justify-center rounded-t-sm">
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

            <h2 className="mb-1 mt-4 xs:text-[24px] text-[28px] font-medium text-primary-black">
              {clientTitle}
            </h2>
            <p className="text-[#83899F] text-base mb-6">
              {clientSubtitle}
            </p>
          </button>

          <button
            onClick={() => onRoleSelect('freelancer')}
            className={`flex flex-col items-center xs:w-full md:w-[511px] flex-1 rounded-sm border bg-white transition-all hover:border-gray-400 hover:shadow-md  ${selectedRole === 'freelancer'
              ? 'border-[#212121] shadow-md'
              : 'border-[#C3C7CE]'
              }`}
          >
            <div className="bg-[#FAFAFA] w-full h-[234px] flex items-center justify-center rounded-t-sm">
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

            <h2 className="mb-1 mt-4 xs:text-[24px] text-[28px] font-medium text-primary-black ">
              {freelancerTitle}
            </h2>
            <p className=" text-[#83899F] text-base mb-6">
              {freelancerSubtitle}
            </p>
          </button>
        </div>

        {/* Continue Button */}
        <div className="w-full max-w-[1047px] flex justify-end">
          <button
            onClick={onContinue}
            disabled={!selectedRole}
            className={`rounded-full px-4 py-2 text-base font-medium transition-all  sm:text-lg ${selectedRole
              ? 'bg-[#212121] text-white hover:bg-gray-800 cursor-pointer'
              : 'bg-[#DCDCDC] text-[#969696] cursor-not-allowed'
              }`}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

export default Step1RoleSelection

