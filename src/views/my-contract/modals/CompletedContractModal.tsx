"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import MyButton from "@/components/reusable/Button/Button";
import { useAccount } from "wagmi";
import { activeContractDetails } from "@/types/types";
import {useAccount as useLensAccount} from "@lens-protocol/react";
import getLensAccountData, { AccountData } from "@/utils/getLensProfile";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";

type Props = {
  handleCloseModal?: () => void;
  contractDetails: activeContractDetails;
};

function formatDate(dateString: Date) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

const CompletedContractModal = ({ handleCloseModal, contractDetails }: Props) => {
  const { address } = useAccount();
  const myDivRef = useRef<HTMLDivElement>(null);
  const [showMobile, setShowMobile] = useState(false);
  const [showClientView, setShowClientView] = useState(
    (address as string) === contractDetails.clientAddress
  );
  const [userData, setUserData] = useState<AccountData>();
  const { data: profile, loading: profileLoading } = useLensAccount({
    username: { localName: showClientView ? contractDetails.freelancerHandle : contractDetails.clientHandle },
  })
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    setShowMobile(true);

    function handleClickOutside(event: any) {
      if (myDivRef.current && !myDivRef.current.contains(event.target as Node)) {
        if (handleCloseModal) {
          handleCloseModal();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      const profileData = getLensAccountData(profile);
      setUserData(profileData);
      setLoadingUser(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading]);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  return (
    <div
      className={`view-job-modal-section sm:w-full rounded-[12px] px-[16px] sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""} h-fit`}
      ref={myDivRef}
    >
      <div className="w-[667px] sm:w-full flex justify-between items-center py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
        <span className="leading-[14.52px] text-[14px] font-semibold text-[black]">
          Contract Completion
        </span>
        <Image
          onClick={handleCloseModal}
          className="cursor-pointer"
          src="/images/Close.svg"
          alt="close icon"
          width={20}
          height={20}
        />
      </div>
      <div className="bg-[white] rounded-[12px] sm:rounded-none py-[16px] sm:w-full max-w-[664px] flex flex-col">
        {!loadingUser && userData ? (
          <div className="flex sm:flex-col justify-between gap-[8px] sm:gap-[16px] w-full">
            <div className="flex gap-[6px] items-center">
              <Image
                src={userData.picture}
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://static.hey.xyz/images/default.png';
                }}
                alt="paco pic"
                width={46}
                height={46}
                className="rounded-[8px] w-[46px] h-[46px]"
              />
              <div className="flex flex-col gap-[0px]">
                <span className="text-[14px] leading-[16.94px] font-semibold">
                  {userData.displayName}
                </span>
                <span className="text-[14px] leading-[20px] font-normal text-[#5A5A5A]">
                  {userData.handle}
                </span>
              </div>
            </div>
            <Link href={`/messages?handle=${userData.userLink}`}>
              <button className="w-fit h-fit py-[10px] px-[24px] text-[14px] leading-[16.94px] text-black bg-[#E4E4E7] hover:bg-[#351A6B] rounded-[8px] font-semibold">
                Message
              </button>
            </Link>
          </div>
        ) : (
          <Skeleton className="w-full h-[80px]" baseColor="#E4E4E7" borderRadius={"12px"} />
        )}
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <h3 className="text-[16px] leading-[19.36px] font-semibold mb-[6px]">
          {contractDetails.title}
        </h3>
        <p className="line-clamp-4 sm:line-clamp-6 text-[12px] leading-[20px] font-normal">
          {contractDetails.description}
        </p>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">Client Wallet Address</span>
          <span className="text-[12px] leading-[14.52px] font-normal">
            {contractDetails.clientAddress}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">
            Freelancer Wallet Address
          </span>
          <span className="text-[12px] leading-[14.52px] font-normal">
            {contractDetails.freelancerAddress}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">Payment Amount</span>
          <span className="text-[12px] leading-[14.52px] font-normal">
            ${contractDetails.paymentAmount}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">Due Date</span>
          <span className="text-[12px] leading-[14.52px] font-normal">
            {formatDate(contractDetails.dueDate)}
          </span>
        </div>
        <div className="w-full bg-[#F5F5F5] rounded-[20px] py-[20px] gap-[7px] flex flex-col items-center mt-[29px] sm:mt-[16px]">
          <Image src="/images/completed.svg" alt="tick icon" width={34} height={34} />
          <p className="text-[14px] leading-[22px] font-semibold max-w-[300px] text-center">
            Contract has been completed successfully and payment has been released.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletedContractModal;
