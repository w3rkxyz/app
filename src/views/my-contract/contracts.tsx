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
import { get_all_contracts, getContract, getContractInstance } from "@/api";
import { useAccount } from "wagmi";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSearchParams } from "next/navigation";
import { useAccount as useLensAccount } from "@lens-protocol/react";

const contractTypes = [
  "New Proposals",
  "In Progress",
  "Awaiting Approval",
  // "Open Disputes",
  // "Completed",
];

const contractStateFilters = [
  "proposal",
  "inProgress",
  "awaitingApproval",
  // "Open Disputes",
  "completed",
];

// Dummy contract data for when no contracts are present
const DUMMY_CONTRACTS: activeContractDetails[] = [
  {
    id: 1,
    title: "Website Updates - Full Stack Developer",
    description: "We're looking for an experienced Solidity developer to review and optimize our DeFi smart contracts. The role involves auditing security risks, reducing gas costs, and improving overall performance.",
    state: "proposal",
    clientHandle: "jeon-smith",
    freelancerHandle: "freelancer-01",
    paymentAmount: 500,
    dueDate: new Date("2025-08-25"),
    clientAddress: "0x0000000000000000000000000000000000000001",
    freelancerAddress: "0x0000000000000000000000000000000000000002",
  },
  {
    id: 2,
    title: "Website Updates - Full Stack Developer",
    description: "We're looking for an experienced Solidity developer to review and optimize our DeFi smart contracts. The role involves auditing security risks, reducing gas costs, and improving overall performance.",
    state: "inProgress",
    clientHandle: "jeon-smith",
    freelancerHandle: "freelancer-01",
    paymentAmount: 500,
    dueDate: new Date("2025-08-25"),
    clientAddress: "0x0000000000000000000000000000000000000001",
    freelancerAddress: "0x0000000000000000000000000000000000000002",
  },
  {
    id: 3,
    title: "Website Updates - Full Stack Developer",
    description: "We're looking for an experienced Solidity developer to review and optimize our DeFi smart contracts. The role involves auditing security risks, reducing gas costs, and improving overall performance.",
    state: "inProgress",
    clientHandle: "jeon-smith",
    freelancerHandle: "freelancer-01",
    paymentAmount: 500,
    dueDate: new Date("2025-08-25"),
    clientAddress: "0x0000000000000000000000000000000000000001",
    freelancerAddress: "0x0000000000000000000000000000000000000002",
  },
  {
    id: 4,
    title: "Website Updates - Full Stack Developer",
    description: "We're looking for an experienced Solidity developer to review and optimize our DeFi smart contracts. The role involves auditing security risks, reducing gas costs, and improving overall performance.",
    state: "awaitingApproval",
    clientHandle: "jeon-smith",
    freelancerHandle: "freelancer-01",
    paymentAmount: 500,
    dueDate: new Date("2025-08-25"),
    clientAddress: "0x0000000000000000000000000000000000000001",
    freelancerAddress: "0x0000000000000000000000000000000000000002",
  },
  {
    id: 5,
    title: "Website Updates - Full Stack Developer",
    description: "We're looking for an experienced Solidity developer to review and optimize our DeFi smart contracts. The role involves auditing security risks, reducing gas costs, and improving overall performance.",
    state: "proposal",
    clientHandle: "jeon-smith",
    freelancerHandle: "freelancer-01",
    paymentAmount: 500,
    dueDate: new Date("2025-08-25"),
    clientAddress: "0x0000000000000000000000000000000000000001",
    freelancerAddress: "0x0000000000000000000000000000000000000002",
  },
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
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [contracts, setContracts] = useState<activeContractDetails[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [showTypesMobile, setShowTypesMobile] = useState(false);
  const [type, setType] = useState("awaitingApproval");
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'ended'>('active');
  const [creationStage, setCreationStage] = useState(2);
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

  // Get user profile from Redux - contains Lens Account address
  const { user: userProfile } = useSelector((state: any) => state.app);

  const getData = async () => {
    // Use Lens Account address from user profile (stored in Redux)
    // userProfile.address is the Lens Account address (smart contract)
    const lensAccountAddress = userProfile?.address;
    
    if (lensAccountAddress) {
      try {
        const contracts = await get_all_contracts(lensAccountAddress);
        const newContracts = [...contracts];
        setContracts(newContracts);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      } finally {
        setLoadingContracts(false);
      }
    } else {
      setLoadingContracts(false);
    }
  };

  useEffect(() => {
    if (userProfile?.address) {
      getData();

      // Set up event listeners for contract updates
      // New contract emits: ProposalCreated, ProposalAccepted, PaymentRequested, PaymentReleased, etc.
      const lensAccountAddress = userProfile?.address;
      const contract = getContractInstance();
      
      const handleProposalCreated = (client: string, freelancer: string, proposalId: any, amount: any, event: any) => {
        if (lensAccountAddress && (client === lensAccountAddress || freelancer === lensAccountAddress)) {
          getData();
        }
      };
      
      const handleProposalAccepted = (client: string, freelancer: string, contractId: any, event: any) => {
        if (lensAccountAddress && (client === lensAccountAddress || freelancer === lensAccountAddress)) {
          getData();
        }
      };
      
      const handlePaymentRequested = (freelancer: string, client: string, contractId: any, event: any) => {
        if (lensAccountAddress && (client === lensAccountAddress || freelancer === lensAccountAddress)) {
          getData();
        }
      };
      
      const handlePaymentReleased = (freelancer: string, client: string, contractId: any, event: any) => {
        if (lensAccountAddress && (client === lensAccountAddress || freelancer === lensAccountAddress)) {
          getData();
        }
      };

      // Subscribe to contract events
      contract.on("ProposalCreated", handleProposalCreated);
      contract.on("ProposalAccepted", handleProposalAccepted);
      contract.on("PaymentRequested", handlePaymentRequested);
      contract.on("PaymentReleased", handlePaymentReleased);

      // Cleanup function
      return () => {
        contract.off("ProposalCreated", handleProposalCreated);
        contract.off("ProposalAccepted", handleProposalAccepted);
        contract.off("PaymentRequested", handlePaymentRequested);
        contract.off("PaymentReleased", handlePaymentReleased);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.address]);

  useEffect(() => {
    if (profile) {
      console.log("Profile: ", profile);
      setShowCreateContractModal(true);
    }
  }, [profile]);

  return (
    <div className="find-work-section pt-10 mb-[20px] bg-white">
      <div className="custom-container">
        <div className="tags-section w-full flex md:justify-center md:flex-col gap-[45px] mt-[50px] md:mt-[0px] sm:mt-[16px]">
          <div
            className="find-work-message-section w-[300px] flex-shrink-0 h-fit sm:my-0 sm:py-0 bg-[#FFFFFF] sm:bg-transparent md:bg-transparent rounded-[20px] sm:rounded-[0px] p-[16px] sm:w-full sm:items-center sm:mt-10 gap-2 sm:whitespace-nowrap md:w-full md:items-center md:whitespace-nowrap overflow-x-auto 
            "
          >
            {/* <h4 className="text-[20px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-center pb-[17px] sm:pb-[10px] md:pb-[10px]">
              Contracts
            </h4> */}
              <div className="bg-[#F2F2F2] rounded-full p-1.5 inline-flex shadow-inner w-full mb-4">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-1 rounded-full text-xl font-semibold transition-all duration-300 w-full ${
                    activeTab === 'active'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab('ended')}
                  className={`px-4 py-2 rounded-full text-xl font-semibold transition-all duration-300 w-full ${
                    activeTab === 'ended'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Ended
                </button>
              </div>
            <div className="w-full flex flex-col gap-[16px]">
              {contractTypes.map((type: string, index: number) => {
                return (
                  <button
                    key={index}
                    className={`w-full py-[12px] flex items-center text-[#818181] justify-center leading-[14.52px] text-base font-medium border-[0.5px] rounded-full ${
                      selectedTypeFilter === index
                        ? "bg-[#E4E4E7] border-[#000000]"
                        : "bg-[#FFFFFF] border-[#C3C7CE]"
                    }`}
                    onClick={() => setSelectedTypeFilter(index)}
                  >
                    {type}
                  </button>
                );
              })}
            <button
              className={`w-full py-[12px] flex items-center justify-center leading-[14.52px] mt-6 text-sm text-white font-medium bg-[#212121] rounded-full`}
              onClick={() => {
                setFreelancerId("");
                setShowCreateContractModal(true);
              }}
            >
              <Image src={'/images/add.svg'} height={20} width={20} alt='' className="mr-1" /> 
              Create New Contract
            </button>
            </div>
          </div>
          {/* <div className="hidden md:flex w-full md:items-center flex-col relative">
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
          </div> */}

          <div className=" p-[16px] flex flex-1 flex-col gap-[16px]">
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
              <div className="flex flex-1 flex-col gap-[16px]">
                {DUMMY_CONTRACTS.map((contract, index) => {
                  if (selectedTypeFilter === null) {
                    return (
                      <ContractCard
                        key={index}
                        type={contract.state}
                        contractDetails={contract}
                        onCardClick={() => handleOpenModal(contract)}
                      />
                    );
                  } else if (contract.state === contractStateFilters[selectedTypeFilter]) {
                    return (
                      <ContractCard
                        key={index}
                        type={contract.state}
                        contractDetails={contract}
                        onCardClick={() => handleOpenModal(contract)}
                      />
                    );
                  }
                })}
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
      {isModalOpen && newContractDetails && (
        <div className="fixed h-screen w-screen overflow-hidden inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            {type === "completed" && (
              <CompletedContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                contractDetails={newContractDetails}
              />
            )}
            {type === "inProgress" && (
              <InProgressContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                contractDetails={newContractDetails}
              />
            )}
            {type === "awaitingApproval" && (
              <AwaitingApprovalContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                contractDetails={newContractDetails}
              />
            )}
            {type === "proposal" && (
              <ViewContractModal
                handleCloseModal={() => setIsModalOpen(false)}
                contractDetails={newContractDetails}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
