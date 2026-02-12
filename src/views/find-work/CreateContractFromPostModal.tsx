"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { create_proposal } from "@/api";
import { openLoader, openAlert, closeAlert } from "@/redux/alerts";
import type { JobData } from "@/types/job";
import Image from "next/image";

type Props = {
  jobData: JobData;
  onClose: () => void;
};

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CreateContractFromPostModal = ({ jobData, onClose }: Props) => {
  const dispatch = useDispatch();
  const modalRef = useRef<HTMLDivElement>(null);
  const { user: userProfile } = useSelector((state: any) => state.app);
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const handleSubmit = async () => {
    if (!userProfile?.address) {
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 2,
            variant: "Failed",
            classname: "text-black",
            title: "Profile Required",
            tag1: "Create/select your Lens profile before sending a proposal",
            tag2: "Then try again",
          },
        })
      );
      setTimeout(() => dispatch(closeAlert()), 6000);
      return;
    }

    if (!jobData.freelancerAddress) {
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 2,
            variant: "Failed",
            classname: "text-black",
            title: "Invalid Freelancer",
            tag1: "Could not resolve freelancer Lens account address",
            tag2: "Please create contract manually in My Contracts",
          },
        })
      );
      setTimeout(() => dispatch(closeAlert()), 6000);
      return;
    }

    const normalizedAmount = String(jobData.paymentAmount || "").replace(/[^0-9.]/g, "");

    if (!normalizedAmount || Number(normalizedAmount) <= 0) {
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 2,
            variant: "Failed",
            classname: "text-black",
            title: "Invalid Amount",
            tag1: "Could not read payment amount from this post",
            tag2: "Please create contract manually in My Contracts",
          },
        })
      );
      setTimeout(() => dispatch(closeAlert()), 6000);
      return;
    }

    dispatch(openLoader({ displaytransactionLoader: true, text: "Creating Contract Proposal" }));

    const tokenAddress =
      process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xfa0b2925eC86370DCA72cF9e4D78e0b8E6B60a82";
    const clientLensAccountAddress = userProfile?.address;
    const senderHandle = userProfile?.userLink;

    const hash = await create_proposal(
      normalizedAmount,
      jobData.freelancerAddress,
      jobData.title,
      jobData.description,
      dueDate,
      tokenAddress,
      dispatch,
      senderHandle,
      clientLensAccountAddress
    );

    if (hash) {
      dispatch(
        openAlert({
          displayAlert: true,
          data: {
            id: 1,
            variant: "Successful",
            classname: "text-black",
            title: "Proposal Created",
            tag1: `Contract proposal sent to ${jobData.freelancerHandle}`,
            tag2: "View on Lens Explorer",
            hash,
          },
        })
      );
      setTimeout(() => dispatch(closeAlert()), 10000);
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflowY = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflowY = "auto";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[99992] bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end">
      <div
        ref={modalRef}
        className="bg-white rounded-[12px] p-[24px] sm:p-[16px] w-[500px] sm:w-full sm:rounded-tl-[12px] sm:rounded-tr-[12px] max-w-[90vw]"
      >
        <div className="w-full flex justify-between items-center mb-[16px]">
          <h2 className="text-[18px] font-semibold">Create Contract Proposal</h2>
          <Image
            src="/images/Close.svg"
            alt="close icon"
            className="cursor-pointer"
            width={20}
            height={20}
            onClick={onClose}
          />
        </div>

        <div className="mb-[12px]">
          <label className="text-[14px] font-medium">Title</label>
          <p className="text-[14px] text-gray-700 mt-[4px]">{jobData.title}</p>
        </div>

        <div className="mb-[12px]">
          <label className="text-[14px] font-medium">Freelancer</label>
          <p className="text-[14px] text-gray-700 mt-[4px]">{jobData.freelancerHandle}</p>
          <p className="text-[12px] text-gray-500 truncate">{jobData.freelancerAddress}</p>
        </div>

        <div className="mb-[12px]">
          <label className="text-[14px] font-medium">Payment</label>
          <p className="text-[14px] text-gray-700 mt-[4px]">
            ${jobData.paymentAmount} {jobData.paymentType === "hourly" ? "/hr" : "(Fixed)"}
          </p>
        </div>

        <div className="mb-[24px]">
          <label className="text-[14px] font-medium">Due Date</label>
          <input
            type="date"
            value={formatDateForInput(dueDate)}
            onChange={e => setDueDate(new Date(`${e.target.value}T00:00:00`))}
            className="w-full border rounded-[8px] p-[8px] mt-[4px]"
            min={formatDateForInput(new Date())}
          />
        </div>

        <div className="flex gap-[12px] justify-end">
          <button
            onClick={onClose}
            className="py-[10px] px-[20px] bg-gray-200 rounded-[8px] font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="py-[10px] px-[20px] bg-[#351A6B] text-white rounded-[8px] font-semibold"
          >
            Send Proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContractFromPostModal;
