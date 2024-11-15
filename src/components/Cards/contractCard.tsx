"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnyPublication, Post } from "@lens-protocol/react-web";
import type { contractDetails } from "@/types/types";
import { useAccount } from "wagmi";
import { useProfile } from "@lens-protocol/react-web";
import getLensProfileData, { UserProfile } from "@/utils/getLensProfile";

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
  const [userData, setUserData] = useState<UserProfile>();
  const { data: profile, loading: profileLoading } = useProfile({
    forProfileId: showClientView
      ? contractDetails.freelancerHandle
      : contractDetails.clientHandle,
  });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (profile) {
      const profileData = getLensProfileData(profile);
      setUserData(profileData);
      setLoadingUser(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading]);

  return (
    <div
      className="bg-[white] hover:bg-[#F0F0F0] border-[1px] border-[#E4E4E7] rounded-[12px] p-[16px] cursor-pointer w-full"
      onClick={() => {
        onCardClick?.();
      }}
    >
      <div className="flex sm:flex-col justify-between sm:justify-start align-top mb-[10px]">
        <div className="flex sm:flex-col gap-[15px]">
          {!loadingUser && userData ? (
            <Image
              src={userData.picture}
              onError={(e) => {
                (
                  e.target as HTMLImageElement
                ).src = `https://api.hey.xyz/avatar?id=${userData.id}`;
              }}
              alt="paco pic"
              width={46}
              height={46}
              className="rounded-[8px] w-[46px] h-[46px]"
            />
        ) : (
            <Image
              src="/images/brand-logo.svg"
              alt="w3rk logo"
              className="rounded-[8px] bg-[#FAFAFA] sm:border-[1px] sm: border-[#D9D9D9]"
              width={60}
              height={60}
            />
          )}
          <div className="flex flex-col gap-[4px]">
            <span className="text-[16px] leading-[19.36px] font-medium">
              {contractDetails.title}
            </span>
            <span className="text-[14px] leading-[16.94px] font-medium text-[#14AE5C]">
              ${contractDetails.paymentAmount}
            </span>
            <span className="text-[#707070] text-[12px] leading-[14.52px] font-medium">
              Other Users Display Name
            </span>
          </div>
        </div>
        <div
          className={`py-[8px] px-[16px] flex items-center justify-center leading-[14.52px] text-[12px] ${
            contractTypes[contractDetails.state].textColor
          } ${
            contractTypes[contractDetails.state].buttonColor
          } font-semibold rounded-[8px] h-fit w-fit cursor-default sm:mt-[12px]`}
        >
          {contractDetails.state === "inProgress"
            ? daysUntil(contractDetails.dueDate)
            : contractTypes[contractDetails.state].text}
        </div>
      </div>
      <p className="mt-[16px] w-full line-clamp-4 sm:line-clamp-11 leading-[22px] text-[13px] text-[#5A5A5A] font-normal">
        {contractDetails.description}
      </p>
    </div>
  );
};

export default ContractCard;
