"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import MyButton from "@/components/reusable/Button/Button";
import { useAccount } from "wagmi";
import type { contractDetails } from "@/types/types";
import { create_proposal } from "@/api";
// All contract data stored on-chain
import { useDispatch, useSelector } from "react-redux";
import { openAlert, closeAlert } from "@/redux/alerts";
import { openLoader } from "@/redux/alerts";

type Props = {
  handleCloseModal?: () => void;
  setCreationStage: any;
  contractDetails: contractDetails;
};

const tokens = [
  { text: "Bitcoin (BTC)", image: "/images/btc.svg" },
  { text: "Ethereum (ETH)", image: "/images/eth.svg" },
  { text: "Tether (USDT)", image: "/images/usdt.svg" },
  { text: "BNB (BNB)", image: "/images/bnb.svg" },
  { text: "Solana (SOL)", image: "/images/solana.svg" },
  { text: "USDC (USDC)", image: "/images/usdc.svg" },
  { text: "Dai (DAI)", image: "/images/dai.svg" },
  { text: "GHO (GHO)", image: "/images/green-coin.svg" },
  // { text: "Bonsai (BONSAI)", image: "/images/bw-coin.svg" },
];

const ReviewContractModal = ({ handleCloseModal, setCreationStage, contractDetails }: Props) => {
  const { user: userProfile } = useSelector((state: any) => state.app);
  const { address } = useAccount();
  const myDivRef = useRef<HTMLDivElement>(null);
  const tagModalRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tokenModalRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch();
  const [showMobile, setShowMobile] = useState(true);

  const [showTokens, setShowTokens] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);

  const toggleTokensModal = () => {
    setShowTokens(!showTokens);
  };

  const onCLickToken = (index: number) => {
    if (selectedTokens.includes(index)) {
      const updated = selectedTokens.filter(item => item !== index);
      setSelectedTokens(updated);
    } else {
      var current = [...selectedTokens];
      current.push(index);
      setSelectedTokens(current);
    }
  };

  const handleSubmit = async () => {
    dispatch(
      openLoader({
        displaytransactionLoader: true,
        text: "Creating Contract Proposal",
      })
    );

    const senderHandle = userProfile ? userProfile.userLink : undefined;
    const clientLensAccountAddress = userProfile?.address; // Client's Lens Account address
    
    // Get token address - using MockPaymentToken for now
    // TODO: Get selected token address from user selection
    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xfa0b2925eC86370DCA72cF9e4D78e0b8E6B60a82";
    
    // NEW SIGNATURE: create_proposal(amount, freelancerAccount, title, description, dueDate, tokenAddress, dispatch, senderHandle, clientLensAccountAddress)
    // All data is passed directly to the contract
    // IMPORTANT: Transaction must be sent from Lens Account, not EOA
    const hash = await create_proposal(
      contractDetails.paymentAmount.toString(),
      contractDetails.freelancerAddress, // Freelancer's Lens Account address
      contractDetails.title,             // On-chain title
      contractDetails.description,        // On-chain description
      contractDetails.dueDate,           // On-chain due date
      tokenAddress,                      // Payment token address
      dispatch,
      senderHandle,
      clientLensAccountAddress           // Client's Lens Account address (for balance check)
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
            tag1: "Contract Proposal created",
            tag2: "View on Lens Explorer",
            hash: hash,
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

  return (
    <div
      className={`view-job-modal-section sm:w-full rounded-[12px] px-7 py-3 sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""} h-fit`}
      ref={myDivRef}
    >
      {/* <div className="w-[667px] sm:w-full flex justify-between items-center py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
        <span className="leading-[14.52px] text-[14px] font-semibold text-[black]">
          Review & Submit
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
          <span className="text-[#83899F] text-[13px]">Step 2 of 2</span>
          <span className="leading-[14.52px] text-[20px] font-medium text-[black]">
            Review & Submit
          </span>
          <span className="text-[#83899F] text-base">Review the proposal and submit.</span>
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
        {/* <div className="flex flex-col gap-[8px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-semibold text-[black]">Step 2/2</span>
          <div className="w-full relative flex items-center justify-center">
            <div className="bg-[#351A6B] w-full h-[4px] rounded-[3px] absolute left-0"></div>
            <div className="bg-[#351A6B] w-[16px] h-[16px] rounded-[16px] absolute"></div>
          </div>
        </div> */}
        <h3 className="text-[16px] leading-[19.36px] font-semibold mb-[6px]">
          {contractDetails.title}
        </h3>
        <p className="line-clamp-4 sm:line-clamp-6 text-sm leading-[20px] font-normal text-[#6C6C6C]">
          {contractDetails.description}
        </p>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">Due Date</span>
          <span className="text-sm text-[#6C6C6C] leading-[14.52px] font-normal">
            {contractDetails.dueDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
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
          <span className="text-sm leading-[14.52px] text-[#6C6C6C] font-normal">
            {contractDetails.clientAddress}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] leading-[16.94px] font-medium">
            Freelancer Wallet Address
          </span>
          <span className="text-sm leading-[14.52px] text-[#6C6C6C] font-normal">
            {contractDetails.freelancerAddress}
          </span>
        </div>
        <hr className="w-full bg-[#D9D9D9] my-[16px]" />
        <div className="flex flex-col gap-[6px] mb-[60px] sm:mb-[16px]">
          <span className="text-[14px] leading-[16.94px] font-medium">Payment Schedule</span>
          <span className="text-[14px] leading-[16.94px] font-medium text-[#009951]">
            Payment is released upon project completion
          </span>
        </div>
        <div className="relative flex justify-between w-full border-t-[1px] border-t-[#E4E4E7] pt-8">
          <button
            className="flex gap-[5px] text-sm py-[12px] px-[16px] tx-[14px] leading-[14.5px] text-[#212121] bg-transparent rounded-full font-medium mb-[8px] border border-[#212121]"
            onClick={() => setCreationStage(1)}
          >
            Back
          </button>
          <button
            className="flex gap-[5px] text-sm py-[12px] px-[16px] tx-[14px] leading-[14.5px] text-white bg-[#212121] rounded-full font-medium mb-[8px]"
            onClick={handleSubmit}
          >
            Submit Proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewContractModal;
