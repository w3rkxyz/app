"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  ChevronDown,
  Link2 as LinkIcon,
  Code,
  Palette,
  MessageCircle,
  TrendingUp,
  Headphones,
  ShoppingBag,
  Shield,
  Users,
  HelpCircle,
} from "lucide-react";
import { MetadataAttributeType, textOnly } from "@lens-protocol/metadata";
import toast from "react-hot-toast";
import { evmAddress } from "@lens-protocol/client";
import { fetchAccount as fetchLensAccount, post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useLogin, useSessionClient, uri } from "@lens-protocol/react";
import { useDispatch, useSelector } from "react-redux";
import { useWalletClient } from "wagmi";
import { uploadMetadataToLensStorage } from "@/utils/storage-client";
import { client, getLensClient } from "@/client";
import { displayLoginModal } from "@/redux/app";

interface CreateServiceModalProps {
  open: boolean;
  onClose: () => void;
  onPublished?: (listing?: {
    id?: string;
    username: string;
    profileImage: string;
    jobName: string;
    jobIcon: string;
    description: string;
    contractType: string;
    paymentAmount: string;
    paidIn: string;
    tags: string[];
  }) => void | Promise<void>;
}

const paymentTokens = ["Ethereum (ETH)", "USDC (USDC)", "GHO (GHO)", "Bonsai (BONSAI)"];

const tokenIconMap: Record<string, string> = {
  "Ethereum (ETH)": "/icons/eth.svg",
  "USDC (USDC)": "/icons/usdc.svg",
  "GHO (GHO)": "/icons/gho.svg",
  "Bonsai (BONSAI)": "/icons/bonsai.svg",
};

const serviceCategories = [
  "Design",
  "Security & Auditing",
  "Blockchain Development",
  "Programming & Development",
  "Consulting & Advisory",
  "Marketing",
  "Admin Support",
  "Customer Service",
  "Community Building",
  "Other",
];

const categoryIconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  "Blockchain Development": LinkIcon,
  "Programming & Development": Code,
  Design: Palette,
  "Consulting & Advisory": MessageCircle,
  Marketing: TrendingUp,
  "Admin Support": Headphones,
  "Customer Service": ShoppingBag,
  "Security & Auditing": Shield,
  "Community Building": Users,
  Other: HelpCircle,
};

const removeAtSymbol = (text: string) => (text.startsWith("@") ? text.slice(1) : text);
const extractTokenSymbol = (token: string) => {
  const match = token.match(/\(([^)]+)\)/);
  return match ? match[1] : token;
};
const isTxHash = (value: string) => /^0x[a-fA-F0-9]{64}$/.test(value);
const LENS_TESTNET_CHAIN_ID = 37111;
const LENS_TESTNET_APP = "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7";

const CreateServiceModal = ({ open, onClose, onPublished }: CreateServiceModalProps) => {
  const dispatch = useDispatch();
  const { data: sessionClient } = useSessionClient();
  const { data: walletClient } = useWalletClient();
  const { execute: authenticate } = useLogin();
  const { user: profile } = useSelector((state: any) => state.app);
  const [serviceTitle, setServiceTitle] = React.useState("");
  const [serviceDescription, setServiceDescription] = React.useState("");
  const [rateAmount, setRateAmount] = React.useState("");
  const [selectedTokens, setSelectedTokens] = React.useState<string[]>(["Ethereum (ETH)"]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [savingData, setSavingData] = React.useState(false);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = React.useState(false);
  const [tokenSearch, setTokenSearch] = React.useState("");
  const tokenDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false);
  const [categorySearch, setCategorySearch] = React.useState("");
  const categoryDropdownRef = React.useRef<HTMLDivElement | null>(null);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const selectToken = (token: string) => {
    setSelectedTokens([token]);
    setIsTokenDropdownOpen(false);
    setTokenSearch("");
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close token dropdown when clicking outside
  React.useEffect(() => {
    if (!isTokenDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (tokenDropdownRef.current && !tokenDropdownRef.current.contains(event.target as Node)) {
        setIsTokenDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTokenDropdownOpen]);

  // Close category dropdown when clicking outside
  React.useEffect(() => {
    if (!isCategoryDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCategoryDropdownOpen]);

  const maxDescriptionLength = 800;

  const selectedToken = selectedTokens[0];
  const selectedTokenIcon = tokenIconMap[selectedToken] ?? "/icons/eth.svg";

  if (!open) return null;

  const resetForm = () => {
    setServiceTitle("");
    setServiceDescription("");
    setRateAmount("");
    setSelectedTokens(["Ethereum (ETH)"]);
    setSelectedCategories([]);
    setTokenSearch("");
    setIsTokenDropdownOpen(false);
    setCategorySearch("");
    setIsCategoryDropdownOpen(false);
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

    const profileHandle =
      (typeof profile?.userLink === "string" && profile.userLink.trim()) ||
      (typeof profile?.handle === "string" && removeAtSymbol(profile.handle.trim())) ||
      "";

    const allTags = [...new Set([...selectedCategories, "service", "w3rk"])];
    const content = `🛠 Ready for work!\n\nJust listed my services on @w3rkxyz as a ${serviceTitle}\n\nFor more details please visit ${
      profileHandle ? `www.w3rk.xyz/${profileHandle}` : "www.w3rk.xyz"
    }`;

    const metadata = textOnly({
      content,
      tags: allTags,
      attributes: [
        {
          key: "paid in",
          value: selectedTokens.join(", "),
          type: MetadataAttributeType.STRING,
        },
        {
          key: "payement type",
          value: "hourly",
          type: MetadataAttributeType.STRING,
        },
        {
          key: "hourly",
          value: rateAmount,
          type: MetadataAttributeType.STRING,
        },
        {
          key: "post type",
          value: "service",
          type: MetadataAttributeType.STRING,
        },
        {
          key: "title",
          value: serviceTitle,
          type: MetadataAttributeType.STRING,
        },
        {
          key: "content",
          value: serviceDescription,
          type: MetadataAttributeType.STRING,
        },
      ],
    });

    try {
      setSavingData(true);
      const metadataUri = await uploadMetadataToLensStorage(metadata, {
        chainId: LENS_TESTNET_CHAIN_ID,
      });
      const result = await post(publishClient, {
        contentUri: uri(metadataUri),
      });

      if (result.isErr()) {
        toast.error(result.error.message);
        return;
      }

      const operationValue: any = result.value;
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

      const optimisticListing = {
        id: `${Date.now()}`,
        username:
          (typeof profile?.displayName === "string" && profile.displayName.trim()) ||
          (typeof profile?.userLink === "string" && profile.userLink.trim()) ||
          "Lens User",
        profileImage:
          (typeof profile?.picture === "string" && profile.picture.trim()) ||
          "https://static.hey.xyz/images/default.png",
        jobName: serviceTitle,
        jobIcon: "",
        description: serviceDescription,
        contractType: "hourly",
        paymentAmount: `$${rateAmount}/hr`,
        paidIn: extractTokenSymbol(selectedTokens[0] || ""),
        tags: selectedCategories,
      };

      resetForm();
      await onPublished?.(optimisticListing);
      onClose();
      toast.success("Service posted on Lens.");
    } catch (error: any) {
      console.error("Failed to publish service:", error);
      toast.error(error?.message || "Failed to publish service. Please try again.");
    } finally {
      setSavingData(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99991] flex items-center justify-center bg-[rgba(15,23,42,0.55)]"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-[640px] mx-4 my-8">
        <div className="relative bg-white rounded-[16px] shadow-[0_24px_60px_rgba(15,23,42,0.18)] flex flex-col max-h-[90vh] overflow-hidden">
          {/* Header */}
          <header className="flex items-start justify-between px-[24px] pt-[24px] pb-[16px] border-b border-[#E4E4E7]">
            <div className="flex flex-col gap-[4px]">
              <h2 className="text-[20px] font-semibold leading-[24px] text-[#212121]">
                Add Your Service
              </h2>
              <p className="text-[16px] leading-[20px] text-[#83899F] font-normal">
                Showcase what you can do. Clients will discover your service when searching.
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors"
              aria-label="Close add service modal"
            >
              <X className="h-4 w-4 text-[#4B5563]" />
            </button>
          </header>

          {/* Body */}
          <main className="px-[24px] pt-[16px] pb-[8px] overflow-y-auto flex-1 space-y-[16px]">
            {/* Service Title */}
            <div className="space-y-[6px]">
              <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
                What&apos;s The Service Title<span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Web3 Product Designer"
                value={serviceTitle}
                onChange={e => setServiceTitle(e.target.value)}
                className="w-full h-[44px] rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] leading-[20px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-[1.5px] focus:ring-[#111827]"
              />
            </div>

            {/* Service Description */}
            <div className="space-y-[6px]">
              <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
                Describe Your Service<span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  placeholder="Describe what you offer. Highlight your skills and results."
                  value={serviceDescription}
                  onChange={e =>
                    setServiceDescription(e.target.value.slice(0, maxDescriptionLength))
                  }
                  className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] py-[10px] text-[14px] leading-[20px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-[1.5px] focus:ring-[#111827] resize-none"
                />
                <span className="pointer-events-none absolute right-[10px] bottom-[8px] text-[12px] text-[#9CA3AF]">
                  {serviceDescription.length}/{maxDescriptionLength}
                </span>
              </div>
            </div>

            {/* Rate */}
            <div className="space-y-[6px]">
              <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
                What&apos;s Your Rate<span className="text-[#DC2626]">*</span>
              </label>
              <div className="flex">
                <button
                  type="button"
                  className="flex min-w-[100px] items-center justify-center bg-[#fafafa] rounded-l-[8px] border border-[#E5E7EB] px-[10px] py-[10px] text-[14px] leading-[20px] text-[#111827]"
                >
                  <span className="text-[#777A82]">Hourly</span>
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Price"
                  value={rateAmount}
                  onChange={e => setRateAmount(e.target.value)}
                  className="flex-1 h-[44px] rounded-r-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] leading-[20px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-[1.5px] focus:ring-[#111827]"
                />
              </div>
            </div>

            {/* Payment Tokens */}
            <div className="space-y-[6px] relative" ref={tokenDropdownRef}>
              <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
                Payment Token(s)<span className="text-[#DC2626]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsTokenDropdownOpen(prev => !prev)}
                className="flex h-[44px] w-full items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-left text-[14px] leading-[20px] text-[#111827] hover:bg-[#F9FAFB]"
              >
                <span className="flex items-center gap-[8px] text-[#111827]">
                  {selectedTokenIcon && (
                    <Image src={selectedTokenIcon} alt={selectedToken} width={20} height={20} />
                  )}
                  <span>{selectedToken}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[#9CA3AF] transition-transform ${
                    isTokenDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isTokenDropdownOpen && (
                <div className="absolute left-0 right-0 top-[100%] z-[99992] mt-[4px] rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                  <div className="px-[8px] py-[6px] border-b border-[#E5E7EB]">
                    <input
                      type="text"
                      placeholder="Search Tokens..."
                      value={tokenSearch}
                      onChange={e => setTokenSearch(e.target.value)}
                      className="w-full h-[32px] rounded-[6px] border border-[#E5E7EB] bg-white px-[8px] text-[13px] leading-[18px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-[1px] focus:ring-[#111827]"
                    />
                  </div>
                  <div className="max-h-[220px] overflow-y-auto py-[4px]">
                    {paymentTokens
                      .filter(token => token.toLowerCase().includes(tokenSearch.toLowerCase()))
                      .map(token => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => selectToken(token)}
                          className="flex w-full items-center gap-[8px] px-[12px] py-[8px] text-left text-[14px] leading-[20px] text-[#111827] hover:bg-[#F3F4F6]"
                        >
                          {tokenIconMap[token] && (
                            <Image src={tokenIconMap[token]} alt={token} width={24} height={24} />
                          )}
                          <span>{token}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service Category */}
            <div className="space-y-[6px] pb-[8px]" ref={categoryDropdownRef}>
              <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
                Select Service Category<span className="text-[#DC2626]">*</span>
              </label>
              <p className="text-[12px] leading-[18px] text-[#9CA3AF]">
                Select minimum one category
              </p>

              {/* Category dropdown trigger */}
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(prev => !prev)}
                className="flex min-h-[44px] w-full items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-left text-[14px] leading-[20px] text-[#111827] hover:bg-[#F9FAFB]"
              >
                <span className="flex flex-wrap gap-[4px] text-[#111827]">
                  {selectedCategories.length === 0 ? (
                    <span className="text-[#9CA3AF]">Select categories</span>
                  ) : (
                    selectedCategories.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          toggleCategory(category);
                        }}
                        className="inline-flex items-center justify-center min-w-[118px] h-[32px] px-[12px] bg-[#F2F2F2] text-[#323232] rounded-full text-[13px] font-medium leading-[20px] tracking-[0px] align-middle opacity-100 hover:bg-[#E5E5E5]"
                      >
                        <span className="mr-[6px]">{category}</span>
                        <span className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-full text-[17px] font-light text-black">
                          ×
                        </span>
                      </button>
                    ))
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[#9CA3AF] transition-transform ${
                    isCategoryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Category dropdown panel */}
              {isCategoryDropdownOpen && (
                <div className="relative mt-[4px]">
                  <div className="absolute left-0 right-0 top-0 z-[99992] rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                    <div className="px-[8px] py-[6px] border-b border-[#E5E7EB]">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={e => setCategorySearch(e.target.value)}
                        className="w-full h-[32px] rounded-[6px] border border-[#E5E7EB] bg-white px-[8px] text-[13px] leading-[18px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-[1px] focus:ring-[#111827]"
                      />
                    </div>
                    <div className="max-h-[220px] overflow-y-auto py-[4px]">
                      {serviceCategories
                        .filter(category =>
                          category.toLowerCase().includes(categorySearch.toLowerCase())
                        )
                        .map(category => {
                          const isSelected = selectedCategories.includes(category);
                          const Icon = categoryIconMap[category];
                          return (
                            <button
                              key={category}
                              type="button"
                              onClick={() => toggleCategory(category)}
                              className="flex w-full items-center justify-between px-[12px] py-[8px] text-left text-[14px] leading-[20px] text-[#111827] hover:bg-[#F3F4F6]"
                            >
                              <span className="flex items-center gap-[8px]">
                                {Icon && <Icon size={18} className="text-[#6B7280]" />}
                                <span>{category}</span>
                              </span>
                              {isSelected && (
                                <span className="h-[16px] w-[16px] rounded-full border border-[#111827] bg-[#111827]" />
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="flex items-center justify-end px-[24px] py-[16px] border-t border-[#E4E4E7] bg-[#F9FAFB]">
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex h-[40px] items-center justify-center rounded-[999px] bg-[#111827] px-[18px] text-[14px] font-semibold leading-[20px] text-white shadow-[0_10px_25px_rgba(15,23,42,0.35)] hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={
                savingData ||
                !serviceTitle ||
                !serviceDescription ||
                !rateAmount ||
                selectedCategories.length === 0
              }
            >
              {savingData ? "Publishing..." : "Add Service"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceModal;
