"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { contractDetails } from "@/types/types";
import { useAccount } from "wagmi";
import {useAccount as useLensAccount} from "@lens-protocol/react";
import getLensAccountData, { AccountData } from "@/utils/getLensProfile";

interface CardProps {
  type: string;
  onCardClick?: () => void;
  contractDetails: contractDetails;
}

function daysUntil(targetDateString: Date) {
  const targetDate = new Date(targetDateString);
  const now = new Date();
  const differenceInMilliseconds = targetDate.getTime() - now.getTime();

  if (differenceInMilliseconds <= 0) {
    return "Due";
  }

  const daysLeft = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
  return `${daysLeft} Days Remaining`;
}

type ContractTypeDetail = {
  text: string;
  buttonColor: string;
  textColor: string;
};

// Define the structure with a string index
type ContractTypes = {
  [key: string]: ContractTypeDetail;
};

// Create the object with the defined types
const contractTypes: ContractTypes = {
  proposal: {
    text: "New Proposal",
    buttonColor: "bg-[#C6AAFF]",
    textColor: "text-[#FFFFFF]",
  },
  inProgress: {
    text: "5 Days Remaining",
    buttonColor: "bg-[#351A6B]",
    textColor: "text-[#FFFFFF]",
  },
  awaitingApproval: {
    text: "Awaiting Approval",
    buttonColor: "bg-[#E4E4E7]",
    textColor: "text-[#1E1E1E]",
  },
  openDisputes: {
    text: "Open Dispute",
    buttonColor: "bg-[#F4B731]",
    textColor: "text-[#FFFFFF]",
  },
  completed: {
    text: "Completed",
    buttonColor: "bg-[#14AE5C]",
    textColor: "text-[#FFFFFF]",
  },
};

const ContractCard = ({ onCardClick, contractDetails }: CardProps) => {
  const { address } = useAccount();
  const [showClientView, setShowClientView] = useState(
    (address as string) === contractDetails.clientAddress
  );
  const [userData, setUserData] = useState<AccountData>();
  const { data: profile, loading: profileLoading } = useLensAccount({
    username: { localName: showClientView ? contractDetails.freelancerHandle : contractDetails.clientHandle },
  })
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (profile) {
      const profileData = getLensAccountData(profile);
      setUserData(profileData);
      setLoadingUser(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading]);

  return (
    <div
      className={`group group-hover:bg-[#fafafa] border-b border-[#8C8C8C33] pt-3 pb-6`}
      onClick={() => {
        onCardClick?.();
      }}
    >
      <div className="bg-white  p-[8px] sm:p-[8px] sm:pb-[16px] md:p-[24px] pb-[18px] md:pb-[24px] grid sm:grid-cols-[92px_1fr] grid-cols-[64px_1fr] gap-x-[12px] md:gap-x-[20px] gap-y-[8px] hover:shadow-sm transition-shadow cursor-pointer">
        <div className="row-span-2 sm:row-span-3 sm:aspect-square">
          {!loadingUser && userData ? (
            <Image
              src={userData.picture}
              onError={e => {
                (e.target as HTMLImageElement).src = 'https://static.hey.xyz/images/default.png';
              }}
              alt="paco pic"
              width={46}
              height={46}
              className="rounded-[8px] object-cover sm:h-[92px] sm:w-[92px] w-[64px] h-[64px] md:w-[64px] md:h-[64px] opacity-100"
            />
          ) : (
            <Image
              src="/images/jobimage.svg"
              alt="w3rk logo"
              className="rounded-[8px] object-cover sm:h-[92px] sm:w-[92px] w-[64px] h-[64px] md:w-[64px] md:h-[64px] opacity-100"
              width={60}
              height={60}
            />
          )}
          {/* <div className="flex flex-col gap-[4px]">
            <span className="text-[16px] leading-[19.36px] font-medium">
              {contractDetails.title}
            </span>
            <span className="text-[14px] leading-[16.94px] font-medium text-[#14AE5C]">
              ${contractDetails.paymentAmount}
            </span>
            <span className="text-[#707070] text-[12px] leading-[14.52px] font-medium">
              {userData?.displayName}
            </span>
          </div> */}
        </div>
        <div className="flex items-start justify-between sm:gap-[8px] gap-[12px] sm:flex-col flex-row md:gap-[16px] row-span-2">
          <div className="flex flex-col justify-evenly h-full min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-[#212121] leading-[22px] md:leading-[24px]">
                      {contractDetails.clientHandle}
                  </h3>
                  <p className="bg-[#FCF4FF] text-[#8F25AE] rounded-full px-3 py-1 text-[13px] font-medium hidden sm:block">New Proposal</p>
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-medium text-[#212121] leading-[20px] md:leading-[24px]">
                      {contractDetails.title}
                  </h4>
                  <p className="bg-[#FCF4FF] text-[#8F25AE] rounded-full px-3 py-1 text-[13px] font-medium sm:hidden">New Proposal</p>
                </div>
            </div>
            <div className="flex sm:flex-row flex-col justify-end items-end gap-2 sm:items-center">
                <span className="inline-flex items-center justify-center min-w-[84px] h-[40px] py-[8px] px-[16px] border border-[#E8E8E8] rounded-full sm:text-[16px] text-[20px] font-semibold leading-[24px] tracking-[-0.2px] opacity-100 whitespace-nowrap bg-[#F6F6F6] group-hover:bg-white max-w-fit">
                    ${contractDetails.paymentAmount}
                </span>
                <p className="text-base font-medium sm:text-[12px] text-[#212121]">Due Date: 25 Aug, 2025</p>
            </div>
        </div>
        {/* <div
          className={`py-[8px] px-[16px] flex items-center justify-center leading-[14.52px] text-[12px] ${
            contractTypes[contractDetails.state].textColor
          } ${
            contractTypes[contractDetails.state].buttonColor
          } font-semibold rounded-[8px] h-fit w-fit cursor-default sm:mt-[12px]`}
        >
          {contractDetails.state === "inProgress"
            ? daysUntil(contractDetails.dueDate)
            : contractTypes[contractDetails.state].text}
        </div> */}
      </div>
        <p className=" w-full line-clamp-4 sm:line-clamp-11 leading-[22px] text-base text-[#6C6C6C] font-normal">
        {contractDetails.description}
      </p>
    </div>
  );
};

export default ContractCard;
