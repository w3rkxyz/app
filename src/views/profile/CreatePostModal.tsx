"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { MetadataAttributeType, textOnly } from "@lens-protocol/metadata";
import { uploadMetadataToLensStorage } from "@/utils/storage-client";
import toast from "react-hot-toast";
import { evmAddress } from "@lens-protocol/client";
import { fetchAccount as fetchLensAccount, post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useLogin, useSessionClient, uri } from "@lens-protocol/react";
import { client, getLensClient } from "@/client";
import { displayLoginModal } from "@/redux/app";
import CreatePostRoleSelection from "@/views/profile/CreatePostRoleSelection";
import CreatePostJobForm from "@/views/profile/CreatePostJobForm";
import Step3ServiceForm from "@/components/onboarding/step-3-service-form";
import { RateType } from "@/types/onboarding";
import { useDispatch, useSelector } from "react-redux";
import { useWalletClient } from "wagmi";

type Props = {
    handleCloseModal?: () => void;
    handle: string;
};

function removeAtSymbol(text: string) {
    return text.startsWith("@") ? text.slice(1) : text;
}

const isTxHash = (value: string) => /^0x[a-fA-F0-9]{64}$/.test(value);
const LENS_TESTNET_CHAIN_ID = 37111;
const LENS_TESTNET_APP = "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7";

const CreatePostModal = ({ handleCloseModal, handle }: Props) => {
    const dispatch = useDispatch();
    const { data: sessionClient } = useSessionClient();
    const { data: walletClient } = useWalletClient();
    const { execute: authenticate } = useLogin();
    const { user: profile } = useSelector((state: any) => state.app);
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

    const ensureLensChain = async (): Promise<boolean> => {
        if (!walletClient) {
            return false;
        }

        const currentChainId = walletClient.chain?.id;
        if (currentChainId === LENS_TESTNET_CHAIN_ID) {
            return true;
        }

        try {
            await walletClient.switchChain({ id: LENS_TESTNET_CHAIN_ID });
            return true;
        } catch (error: any) {
            if (error?.code !== 4902) {
                toast.error("Please switch to Lens Chain Testnet to continue.");
                return false;
            }

            try {
                await walletClient.addChain({
                    chain: {
                        id: LENS_TESTNET_CHAIN_ID,
                        name: "Lens Chain Testnet",
                        nativeCurrency: {
                            name: "GHO",
                            symbol: "GHO",
                            decimals: 18,
                        },
                        rpcUrls: {
                            default: { http: ["https://rpc.testnet.lens.xyz"] },
                        },
                        blockExplorers: {
                            default: {
                                name: "Lens Explorer",
                                url: "https://block-explorer.testnet.lens.xyz",
                            },
                        },
                    },
                });
                await walletClient.switchChain({ id: LENS_TESTNET_CHAIN_ID });
                return true;
            } catch {
                toast.error("Could not add Lens Chain Testnet to your wallet.");
                return false;
            }
        }
    };

    const ensureSessionForPublish = async () => {
        if (sessionClient) {
            return sessionClient;
        }

        if (!walletClient?.account.address) {
            dispatch(displayLoginModal({ display: true }));
            toast.error("Connect your wallet, then sign in to Lens.");
            return null;
        }

        const profileAddress = profile?.address;
        if (!profileAddress) {
            dispatch(displayLoginModal({ display: true }));
            toast.error("Please sign in to Lens first.");
            return null;
        }

        const onLensChain = await ensureLensChain();
        if (!onLensChain) {
            return null;
        }

        const accountResult = await fetchLensAccount(client, { address: profileAddress });
        const lensAccount: any = accountResult.unwrapOr(null);

        if (!lensAccount?.address) {
            dispatch(displayLoginModal({ display: true }));
            toast.error("Could not load your Lens profile. Please sign in again.");
            return null;
        }

        const appAddress = process.env.NEXT_PUBLIC_APP_ADDRESS_TESTNET || LENS_TESTNET_APP;
        const connectedWallet = walletClient.account.address.toLowerCase();
        const ownerAddress = String(lensAccount.owner || "").toLowerCase();
        const isOwner = ownerAddress === connectedWallet;

        const authRequest = isOwner
            ? {
                accountOwner: {
                    account: lensAccount.address,
                    app: evmAddress(appAddress),
                    owner: walletClient.account.address,
                },
            }
            : {
                accountManager: {
                    account: lensAccount.address,
                    app: evmAddress(appAddress),
                    manager: walletClient.account.address,
                },
            };

        try {
            const authenticated = await authenticate({
                ...authRequest,
                signMessage: async (message: string) => walletClient.signMessage({ message }),
            });

            if (authenticated.isErr()) {
                dispatch(displayLoginModal({ display: true }));
                toast.error(authenticated.error.message || "Lens authentication failed.");
                return null;
            }
        } catch (error: any) {
            dispatch(displayLoginModal({ display: true }));
            toast.error(error?.message || "Lens authentication failed.");
            return null;
        }

        const resumed = await getLensClient();
        if (!resumed.isSessionClient()) {
            dispatch(displayLoginModal({ display: true }));
            toast.error("Please finish signing in to Lens.");
            return null;
        }

        return resumed;
    };

    const handlePublish = async () => {
        const publishClient = await ensureSessionForPublish();
        if (!publishClient) {
            return;
        }

        setSavingData(true);
        const isJob = role === "client";
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
            const heyMetadataURI = await uploadMetadataToLensStorage(heyMetadata, {
                chainId: LENS_TESTNET_CHAIN_ID,
                environment: "production",
            });
            const heyResult = await post(publishClient, {
                contentUri: uri(heyMetadataURI),
            });

            if (heyResult.isErr()) {
                toast.error(heyResult.error.message);
                return;
            }

            const operationValue: any = heyResult.value;
            if (operationValue?.__typename === "PostOperationValidationFailed") {
                toast.error(operationValue.reason || "Post validation failed.");
                return;
            }

            if (operationValue?.__typename === "TransactionWillFail") {
                toast.error(operationValue.reason || "Transaction will fail.");
                return;
            }

            if (
                operationValue?.__typename === "SelfFundedTransactionRequest" ||
                operationValue?.__typename === "SponsoredTransactionRequest"
            ) {
                if (!walletClient) {
                    toast.error("Connect your wallet to complete this Lens transaction.");
                    return;
                }

                const operationHandler = handleOperationWith(walletClient as any) as any;
                const txResult = await operationHandler(operationValue);
                if (txResult.isErr()) {
                    toast.error(txResult.error?.message || "Failed to submit Lens transaction.");
                    return;
                }

                const txIdentifier = String(txResult.value ?? "");
                if (isTxHash(txIdentifier)) {
                    const waitResult = await publishClient.waitForTransaction(txIdentifier);
                    if (waitResult.isErr()) {
                        toast.error(waitResult.error?.message || "Lens transaction was not confirmed.");
                        return;
                    }
                }
            } else if (operationValue?.__typename === "PostResponse" && isTxHash(operationValue.hash)) {
                const waitResult = await publishClient.waitForTransaction(operationValue.hash);
                if (waitResult.isErr()) {
                    toast.error(waitResult.error?.message || "Lens transaction was not confirmed.");
                    return;
                }
            }

            handleCloseModal?.();
            isJob ? toast.success("Job Posted Successfully!") : toast.success("Service Listed!");
        } catch (error: any) {
            console.error("Failed to create post:", error);
            toast.error(error?.message || "Failed to create post. Please try again.");
        } finally {
            setSavingData(false);
        }
    };

    return (
        <div
            className={`view-job-modal-section bg-white nav-space flex min-h-0 flex-col max-h-[90vh]
      w-[720px] sm:w-full sm:max-h-[90vh] sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:rounded-t-2xl sm:rounded-b-none
      rounded-[16px] mobile-modal ${showMobile ? "open-modal" : ""}`}
            ref={myDivRef}
        >
            {/* Drawer handle (visible on small screens only) */}
            <div
                className="hidden sm:block flex-shrink-0 pt-2 pb-1"
                aria-hidden
            >
                <div className="mx-auto h-1 w-12 rounded-full bg-[#E4E4E7]" />
            </div>
            {/* Header */}
            <header className="flex flex-shrink-0 items-center justify-between border-b border-[#E4E4E7] px-4 py-3 rounded-tl-[12px] rounded-tr-[12px] sm:rounded-tl-none sm:rounded-tr-none sm:px-4">
                {step === 2 && (role === "client" || role === "freelancer") ? <div className="">
          <h1 className="mb-1 text-[20px] font-medium text-primary-black xs:text-[24px] sm:text-[28px]">
            {role === "client" ? "Create Your First Job" : "Create Your First Service"}
          </h1>
          <p className="text-sm text-[#83899F] xs:text-base">{role === "client" ? "Post your first job and connect with top freelancers." : "Post your first service and get hired by top clients."}

</p>
        </div> : <Image
                    src="/images/logo.png"
                    alt="w3rk logo"
                    width={100}
                    height={40}
                    className="object-contain bg-white"
                />}
                <button
                    type="button"
                    aria-label="Close modal"
                    className="cursor-pointer p-1"
                    onClick={() => handleCloseModal?.()}
                >
                    <Image
                        src="/images/Close.svg"
                        alt=""
                        width={20}
                        height={20}
                    />
                </button>
            </header>

            {/* Main — scrollable content area */}
            <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4">
                {step === 1 && (
                    <CreatePostRoleSelection
                        selectedRole={role}
                        onRoleSelect={handleRoleSelect}
                        onContinue={handleContinue}
                        title="What Would You Like to Post?"
                        subtitle="Choose what you want to publish and start right away."
                        clientTitle="Publish a Job"
                        clientSubtitle="Hire talent by posting a job."
                        freelancerTitle="Add a Service"
                        freelancerSubtitle="Offer your skills and get hired."
                        hideContinueButton
                    />
                )}

                {step === 2 && role === "client" && (
                    <CreatePostJobForm
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
                        hideNavigation
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
                        hideNavigation
                    />
                )}
            </main>

            {/* Footer */}
            <footer
                className={`flex flex-shrink-0 items-center border-t border-[#E4E4E7] px-4 py-3 sm:px-8 ${step === 2 ? "justify-between" : "justify-end"}`}
            >
                {step === 1 && (
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!role}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            role
                                ? "bg-[#212121] text-white hover:bg-gray-800 cursor-pointer"
                                : "bg-[#DCDCDC] text-[#969696] cursor-not-allowed"
                        }`}
                    >
                        Continue
                    </button>
                )}
                {step === 2 && role === "client" && (
                    <>
                        {/* <button
                            type="button"
                            onClick={handleBack}
                            className="rounded-full border-2 border-[#212121] bg-white px-4 py-2 text-sm font-medium text-[#212121] transition-all hover:border-gray-400 hover:bg-gray-50"
                        >
                            Back
                        </button> */}
                        <p></p>
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={!jobData.description || !jobData.budget || jobData.categories.length === 0}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                jobData.description && jobData.budget && jobData.categories.length > 0
                                    ? "bg-[#212121] text-white hover:bg-gray-800 cursor-pointer"
                                    : "bg-[#DCDCDC] text-[#969696] cursor-not-allowed"
                            }`}
                        >
                            Publish Job
                        </button>
                    </>
                )}
                {step === 2 && role === "freelancer" && (
                    <>
                        {/* <button
                            type="button"
                            onClick={handleBack}
                            className="rounded-full border-2 border-[#212121] bg-white px-4 py-2 text-sm font-medium text-[#212121] transition-all hover:border-gray-400 hover:bg-gray-50"
                        >
                            Back
                        </button> */}
                        <p></p>
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={!serviceData.serviceTitle || !serviceData.description || !serviceData.rate || serviceData.categories.length === 0}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                serviceData.serviceTitle && serviceData.description && serviceData.rate && serviceData.categories.length > 0
                                    ? "bg-[#212121] text-white hover:bg-gray-800 cursor-pointer"
                                    : "bg-[#DCDCDC] text-[#969696] cursor-not-allowed"
                            }`}
                        >
                            Add Service
                        </button>
                    </>
                )}
            </footer>
        </div>
    );
};

export default CreatePostModal;
