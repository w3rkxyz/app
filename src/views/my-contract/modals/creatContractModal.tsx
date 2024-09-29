"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import MyButton from "@/components/reusable/Button/Button";
import { useAccount } from "wagmi";
import type { contractDetails } from "@/types/types";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

type Props = {
  handleCloseModal?: () => void;
  setCreationStage: any;
  setContractDetails: any;
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

const CreateContractModal = ({
  handleCloseModal,
  setCreationStage,
  setContractDetails,
  contractDetails,
}: Props) => {
  const { address } = useAccount();
  const myDivRef = useRef<HTMLDivElement>(null);
  const tokenModalRef = useRef<HTMLButtonElement>(null);
  const [showMobile, setShowMobile] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const [title, setTitle] = useState(contractDetails.title);
  const [description, setDescription] = useState(contractDetails.description);
  const [clientAddress, setClientAddress] = useState(
    contractDetails.clientAddress
  );
  const [freelancerAddress, setFreelancerAddress] = useState(
    contractDetails.freelancerAddress
  );
  const [paymentAmount, setPaymentAmount] = useState(
    contractDetails.paymentAmount
  );
  const [dueDate, setDueDate] = useState(contractDetails.dueDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleTokensModal = () => {
    setShowTokens(!showTokens);
  };

  const onCLickToken = (index: number) => {
    if (selectedTokens.includes(index)) {
      const updated = selectedTokens.filter((item) => item !== index);
      setSelectedTokens(updated);
    } else {
      var current = [...selectedTokens];
      current.push(index);
      setSelectedTokens(current);
    }
  };

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

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handlePickDate = (date: Date | null) => {
    if (date !== null) {
      setDueDate(date);
    }
    toggleDatePicker();
  };

  const handleSubmit = () => {
    const details: contractDetails = {
      title,
      description,
      clientAddress: address as string,
      freelancerAddress,
      paymentAmount,
      dueDate,
    };
    setContractDetails(details);
    setCreationStage(2);
  };

  return (
    <div
      className={`view-job-modal-section sm:w-full rounded-[12px] px-[16px] sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white nav-space sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""}`}
      ref={myDivRef}
    >
      <div className="w-[667px] sm:w-full flex justify-between items-center py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
        <span className="leading-[14.52px] text-[14px] font-semibold text-[black]">
          Create Contract Proposal
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
        <div className="flex flex-col gap-[8px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-semibold text-[black]">
            Step 1/2
          </span>
          <div className="w-full relative flex items-center justify-center">
            <div className="bg-[#351A6B] w-1/2 h-[4px] rounded-[3px] absolute left-0"></div>
            <div className="bg-[#351A6B] w-[16px] h-[16px] rounded-[16px] absolute"></div>
          </div>
        </div>
        <div className="flex flex-col gap-[4px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Contract Title
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Title your contract.."
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
        </div>
        <div className="flex flex-col gap-[4px] sm:gap-[6px] mb-[16px]">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Description
          </span>
          <textarea
            className="form-input rounded-[12px] p-[11px] h-[160px] border-[1px] border-[#E4E4E7] resize-none sm:w-full"
            placeholder="Type a description.."
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          />
        </div>
        <div className="flex sm:flex-col gap-[16px] mb-[16px]">
          <div className="flex-1">
            <span
              className={`leading-[14.52px] text-[14px] font-mediumtext-[black]`}
            >
              Your Address
            </span>
            <input
              className="form-input rounded-[8px] px-[11px] py-[7px] border-[1px] border-[#E4E4E7]"
              value={address}
              disabled
            />
          </div>
          <div className="flex-1">
            <span
              className={`leading-[14.52px] text-[14px] font-medium text-[black]`}
            >
              Freelancer Wallet Address
            </span>
            <input
              className={`form-input rounded-[8px] px-[11px] py-[7px] border-[1px] border-[#E4E4E7]`}
              placeholder="Freelancer wallet address"
              type="text"
              onChange={(e) => setFreelancerAddress(e.target.value)}
              value={freelancerAddress}
            />
          </div>
        </div>
        <div className="flex sm:flex-col gap-[16px] mb-[16px]">
          <div className="flex-1">
            <span
              className={`leading-[14.52px] text-[14px] font-mediumtext-[black]`}
            >
              Payment Amount
            </span>
            <input
              className="form-input rounded-[8px] px-[11px] py-[7px] border-[1px] border-[#E4E4E7]"
              value={paymentAmount}
              placeholder="Fixed amount price in USD"
              type="number"
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <span
              className={`leading-[14.52px] text-[14px] font-medium text-[black]`}
            >
              Payment Currency
            </span>
            <button
              className="w-full sm:w-full rounded-[8px] border-[1px] border-[#E4E4E7] p-[7px] flex justify-between items-center relative"
              onClick={(e) => {
                e.stopPropagation();
                toggleTokensModal();
              }}
              ref={tokenModalRef}
            >
              {selectedTokens.length > 0 ? (
                <span className="flex gap-[3px]">
                  {selectedTokens.map((tokenIndex) => {
                    return (
                      <Image
                        src={tokens[tokenIndex].image}
                        alt="token icon"
                        width={20}
                        height={20}
                        key={tokenIndex}
                      />
                    );
                  })}
                </span>
              ) : (
                <span className="font-normal leading-[14.52px] text-[12px] text-[#707070]">
                  Select Tokens
                </span>
              )}
              <Image
                src="/images/drop-down.svg"
                alt="drop-down icon"
                width={20}
                height={20}
              />
              <div
                className={`find-work-message-section w-[100%] bg-[#FFFFFF] rounded-[8px] p-[16px] sm:items-start gap-[6px] absolute top-[100%] sm:top-[-265px] left-0
              border-[1px] border-[#E4E4E7] ${
                showTokens ? "flex" : "hidden"
              } flex-col z-[999]`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {tokens.map((token, index) => (
                  <button
                    key={index}
                    className={`flex gap-[8px] items-center rounded-[6px] ${
                      selectedTokens?.includes(index)
                        ? "border-[1px] border-black"
                        : ""
                    }`}
                    onClick={() => onCLickToken(index)}
                  >
                    <Image
                      src={token.image}
                      alt="token icon"
                      width={20}
                      height={20}
                    />
                    <span className="font-medium text-[11px] leading-[20px] text-black">
                      {token.text}
                    </span>
                  </button>
                ))}
              </div>
            </button>
          </div>
        </div>
        <div className="flex w-full mb-[21px]">
          <div className="w-1/2 sm:w-full">
            <span
              className={`leading-[14.52px] text-[14px] font-mediumtext-[black]`}
            >
              Due Date
            </span>
            <button
              className="w-full sm:w-full rounded-[8px] border-[1px] border-[#E4E4E7] p-[7px] flex justify-between items-center relative"
              onClick={() => setShowDatePicker(true)}
            >
              <DatePicker
                selected={dueDate}
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
        </div>

        <button
          className="mx-auto w-fit flex gap-[5px] py-[10px] px-[23px] tx-[14px] leading-[14.5px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]"
          onClick={handleSubmit}
        >
          Next
          <Image
            src={"/images/arrow-right.svg"}
            alt="paco pic"
            width={14}
            height={14}
          />
        </button>
      </div>
    </div>
  );
};

export default CreateContractModal;
