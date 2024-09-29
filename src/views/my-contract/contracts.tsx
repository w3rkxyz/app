"use client";

import Image from "next/image";
import ContractCard from "@/components/Cards/contractCard";
import ViewJobModal from "../view-job-modal/view-job-modal";
import { useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import CreateContractModal from "./modals/creatContractModal";
import ReviewContractModal from "./modals/reviewContractModal";
import ViewContractModal from "./modals/viewContractModal";
import InProgressContractModal from "./modals/inProgressContractModal";
import AwaitingApprovalContractModal from "./modals/awaitingApprovalContractModal";
import CompletedContractModal from "./modals/CompletedContractModal";
import type { contractDetails } from "@/types/types";

const contractTypes = [
  "Proposals",
  "In-Progress",
  "Awaiting Approval",
  "Open Disputes",
  "Completed",
];

const Contracts = () => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTypesMobile, setShowTypesMobile] = useState(false);
  const [type, setType] = useState("Proposals");
  const [creationStage, setCreationStage] = useState(1);
  const [newContractDetails, setNewContractDetails] = useState<contractDetails>(
    {
      title: "",
      description: "",
      clientAddress: "",
      freelancerAddress: "",
      paymentAmount: 0,
      dueDate: new Date(),
    }
  );

  const handleOpenModal = (type: string) => {
    setType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="find-work-section pt-[82px] md:pt-[110px] sm:pt-[60px] mb-[20px]">
      <div className="custom-container">
        <div className="tags-section w-full flex md:justify-center md:flex-col gap-[45px] mt-[50px] md:mt-[0px] sm:mt-[16px]">
          <div
            className="find-work-message-section w-[300px] flex-shrink-0 h-fit sm:h-auto md:h-auto sm:my-0 sm:py-0 bg-[#FFFFFF] sm:bg-transparent md:bg-transparent rounded-[20px] sm:rounded-[0px] p-[16px] sm:w-full sm:items-center gap-2 sm:whitespace-nowrap md:w-full md:items-center md:whitespace-nowrap overflow-x-auto sm:ml-[-20px]
            border-[1px] border-[#E4E4E7] md:hidden"
          >
            <h4 className="text-[20px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-center pb-[17px] sm:pb-[10px] md:pb-[10px]">
              Contracts
            </h4>
            <hr className="bg-[#E4E4E7] mb-[17px]" />
            <div className="w-full flex flex-col gap-[8px] mb-[321px]">
              {contractTypes.map((type: string, index: number) => {
                return (
                  <button
                    key={index}
                    className={`w-full py-[12px] flex items-center justify-center leading-[14.52px] text-[12px] font-semibold border-[1px] rounded-[8px] ${
                      selectedTypeFilter === index
                        ? "bg-[#E4E4E7] border-[#000000]"
                        : "bg-[#FFFFFF] border-[#E4E4E7]"
                    }`}
                    onClick={() => setSelectedTypeFilter(index)}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            <button
              className={`w-full py-[12px] flex items-center justify-center leading-[14.52px] text-[12px] text-white font-semibold bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px]`}
            >
              Create New Contract
            </button>
          </div>
          <div className="hidden md:flex w-full md:items-center flex-col relative">
            <button
              className={`w-full py-[12px] flex items-center justify-center leading-[14.52px] text-[14px] text-white font-semibold bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] mb-[14px] md:max-w-[600px]`}
            >
              Create New Contract
            </button>
            <button
              className="w-full rounded-[12px] border-[1px] border-[#E4E4E7] px-[14px] py-[10px] flex justify-between items-center relative md:max-w-[600px]"
              onClick={() => setShowTypesMobile(!showTypesMobile)}
            >
              <span className="font-medium leading-[16.94px] text-[14px] text-black">
                {selectedTypeFilter === null
                  ? "Contracts"
                  : contractTypes[selectedTypeFilter]}
              </span>
              <Image
                src="/images/drop-down.svg"
                alt="drop-down icon"
                width={20}
                height={20}
              />
              {showTypesMobile && (
                <div
                  className="find-work-message-section w-full h-fit bg-[#FFFFFF] rounded-[16px] p-[16px] items-center gap-2 
            border-[1px] border-[#E4E4E7] absolute top-[50px] left-0"
                >
                  <div className="w-full flex flex-col gap-[8px]">
                    {contractTypes.map((type: string, index: number) => {
                      return (
                        <button
                          key={index}
                          className={`w-full py-[12px] flex items-center justify-center leading-[14.52px] text-[12px] font-semibold border-[1px] rounded-[8px] ${
                            selectedTypeFilter === index
                              ? "bg-[#E4E4E7] border-[#000000]"
                              : "bg-[#FFFFFF] border-[#E4E4E7]"
                          }`}
                          onClick={() => setSelectedTypeFilter(index)}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </button>
          </div>

          <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-1 flex-col gap-[16px]">
            {contractTypes.map((type: string, index: number) => {
              return (
                <ContractCard
                  key={index}
                  type={type}
                  onCardClick={() => handleOpenModal(type)}
                />
              );
            })}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed h-screen w-screen overflow-hidden inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            {type === "Completed" && (
              <CompletedContractModal
                handleCloseModal={() => setIsModalOpen(false)}
              />
            )}
            {type === "Proposals" && creationStage === 1 && (
              <CreateContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                setCreationStage={setCreationStage}
                setContractDetails={setNewContractDetails}
                contractDetails={newContractDetails}
              />
            )}
            {type === "Proposals" && creationStage === 2 && (
              <ReviewContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                setCreationStage={setCreationStage}
                contractDetails={newContractDetails}
              />
            )}
            {type === "In-Progress" && (
              <InProgressContractModal
                handleCloseModal={() => setIsModalOpen(false)}
              />
            )}
            {type === "Awaiting Approval" && (
              <AwaitingApprovalContractModal
                handleCloseModal={() => setIsModalOpen(false)}
              />
            )}
            {type === "Open Disputes" && (
              <ViewContractModal
                handleCloseModal={() => setIsModalOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
