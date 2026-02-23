"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  ChevronDown,
  Plus,
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
import PaymentTokensDropdown from "../onboarding/payment-tokens-dropdown";

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
}

const paymentTokens = ["Ethereum (ETH)", "USDC (USDC)", "GHO (GHO)", "Bonsai (BONSAI)"];

const tokenIconMap: Record<string, string> = {
  "Ethereum (ETH)": "/icons/eth.svg",
  "USDC (USDC)": "/icons/usdc.svg",
  "GHO (GHO)": "/icons/gho.svg",
  "Bonsai (BONSAI)": "/icons/bonsai.svg",
};

const jobCategories = [
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

const CreateJobModal = ({ open, onClose }: CreateJobModalProps) => {
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [currency, setCurrency] = React.useState("US Dollar");
  const [budget, setBudget] = React.useState("");
  const [selectedTokens, setSelectedTokens] = React.useState<string[]>(["Ethereum (ETH)"]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
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

  const handleJobAddToken = () => {
    setSelectedTokens((prev) => [...prev, 'Ethereum (ETH)']);
  }

  const handleJobTokenUpdate = (index: number, tokenName: string, tokenSymbol: string) => {
    setSelectedTokens(prev => {
      const newTokens = [...prev]
      newTokens[index] = `${tokenName} (${tokenSymbol})`
      return newTokens
    })
  }

  const handleJobRemoveToken = (index: number) => {
    setSelectedTokens((prev) => prev.filter((_, i) => i !== index));
  }

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
                Create a Job
              </h2>
              <p className="text-[16px] leading-[20px] text-[#83899F]">
                Post your job and connect with top freelancers.
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 inline-flex h-[32px] w-[32px] items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors"
              aria-label="Close create job modal"
            >
              <X className="h-4 w-4 text-[#4B5563]" />
            </button>
          </header>

          {/* Body */}
          <main className="px-[24px] pt-[16px] pb-[8px] overflow-y-auto flex-1 space-y-[16px]">
            {/* Job Title */}
            <div className="space-y-[6px]">
              <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
                What&apos;s The Job Title<span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Solidity Smart Contract Audit"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full h-[44px] rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] leading-[20px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-[1.5px] focus:ring-[#111827]"
              />
            </div>

            {/* Job Description */}
            <div className="space-y-[6px]">
              <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
                Describe Your Job<span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  placeholder="Describe the work you need."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value.slice(0, maxDescriptionLength))}
                  className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[12px] py-[10px] text-[14px] leading-[20px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-[1.5px] focus:ring-[#111827] resize-none"
                />
                <span className="pointer-events-none absolute right-[10px] bottom-[8px] text-[12px] text-[#9CA3AF]">
                  {jobDescription.length}/{maxDescriptionLength}
                </span>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-[6px]">
              <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
                What&apos;s Your Budget<span className="text-[#DC2626]">*</span>
              </label>
              <div className="flex">
                <button
                  type="button"
                  className="flex min-w-[100px] items-center justify-center bg-[#fafafa] rounded-l-[8px] border border-[#E5E7EB] px-[10px] py-[10px] text-[14px] leading-[20px] text-[#111827]"
                >
                  <span className="text-[#777A82]">{currency}</span>
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Amount"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="flex-1 h-[44px] rounded-r-[8px] border border-[#E5E7EB] bg-white px-[12px] text-[14px] leading-[20px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-[1.5px] focus:ring-[#111827]"
                />
              </div>
            </div>

            <PaymentTokensDropdown
              tokens={selectedTokens}
              onUpdateToken={handleJobTokenUpdate}
              onAddToken={handleJobAddToken}
              onRemoveToken={handleJobRemoveToken}
            />

            {/* <div className="space-y-[6px] relative" ref={tokenDropdownRef}>
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
            </div> */}

            {/* Job Category */}
            <div className="space-y-[6px] pb-[8px]" ref={categoryDropdownRef}>
              <label className="text-[14px] font-medium leading-[20px] text-[#111827]">
                Select Job Category<span className="text-[#DC2626]">*</span>
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
                      {jobCategories
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

              {/* Selected category pills below input no longer needed since tags appear inside input */}
            </div>
          </main>

          {/* Footer */}
          <footer className="flex items-center justify-end px-[24px] py-[16px] border-t border-[#E4E4E7] bg-[#F9FAFB]">
            <button
              type="button"
              className="inline-flex h-[40px] items-center justify-center rounded-[999px] bg-[#111827] px-[18px] text-[14px] font-semibold leading-[20px] text-white shadow-[0_10px_25px_rgba(15,23,42,0.35)] hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!jobTitle || !jobDescription || !budget || selectedCategories.length === 0}
            >
              Publish Job
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default CreateJobModal;
