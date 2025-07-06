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
import type { activeContractDetails, contractDetails } from "@/types/types";
import { get_all_contracts, getContract, contractInstance } from "@/api";
import { useAccount } from "wagmi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSearchParams } from "next/navigation";
import { useAccount as useLensAccount } from "@lens-protocol/react";

const contractTypes = [
  "Proposals",
  "In-Progress",
  "Awaiting Approval",
  // "Open Disputes",
  "Completed",
];

const contractStateFilters = [
  "proposal",
  "inProgress",
  "awaitingApproval",
  // "Open Disputes",
  "completed",
];

const Contracts = () => {
  const searchParams = useSearchParams();
  const freelancer = searchParams.get("freelancer");
  const [freelancerId, setFreelancerId] = useState(freelancer !== null ? freelancer : "");
  // const { data: profile, loading: loadingProfile } = useProfile({
  //   forHandle: `lens/${freelancerId as string}`,
  // });
  const { data: profile, loading: loadingProfile } = useLensAccount({
    legacyProfileId: freelancerId, 
  });
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | null>(null);
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contracts, setContracts] = useState<activeContractDetails[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [showTypesMobile, setShowTypesMobile] = useState(false);
  const [type, setType] = useState("Proposals");
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [creationStage, setCreationStage] = useState(1);
  const [selectedContract, setSelectedContract] = useState<activeContractDetails | undefined>();
  const [newContractDetails, setNewContractDetails] = useState<any>({
    title: "",
    description: "",
    clientAddress: "",
    freelancerAddress: "",
    paymentAmount: 0,
    dueDate: new Date(),
    state: "",
  });

  const handleOpenModal = (contract: activeContractDetails) => {
    setType(contract.state);
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleSubmitContract = () => {
    setShowCreateContractModal(false);
    setNewContractDetails({
      title: "",
      description: "",
      clientAddress: "",
      freelancerAddress: "",
      paymentAmount: 0,
      dueDate: new Date(),
      state: "",
    });
    setCreationStage(1);
  };

  const getData = async () => {
    if (address) {
      try {
        const contracts = await get_all_contracts(address);
        const newContracts = [...contracts];
        setContracts(newContracts);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      } finally {
        setLoadingContracts(false);
      }
    }
  };

  useEffect(() => {
    if (address) {
      getData();

      // Set up event listener for contract updates
      const handleContractUpdate = (client: string, freelancer: string, event: any) => {
        if (client === address || freelancer === address) {
          getData();
        }
      };

      // Subscribe to contract events
      contractInstance.on("ContractUpdate", handleContractUpdate);

      // Cleanup function
      return () => {
        contractInstance.off("ContractUpdate", handleContractUpdate);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    if (profile) {
      console.log("Profile: ", profile);
      setShowCreateContractModal(true);
    }
  }, [profile]);

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
              onClick={() => {
                setFreelancerId("");
                setShowCreateContractModal(true);
              }}
            >
              Create New Contract
            </button>
          </div>
          <div className="hidden md:flex w-full md:items-center flex-col relative">
            <button
              className={`w-full py-[12px] flex items-center justify-center leading-[14.52px] text-[14px] text-white font-semibold bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] mb-[14px] md:max-w-[600px]`}
              onClick={() => {
                setFreelancerId("");
                setShowCreateContractModal(true);
              }}
            >
              Create New Contract
            </button>
            <button
              className="w-full rounded-[12px] border-[1px] border-[#E4E4E7] px-[14px] py-[10px] flex justify-between items-center relative md:max-w-[600px]"
              onClick={() => setShowTypesMobile(!showTypesMobile)}
            >
              <span className="font-medium leading-[16.94px] text-[14px] text-black">
                {selectedTypeFilter === null ? "Contracts" : contractTypes[selectedTypeFilter]}
              </span>
              <Image src="/images/drop-down.svg" alt="drop-down icon" width={20} height={20} />
              {showTypesMobile && (
                <div
                  className="find-work-message-section w-full h-fit bg-[#FFFFFF] rounded-[16px] p-[16px] items-center gap-2 
            border-[1px] border-[#E4E4E7] absolute top-[50px] left-0"
                >
                  <div className="w-full flex flex-col gap-[8px]">
                    {contractTypes.map((type: string, index: number) => {
                      return (
                        <div
                          key={index}
                          className={`w-full py-[12px] flex items-center justify-center leading-[14.52px] text-[12px] font-semibold border-[1px] rounded-[8px] ${
                            selectedTypeFilter === index
                              ? "bg-[#E4E4E7] border-[#000000]"
                              : "bg-[#FFFFFF] border-[#E4E4E7]"
                          }`}
                          onClick={() => setSelectedTypeFilter(index)}
                        >
                          {type}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </button>
          </div>

          <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-1 flex-col gap-[16px]">
            {/* {contractTypes.map((type: string, index: number) => {
              return (
                <ContractCard
                  key={index}
                  type={type}
                  onCardClick={() => handleOpenModal(type)}
                />
              );
            })} */}
            {loadingContracts ? (
              <>
                <Skeleton
                  className="h-[208px] w-full rounded-[16px] sm:h-[340px]"
                  baseColor="#E4E4E7"
                  borderRadius={"12px"}
                />
                <Skeleton
                  className="h-[208px] w-full rounded-[16px] sm:h-[340px]"
                  baseColor="#E4E4E7"
                  borderRadius={"12px"}
                />
                <Skeleton
                  className="h-[208px] w-full rounded-[16px] sm:h-[340px]"
                  baseColor="#E4E4E7"
                  borderRadius={"12px"}
                />
              </>
            ) : contracts.length > 0 ? (
              contracts.map((contract, index) => {
                if (selectedTypeFilter === null) {
                  return (
                    <ContractCard
                      key={index}
                      type={type}
                      contractDetails={contract}
                      onCardClick={() => handleOpenModal(contract)}
                    />
                  );
                } else if (contract.state === contractStateFilters[selectedTypeFilter]) {
                  return (
                    <ContractCard
                      key={index}
                      type={type}
                      contractDetails={contract}
                      onCardClick={() => handleOpenModal(contract)}
                    />
                  );
                }
              })
            ) : (
              <div className="h-[460px] w-full flex flex-col gap-[11px] justify-center items-center">
                <Image
                  src="/images/case-grey.svg"
                  alt="job post icon"
                  color="black"
                  width={24}
                  height={21}
                />
                <span className="leading-[16.94px] max-w-[280px] text-center text-[16px] font-semibold text-[#707070]">
                  User has no job/service posts yet
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {showCreateContractModal && (
        <div className="fixed h-screen w-screen overflow-hidden inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            {creationStage === 1 && (
              <CreateContractModal
                handleCloseModal={() => setShowCreateContractModal(false)}
                setCreationStage={setCreationStage}
                setContractDetails={setNewContractDetails}
                contractDetails={newContractDetails}
                freelancer={profile}
              />
            )}
            {creationStage === 2 && (
              <ReviewContractModal
                handleCloseModal={handleSubmitContract}
                setCreationStage={setCreationStage}
                contractDetails={newContractDetails}
              />
            )}
          </div>
        </div>
      )}
      {isModalOpen && selectedContract && (
        <div className="fixed h-screen w-screen overflow-hidden inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            {type === "completed" && (
              <CompletedContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                contractDetails={selectedContract}
              />
            )}
            {type === "inProgress" && (
              <InProgressContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                contractDetails={selectedContract}
              />
            )}
            {type === "awaitingApproval" && (
              <AwaitingApprovalContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                contractDetails={selectedContract}
              />
            )}
            {type === "proposal" && (
              <ViewContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                contractDetails={selectedContract}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
