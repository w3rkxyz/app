"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import MyButton from "@/components/reusable/Button/Button";
import { useAccount } from "wagmi";
import { activeContractDetails, contractDetails } from "@/types/types";
import { evmAddress } from "@lens-protocol/react";
import getLensAccountData, { AccountData } from "@/utils/getLensProfile";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";
import { cancle_proposal, accept_proposal, reject_proposal } from "@/api";
import { useDispatch, useSelector } from "react-redux";
import { openAlert, closeAlert } from "@/redux/alerts";
import { fetchAccount } from "@lens-protocol/client/actions";
import { getPublicClient } from "@/client";
import { isAddress } from "ethers";

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

function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const ViewContractModal = ({ handleCloseModal, contractDetails }: Props) => {
  const { user: userProfile } = useSelector((state: any) => state.app);
  const { address } = useAccount();
  const dispatch = useDispatch();
  const myDivRef = useRef<HTMLDivElement>(null);
  const [showMobile, setShowMobile] = useState(false);
  const [showClientView, setShowClientView] = useState(
    (address as string) === contractDetails.clientAddress
  );
  const [userData, setUserData] = useState<AccountData>();
  const [loadingUser, setLoadingUser] = useState(true);
  const counterpartyAddress = showClientView
    ? contractDetails.freelancerAddress
    : contractDetails.clientAddress;

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
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCounterpartyProfile() {
      if (!counterpartyAddress || !isAddress(counterpartyAddress)) {
        if (active) {
          setUserData(undefined);
          setLoadingUser(false);
        }
        return;
      }

      setLoadingUser(true);

      try {
        const client = getPublicClient();
        const profile = await fetchAccount(client, {
          address: evmAddress(counterpartyAddress),
        }).unwrapOr(null);

        if (!active) return;

        if (profile) {
          setUserData(getLensAccountData(profile));
        } else {
          setUserData(undefined);
        }
      } catch (error) {
        if (active) {
          setUserData(undefined);
        }
        console.error("Error fetching contract counterparty profile:", error);
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    }

    void loadCounterpartyProfile();

    return () => {
      active = false;
    };
  }, [counterpartyAddress]);

  const handleCancle = async () => {
    if (contractDetails.id !== undefined) {
      const hash = await cancle_proposal(contractDetails.id, dispatch);
      if (hash !== undefined) {
        dispatch(
          openAlert({
            displayAlert: true,
            data: {
              id: 1,
              variant: "Successful",
              classname: "text-black",
              title: "Submission Successful",
              tag1: "Contract Proposal cancled",
              tag2: "View on etherscan",
              hash: hash,
            },
          })
        );
        setTimeout(() => {
          dispatch(closeAlert());
        }, 10000);
        handleCloseModal?.();
      }
    }
  };

  const handleReject = async () => {
    if (contractDetails.id !== undefined) {
      const hash = await reject_proposal(contractDetails.id, dispatch);
      if (hash !== undefined) {
        dispatch(
          openAlert({
            displayAlert: true,
            data: {
              id: 1,
              variant: "Successful",
              classname: "text-black",
              title: "Submission Successful",
              tag1: "Contract Proposal rejected",
              tag2: "View on etherscan",
              hash: hash,
            },
          })
        );
        setTimeout(() => {
          dispatch(closeAlert());
        }, 10000);
        handleCloseModal?.();
      }
    }
  };

  const handleAccept = async () => {
    if (contractDetails.id !== undefined) {
      const senderHandle =
         userProfile? userProfile.userLink : undefined;
      const hash = await accept_proposal(
        contractDetails.id,
        contractDetails,
        dispatch,
        senderHandle
      );
      if (hash !== undefined) {
        dispatch(
          openAlert({
            displayAlert: true,
            data: {
              id: 1,
              variant: "Successful",
              classname: "text-black",
              title: "Submission Successful",
              tag1: "Contract Proposal accepted",
              tag2: "View on etherscan",
              hash: hash,
            },
          })
        );
        setTimeout(() => {
          dispatch(closeAlert());
        }, 10000);
        handleCloseModal?.();
      }
    }
  };

  return (
    <div
      className={`view-job-modal-section sm:w-full rounded-[12px] px-7 py-3 sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""} h-fit`}
      ref={myDivRef}
    >
      {/* <div className="w-[667px] sm:w-full flex justify-between items-center py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
        <span className="leading-[14.52px] text-[14px] font-semibold text-[black]">
          Contract Proposal Summary - {showClientView ? "Client View" : "Freelancer View"}
        </span>
        <Image
          onClick={handleCloseModal}
          className="cursor-pointer"
          src="/images/Close.svg"
          alt="close icon"
          width={20}
          height={20}
        />
      </div> */}
      <div className="w-[667px] sm:w-full flex items-start justify-between gap-1 py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
        <div className="flex flex-col gap-2">
          <span className="leading-[14.52px] text-[20px] font-medium text-[black]">
            Contract Summary
          </span>
          <span className="text-[#83899F] text-base">Review the contract details and confirm next steps.</span>
        </div>
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
                <div className="border border-[#3E6FC4] text-[#3E6FC4] bg-[#F4F8FF] rounded-lg p-3 flex items-center justify-between mb-3">
          <span>Deadline: 24 August, 2025</span>
          <span>5 Days Remaining </span>
        </div>
        {loadingUser ? (
          <Skeleton className="w-full h-[80px]" baseColor="#E4E4E7" borderRadius={"12px"} />
        ) : userData ? (
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
          <div className="flex sm:flex-col justify-between gap-[8px] sm:gap-[16px] w-full">
            <div className="flex gap-[6px] items-center">
              <Image
                src="https://static.hey.xyz/images/default.png"
                alt="profile fallback"
                width={46}
                height={46}
                className="rounded-[8px] w-[46px] h-[46px]"
              />
              <div className="flex flex-col gap-[0px]">
                <span className="text-[14px] leading-[16.94px] font-semibold">
                  {showClientView ? "Freelancer" : "Client"}
                </span>
                <span className="text-[14px] leading-[20px] font-normal text-[#5A5A5A]">
                  {shortenAddress(counterpartyAddress)}
                </span>
              </div>
            </div>
          </div>
        )}
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <h3 className="text-[16px] leading-[19.36px] font-semibold mb-[6px]">
          {contractDetails.title}
        </h3>
        <p className="line-clamp-4 sm:line-clamp-6 leading-[20px] font-normal text-sm text-[#6C6C6C]">
          {contractDetails.description}
        </p>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">Due Date</span>
          <span className="text-sm text-[#6C6C6C] leading-[14.52px] font-normal">
            {formatDate(contractDetails.dueDate)}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">Payment Amount</span>
          <span className="text-sm text-[#6C6C6C] leading-[14.52px] font-normal">
            ${contractDetails.paymentAmount}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">Your Wallet Address</span>
          <span className="text-sm text-[#6C6C6C] leading-[14.52px] font-normal">
            {contractDetails.clientAddress}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">
            Freelancer Wallet Address
          </span>
          <span className="text-sm text-[#6C6C6C] leading-[14.52px] font-normal">
            {contractDetails.freelancerAddress}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        {/* {!showClientView && (
          <div className="flex flex-col gap-[6px] mb-[16px] sm:mb-[16px]">
            <span className="text-[14px] leading-[16.94px] font-medium text-[#351A6B]">
              Please contact the client directly to request any contract modifications.
            </span>
          </div>
        )} */}
        {/* <div className="relative flex sm:flex-col w-full justify-center sm:items-center gap-[16px] sm:gap-[6px]">
          {!showClientView ? (
            <>
              <button
                className="w-fit h-fit py-[10px] px-[23px] sm:px-[65.5px] text-[14px] leading-[14.5px] text-white bg-[#00BA00] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]"
                onClick={handleAccept}
              >
                Accept
              </button>
              <button
                className="w-fit h-fit py-[10px] px-[23px] sm:px-[65.5px] text-[14px] leading-[14.5px] text-white bg-[#FF5757] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]"
                onClick={handleReject}
              >
                Reject
              </button>
            </>
          ) : (
            <button
              className="w-fit h-fit py-[10px] px-[24px] sm:px-[35px] text-[14px] leading-[14.5px] text-white bg-[#FF5757] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]"
              onClick={handleCancle}
            >
              Cancel Proposal
            </button>
          )}
        </div> */}
        <div className="py-[13px] border-t-[1px] border-t-[#E4E4E7] mt-10 flex items-center justify-end gap-2">
          <button
            type="button"
            className="flex gap-[5px] text-sm py-[12px] px-[16px] tx-[14px] leading-[14.5px] text-[#212121] border border-[#212121] bg-transparent rounded-full font-medium mb-[8px]"
            // onClick={handleSubmit}
          >
            Request Extension
          </button>
          <button
            type="button"
            className="flex gap-[5px] text-sm py-[12px] px-[16px] tx-[14px] leading-[14.5px] text-white bg-[#212121] rounded-full font-medium mb-[8px]"
            // onClick={handleSubmit}
          >
            Release Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewContractModal;
