"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import MyButton from "@/components/reusable/Button/Button";
import { useAccount } from "wagmi";
import { release_payement } from "@/api";
import { useDispatch } from "react-redux";
import { openAlert, closeAlert, openLoader } from "@/redux/alerts";
import { activeContractDetails } from "@/types/types";
import DatePicker from "react-datepicker";
import { useProfile } from "@lens-protocol/react-web";
import getLensProfileData, { UserProfile } from "@/utils/getLensProfile";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";

import "react-datepicker/dist/react-datepicker.css";

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

const AwaitingApprovalContractModal = ({
  handleCloseModal,
  contractDetails,
}: Props) => {
  const dispatch = useDispatch();
  const { address } = useAccount();
  const myDivRef = useRef<HTMLDivElement>(null);
  const [showMobile, setShowMobile] = useState(false);
  const [showClientView, setShowClientView] = useState(
    (address as string) === contractDetails.clientAddress
  );
  const [newDueDate, setNewDueDate] = useState(contractDetails.dueDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNewDatePicker, setShowNewDatePicker] = useState(false);
  const [userData, setUserData] = useState<UserProfile>();
  const { data: profile, loading: profileLoading } = useProfile({
    forProfileId: showClientView
      ? contractDetails.freelancerHandle
      : contractDetails.clientHandle,
  });
  // const { data: profile, loading: profileLoading } = useProfile({
  //   forHandle: "@adam_",
  // });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    setShowMobile(true);

    function handleClickOutside(event: any) {
      if (
        myDivRef.current &&
        !myDivRef.current.contains(event.target as Node)
      ) {
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

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handlePickDate = (date: Date | null) => {
    if (date !== null) {
      setNewDueDate(date);
    }
    toggleDatePicker();
  };

  const handleRelease = async () => {
    if (
      contractDetails.escrowId !== undefined &&
      contractDetails.id !== undefined
    ) {
      dispatch(
        openLoader({
          displaytransactionLoader: true,
          text: "Releasing Payement",
        })
      );

      const hash = await release_payement(
        contractDetails.id,
        contractDetails,
        dispatch
      );
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 1,
            variant: "Successful",
            classname: "text-black",
            title: "Submission Successful",
            tag1: "Payement release",
            tag2: "contract completed",
          },
        })
      );
      setTimeout(() => {
        dispatch(closeAlert());
      }, 10000);
      handleCloseModal?.();
    }
  };

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

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
      className={`view-job-modal-section sm:w-full rounded-[12px] px-[16px] sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""} h-fit`}
      ref={myDivRef}
    >
      <div className="w-[667px] sm:w-full flex justify-between items-center py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
        <span className="leading-[14.52px] text-[14px] font-semibold text-[black]">
          Work Approval - {showClientView ? "Client" : "Freelancer"}
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
          <Skeleton
            className="w-full h-[80px]"
            baseColor="#E4E4E7"
            borderRadius={"12px"}
          />
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
          <span className="text-[14px] leading-[16.94px] font-medium">
            Client Wallet Address
          </span>
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
          <span className="text-[14px] leading-[16.94px] font-medium">
            Payment Amount
          </span>
          <span className="text-[12px] leading-[14.52px] font-normal">
            ${contractDetails.paymentAmount}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex sm:flex-col w-full justify-between sm:justify-start sm:gap-[6px]">
          <div className="flex flex-col gap-[6px]">
            <span className="text-[14px] leading-[16.94px] font-medium">
              Due Date
            </span>
            <span className="text-[12px] leading-[14.52px] font-normal">
              {formatDate(contractDetails.dueDate)}
            </span>
          </div>
          {showNewDatePicker && (
            <div className="w-1/2 sm:w-full">
              <span
                className={`leading-[14.52px] text-[14px] font-mediumtext-[black]`}
              >
                New Due Date
              </span>
              <button
                className="w-full sm:w-full rounded-[8px] border-[1px] border-[#E4E4E7] p-[7px] flex justify-between items-center relative"
                onClick={() => setShowDatePicker(true)}
              >
                <DatePicker
                  selected={newDueDate}
                  onSelect={(date) => handlePickDate(date)}
                  className="font-normal leading-[14.52px] text-[14px] text-[#707070]"
                  open={showDatePicker}
                  onClickOutside={() => setShowDatePicker(false)}
                />
                <Image
                  src="/images/calender.svg"
                  alt="drop-down icon"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-[6px] mt-[16px]">
          <span className="text-[14px] leading-[16.94px] font-medium text-[#351A6B]">
            {showClientView
              ? "Freelancer has requested payment."
              : "Awaiting client approval and payment release"}
          </span>
        </div>
        <div className="relative flex sm:flex-col w-full justify-center sm:items-center gap-[16px] sm:gap-[6px] mt-[30px] sm:mt-[16px]">
          {showClientView && (
            <>
              <button
                className="w-fit h-fit py-[10px] px-[23px] sm:px-[0px] sm:w-full text-[14px] leading-[14.5px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]"
                onClick={() => setShowNewDatePicker(!showNewDatePicker)}
              >
                Request Extension
              </button>
              <button
                className="w-fit h-fit py-[10px] px-[23px] sm:px-[0px] sm:w-full text-[14px] leading-[14.5px] text-white bg-[#351A6B] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]"
                onClick={handleRelease}
              >
                Release Payment
              </button>
            </>
          )}
          <button className="w-fit h-fit py-[10px] px-[23px] sm:px-[0px] sm:w-full text-[14px] leading-[14.5px] text-black bg-[#E4E4E7] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]">
            Open A Dispute
          </button>
        </div>
      </div>
    </div>
  );
};

export default AwaitingApprovalContractModal;
