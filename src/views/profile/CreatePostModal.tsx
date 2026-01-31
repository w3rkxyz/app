"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { MetadataAttributeType, textOnly } from "@lens-protocol/metadata";
import { uploadMetadataToLensStorage } from "@/utils/storage-client";
import toast from "react-hot-toast";
import { useCreatePost, uri } from "@lens-protocol/react";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useWalletClient } from "wagmi";
import { getAcceptedTokens } from "@/api";
import Step1RoleSelection from "@/components/onboarding/step-1-role-selection";
import Step3JobForm from "@/components/onboarding/step-3-job-form";
import Step3ServiceForm from "@/components/onboarding/step-3-service-form";
import { RateType } from "@/types/onboarding";

type Props = {
    handleCloseModal?: () => void;
    handle: string;
};

function removeAtSymbol(text: string) {
    return text.startsWith("@") ? text.slice(1) : text;
}

const CreatePostModal = ({ handleCloseModal, handle }: Props) => {
    const { data: walletClient } = useWalletClient();
    const { execute } = useCreatePost({ handler: handleOperationWith(walletClient) });
    const myDivRef = useRef<HTMLDivElement>(null);
    const [showMobile, setShowMobile] = useState(false);
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<"client" | "freelancer" | null>(null);
    const [savingData, setSavingData] = useState(false);

    // Job Data State
    const [jobData, setJobData] = useState({
        jobTitle: "",
        description: "",
        currency: "USD",
        budget: "",
        paymentTokens: ["Ethereum (ETH)"],
        categories: [] as string[],
    });

    // Service Data State
    const [serviceData, setServiceData] = useState({
        serviceTitle: "",
        description: "",
        rateType: "Hourly" as RateType,
        rate: "",
        paymentTokens: ["Ethereum (ETH)"],
        categories: [] as string[],
    });



    useEffect(() => {
        setShowMobile(true);
        function handleClickOutside(event: MouseEvent) {
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
    }, [handleCloseModal]);

    useEffect(() => {
        document.body.style.overflowY = "hidden";
        return () => {
            document.body.style.overflowY = "auto";
        };
    }, []);

    const handleRoleSelect = (selectedRole: "client" | "freelancer") => {
        setRole(selectedRole);
    };

    const handleContinue = () => {
        if (role) setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    // Job Handlers
    const handleJobInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setJobData(prev => ({ ...prev, [name]: value }));
    };

    const handleJobCurrencyChange = (currency: string) => {
        setJobData(prev => ({ ...prev, currency }));
    };

    const handleJobUpdateToken = (index: number, tokenName: string, tokenSymbol: string) => {
        setJobData(prev => {
            const newTokens = [...prev.paymentTokens];
            newTokens[index] = `${tokenName} (${tokenSymbol})`;
            return { ...prev, paymentTokens: newTokens };
        });
    };

    const handleJobAddToken = () => {
        setJobData(prev => ({
            ...prev,
            paymentTokens: [...prev.paymentTokens, "Ethereum (ETH)"]
        }));
    };

    const handleJobRemoveToken = (index: number) => {
        setJobData(prev => ({
            ...prev,
            paymentTokens: prev.paymentTokens.filter((_, i) => i !== index),
        }));
    };

    const handleJobToggleCategory = (category: string) => {
        setJobData(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleJobRemoveCategory = (category: string) => {
        setJobData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c !== category),
        }));
    };

    // Service Handlers
    const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setServiceData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceRateTypeChange = (rateType: RateType) => {
        setServiceData(prev => ({ ...prev, rateType }));
    };

    const handleServiceUpdateToken = (index: number, tokenName: string, tokenSymbol: string) => {
        setServiceData(prev => {
            const newTokens = [...prev.paymentTokens];
            newTokens[index] = `${tokenName} (${tokenSymbol})`;
            return { ...prev, paymentTokens: newTokens };
        });
    };

    const handleServiceAddToken = () => {
        setServiceData(prev => ({
            ...prev,
            paymentTokens: [...prev.paymentTokens, "Ethereum (ETH)"]
        }));
    };

    const handleServiceRemoveToken = (index: number) => {
        setServiceData(prev => ({
            ...prev,
            paymentTokens: prev.paymentTokens.filter((_, i) => i !== index),
        }));
    };

    const handleServiceToggleCategory = (category: string) => {
        setServiceData(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleServiceRemoveCategory = (category: string) => {
        setServiceData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c !== category),
        }));
    };

    const handlePublish = async () => {
        setSavingData(true);
        const isJob = role === "client";
        const data = isJob ? jobData : serviceData;
        const type = isJob ? "job" : "service";

        // Construct metadata
        const selectedTags = (isJob ? jobData.categories : serviceData.categories);
        const allTags = [...selectedTags, type, "w3rk"];

        const title = isJob ? jobData.jobTitle : serviceData.serviceTitle;
        const description = isJob ? jobData.description : serviceData.description;
        const paymentAmount = isJob ? jobData.budget : serviceData.rate;
        const paymentType = isJob ? "fixed" : serviceData.rateType;

        const selectedTokens = isJob ? jobData.paymentTokens : serviceData.paymentTokens;

        const publicContent = `${isJob ? "📢 Job Opportunity!" : "🛠 Ready for work!"} \n\n${isJob
            ? `Just posted a job on @w3rkxyz for a ${title}`
            : `Just listed my services on @w3rkxyz as a ${title}`
            }\n\nFor more details please visit www.w3rk.xyz/${removeAtSymbol(handle)}`;

        const heyMetadata = textOnly({
            content: publicContent,
            tags: allTags,
            attributes: [
                {
                    key: "paid in",
                    value: selectedTokens.join(", "),
                    type: MetadataAttributeType.STRING,
                },
                {
                    key: "payement type",
                    value: paymentType,
                    type: MetadataAttributeType.STRING,
                },
                {
                    key: paymentType,
                    value: paymentAmount,
                    type: MetadataAttributeType.STRING,
                },
                {
                    key: "post type",
                    value: type,
                    type: MetadataAttributeType.STRING,
                },
                {
                    key: "title",
                    value: title,
                    type: MetadataAttributeType.STRING,
                },
                {
                    key: "content",
                    value: description,
                    type: MetadataAttributeType.STRING,
                },
            ],
        });

        try {
            const heyMetadataURI = await uploadMetadataToLensStorage(heyMetadata);
            const heyResult = await execute({
                contentUri: uri(heyMetadataURI),
            });

            if (heyResult.isErr()) {
                toast.error(heyResult.error.message);
                setSavingData(false);
                return;
            }

            setSavingData(false);
            handleCloseModal?.();
            isJob ? toast.success("Job Posted Successfully!") : toast.success("Service Listed!");
        } catch (error: any) {
            console.error("Failed to create post:", error);
            toast.error(error?.message || "Failed to create post. Please try again.");
            setSavingData(false);
        }
    };

    return (
        <div
            className={`view-job-modal-section w-auto max-w-[1047px] sm:w-auto rounded-[12px] sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white nav-space sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""}`}
            ref={myDivRef}
        >
            <div className="w-full flex py-3 justify-between items-center px-[16px]  border-b-[1px] border-b-[#E4E4E7] rounded-tl-[12px] rounded-tr-[12px]">
                <Image
                    src="/images/logo.png"
                    alt="w3rk logo"
                    width={100}
                    height={40}
                    className="object-contain bg-white "
                />
                <Image
                    src="/images/Close.svg"
                    alt="close icon"
                    className="cursor-pointer"
                    width={20}
                    height={20}
                    onClick={() => {
                        if (handleCloseModal) {
                            handleCloseModal();
                        }
                    }}
                />
            </div>

            <div className="overflow-y-auto max-h-[80vh] px-8 min-h-[550px]">
                {step === 1 && (
                    <Step1RoleSelection
                        selectedRole={role}
                        onRoleSelect={handleRoleSelect}
                        onContinue={handleContinue}
                        title="What Would You Like to Post?"
                        subtitle="Choose what you want to publish and start right away."
                        clientTitle="Publish a Job"
                        clientSubtitle="Hire talent by posting a job."
                        freelancerTitle="Add a Service"
                        freelancerSubtitle="Offer your skills and get hired."
                    />
                )}

                {step === 2 && role === "client" && (
                    <Step3JobForm
                        jobData={jobData}
                        onInputChange={handleJobInputChange}
                        onCurrencyChange={handleJobCurrencyChange}
                        onUpdateToken={handleJobUpdateToken}
                        onAddToken={handleJobAddToken}
                        onRemoveToken={handleJobRemoveToken}
                        onToggleCategory={handleJobToggleCategory}
                        onRemoveCategory={handleJobRemoveCategory}
                        onBack={handleBack}
                        onPublish={handlePublish}
                        stepText=""
                    />
                )}

                {step === 2 && role === "freelancer" && (
                    <Step3ServiceForm
                        serviceData={serviceData}
                        onInputChange={handleServiceInputChange}
                        onRateTypeChange={handleServiceRateTypeChange}
                        onUpdateToken={handleServiceUpdateToken}
                        onAddToken={handleServiceAddToken}
                        onRemoveToken={handleServiceRemoveToken}
                        onToggleCategory={handleServiceToggleCategory}
                        onRemoveCategory={handleServiceRemoveCategory}
                        onBack={handleBack}
                        onAddService={handlePublish}
                        stepText=""
                    />
                )}
            </div>
        </div>
    );
};

export default CreatePostModal;
