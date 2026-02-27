"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Search, ChevronDown, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import JobDetailDrawer from "@/components/find-work/job-detail-drawer";
import JobDetailModal from "@/components/find-work/job-detail-modal";
import CreateServiceModal from "@/components/find-work/create-service-modal";
import {
  SVGAdminSupport,
  SVGBlockChain,
  SVGCampaign,
  SVGCode,
  SVGDesignPallete,
  SVGInfo,
  SVGLock,
  SVGUsers,
  SVGUserSound,
} from "@/assets/list-svg-icon";
import { fetchAuthorListings, fetchW3rkListings } from "@/utils/lens-find-posts";

interface JobData {
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
}

interface Category {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface HourlyRate {
  label: string;
  min: number;
  max: number | null;
}

const categories: Category[] = [
  { name: "Blockchain Development", icon: SVGBlockChain },
  { name: "Programming & Development", icon: SVGCode },
  { name: "Design", icon: SVGDesignPallete },
  { name: "Consulting & Advisory", icon: SVGUserSound },
  { name: "Marketing", icon: SVGCampaign },
  { name: "Admin Support", icon: SVGAdminSupport },
  { name: "Customer Service", icon: SVGUserSound },
  { name: "Security & Auditing", icon: SVGLock },
  { name: "Community Building", icon: SVGUsers },
  { name: "Other", icon: SVGInfo },
];

const hourlyRates: HourlyRate[] = [
  // { label: "All Rates", min: 0, max: null },
  { label: "$10 - $25", min: 10, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50+", min: 50, max: null },
];

const FindTalent = () => {
  const { user: profile } = useSelector((state: any) => state.app);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedHourlyRate, setSelectedHourlyRate] = useState<string>("All Rates");
  const [searchText, setSearchText] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isHourlyRateDropdownOpen, setIsHourlyRateDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const hourlyRateDropdownRef = useRef<HTMLDivElement>(null);
  const tabletFiltersRef = useRef<HTMLDivElement>(null);
  const [isCreateServiceModalOpen, setIsCreateServiceModalOpen] = useState(false);

  const mergeListings = useCallback((primary: JobData[], secondary: JobData[]): JobData[] => {
    const seen = new Set<string>();
    const merged: JobData[] = [];

    [...primary, ...secondary].forEach(item => {
      const key =
        item.id ||
        `${item.username}|${item.jobName}|${item.description}|${item.paymentAmount}|${item.paidIn}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      merged.push(item);
    });

    return merged;
  }, []);

  const loadServices = useCallback(async () => {
    setJobsLoading(true);
    try {
      const [taggedListings, authorListings] = await Promise.all([
        fetchW3rkListings("service"),
        fetchAuthorListings("service", profile?.address),
      ]);
      const fresh = mergeListings(taggedListings, authorListings);
      setJobs(prev => mergeListings(fresh, prev));
    } catch (error) {
      console.error("Error loading Lens services:", error);
    } finally {
      setJobsLoading(false);
    }
  }, [mergeListings, profile?.address]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 991);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleJobCardClick = (job: JobData) => {
    setSelectedJob(job);
    if (window.innerWidth <= 767) {
      setIsDrawerOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideCategoryDropdown = categoryDropdownRef.current?.contains(target) ?? false;
      const isInsideHourlyDropdown = hourlyRateDropdownRef.current?.contains(target) ?? false;
      const isInsideTabletFilters = tabletFiltersRef.current?.contains(target) ?? false;

      if (!isInsideCategoryDropdown && !isInsideTabletFilters) {
        setIsCategoryDropdownOpen(false);
      }
      if (!isInsideHourlyDropdown && !isInsideTabletFilters) {
        setIsHourlyRateDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen || isHourlyRateDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryDropdownOpen, isHourlyRateDropdownOpen]);

  // Parse payment amount to get numeric value
  const parsePaymentAmount = (paymentAmount: string): number => {
    const match = paymentAmount.match(/\$(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      !searchText ||
      job.jobName.toLowerCase().includes(searchText.toLowerCase()) ||
      job.description.toLowerCase().includes(searchText.toLowerCase()) ||
      job.username.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "All" ||
      job.tags.some(tag => tag === selectedCategory);

    // Filter by hourly rate
    const selectedRate = hourlyRates.find(rate => rate.label === selectedHourlyRate);
    let matchesRate = true;
    if (selectedRate && selectedRate.label !== "All Rates") {
      const jobRate = parsePaymentAmount(job.paymentAmount);
      matchesRate =
        jobRate >= selectedRate.min && (selectedRate.max === null || jobRate <= selectedRate.max);
    }

    return matchesSearch && matchesCategory && matchesRate;
  });

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);
  const getCategoryIconStyle = (isSelected: boolean) => ({
    filter: isSelected ? "brightness(0.26)" : "none",
  });
  const handleCategorySelection = (categoryName: string, closeDropdown = false) => {
    setSelectedCategory(prev => (prev === categoryName ? "" : categoryName));
    if (closeDropdown) {
      setIsCategoryDropdownOpen(false);
    }
  };
  const handleHourlyRateSelection = (rateLabel: string, closeDropdown = false) => {
    setSelectedHourlyRate(prev => (prev === rateLabel ? "All Rates" : rateLabel));
    if (closeDropdown) {
      setIsHourlyRateDropdownOpen(false);
    }
  };
  const handleServicePublished = (listing?: JobData) => {
    if (listing) {
      setJobs(prev => mergeListings([listing], prev));
    }
    void loadServices();
    window.setTimeout(() => {
      void loadServices();
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-[64px] sm:pt-[36px] custom-container max-w-[1440px] mx-auto">
        <div className="flex sm:flex-col md:flex-row md:max-lg:flex-col gap-[16px] md:gap-[20px] lg:gap-[32px] sm:pt-[48px] md:pt-[32px] pb-[80px] md:pb-[32px] px-[8px] md:px-[24px] lg:px-0">
          {/* Category Dropdown - Desktop */}
          <div className="hidden lg:flex flex-col gap-[12px]" ref={categoryDropdownRef}>
            <h3 className="text-[12px] font-medium text-[#AEAEAE] uppercase leading-[150%] tracking-[1%] align-middle">
              Category
            </h3>
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full h-[44px] border border-[#E0E0E0] rounded-[8px] px-[16px] flex items-center justify-between bg-white"
              >
                <div className="flex items-center gap-[12px]">
                  {selectedCategoryData && (
                    <>
                      <selectedCategoryData.icon size={20} className="text-[#818181]" />
                      <span className="text-[16px] font-medium text-[#212121]">
                        {selectedCategory}
                      </span>
                    </>
                  )}
                  {!selectedCategoryData && (
                    <span className="text-[16px] font-medium text-[#818181]">Select Category</span>
                  )}
                </div>
                <ChevronDown
                  size={20}
                  className={`text-[#818181] transition-transform ${
                    isCategoryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isCategoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg max-h-[300px] overflow-y-auto">
                  {categories.map(category => {
                    const IconComponent = category.icon;
                    const isSelected = selectedCategory === category.name;
                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategorySelection(category.name, true)}
                        className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] text-left transition-colors ${
                          isSelected ? "bg-[#EEEEEE]" : "hover:bg-[#F5F5F5]"
                        }`}
                      >
                        <span className="flex-shrink-0" style={getCategoryIconStyle(isSelected)}>
                          <IconComponent size={20} className="flex-shrink-0 text-[#818181]" />
                        </span>
                        <span
                          className={`text-[16px] leading-[24px] tracking-[0px] align-middle ${
                            isSelected
                              ? "font-semibold text-[#212121]"
                              : "font-medium text-[#818181]"
                          }`}
                        >
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Hourly Rate Dropdown - Desktop */}
          <div className="hidden lg:flex flex-col gap-[12px]" ref={hourlyRateDropdownRef}>
            <h3 className="text-[12px] font-medium text-[#AEAEAE] uppercase leading-[150%] tracking-[1%] align-middle">
              Hourly Rate
            </h3>
            <div className="relative">
              <button
                onClick={() => setIsHourlyRateDropdownOpen(!isHourlyRateDropdownOpen)}
                className="w-full h-[44px] border border-[#E0E0E0] rounded-[8px] px-[16px] flex items-center justify-between bg-white"
              >
                <span className="text-[16px] font-medium text-[#212121]">{selectedHourlyRate}</span>
                <ChevronDown
                  size={20}
                  className={`text-[#818181] transition-transform ${
                    isHourlyRateDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isHourlyRateDropdownOpen && (
                <div className="absolute z-10 w-full mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg max-h-[300px] overflow-y-auto">
                  {hourlyRates.map(rate => {
                    const isSelected = selectedHourlyRate === rate.label;
                    return (
                      <button
                        key={rate.label}
                        onClick={() => handleHourlyRateSelection(rate.label, true)}
                        className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] text-left transition-colors ${
                          isSelected ? "bg-[#EEEEEE]" : "hover:bg-[#F5F5F5]"
                        }`}
                      >
                        <span
                          className={`text-[16px] leading-[24px] tracking-[0px] align-middle ${
                            isSelected
                              ? "font-semibold text-[#212121]"
                              : "font-medium text-[#818181]"
                          }`}
                        >
                          {rate.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div
            className="hidden md:max-lg:grid grid-cols-2 gap-[12px] w-full"
            ref={tabletFiltersRef}
          >
            <div className="relative col-span-2">
              <Search
                className="absolute left-[16px] top-1/2 transform -translate-y-1/2 text-[#A0A0A0]"
                size={20}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full h-[44px] py-[8px] pl-[44px] pr-[16px] border border-[#E0E0E0] rounded-[8px] text-[15px] leading-[16px] text-[#4A4A4A] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#5D3FD3] bg-white"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full h-[44px] border border-[#E0E0E0] rounded-[8px] px-[16px] flex items-center justify-between bg-white"
              >
                <div className="flex items-center gap-[12px] min-w-0">
                  {selectedCategoryData && (
                    <>
                      <selectedCategoryData.icon
                        size={20}
                        className="text-[#818181] flex-shrink-0"
                      />
                      <span className="text-[16px] font-medium text-[#212121] truncate">
                        {selectedCategory}
                      </span>
                    </>
                  )}
                  {!selectedCategoryData && (
                    <span className="text-[16px] font-medium text-[#818181]">Select Category</span>
                  )}
                </div>
                <ChevronDown
                  size={20}
                  className={`text-[#818181] transition-transform ${
                    isCategoryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isCategoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg max-h-[300px] overflow-y-auto">
                  {categories.map(category => {
                    const IconComponent = category.icon;
                    const isSelected = selectedCategory === category.name;
                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategorySelection(category.name, true)}
                        className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] text-left transition-colors ${
                          isSelected ? "bg-[#EEEEEE]" : "hover:bg-[#F5F5F5]"
                        }`}
                      >
                        <span className="flex-shrink-0" style={getCategoryIconStyle(isSelected)}>
                          <IconComponent size={20} className="flex-shrink-0 text-[#818181]" />
                        </span>
                        <span
                          className={`text-[16px] leading-[24px] tracking-[0px] align-middle ${
                            isSelected
                              ? "font-semibold text-[#212121]"
                              : "font-medium text-[#818181]"
                          }`}
                        >
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsHourlyRateDropdownOpen(!isHourlyRateDropdownOpen)}
                className="w-full h-[44px] border border-[#E0E0E0] rounded-[8px] px-[16px] flex items-center justify-between bg-white"
              >
                <span className="text-[16px] font-medium text-[#212121] truncate">
                  {selectedHourlyRate}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-[#818181] transition-transform ${
                    isHourlyRateDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isHourlyRateDropdownOpen && (
                <div className="absolute z-10 w-full mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg max-h-[300px] overflow-y-auto">
                  {hourlyRates.map(rate => {
                    const isSelected = selectedHourlyRate === rate.label;
                    return (
                      <button
                        key={rate.label}
                        onClick={() => handleHourlyRateSelection(rate.label, true)}
                        className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] text-left transition-colors ${
                          isSelected ? "bg-[#EEEEEE]" : "hover:bg-[#F5F5F5]"
                        }`}
                      >
                        <span
                          className={`text-[16px] leading-[24px] tracking-[0px] align-middle ${
                            isSelected
                              ? "font-semibold text-[#212121]"
                              : "font-medium text-[#818181]"
                          }`}
                        >
                          {rate.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Sidebar */}
          <div className="md:hidden w-[320px] mt-6 flex-shrink-0">
            <div className="bg-white rounded-[8px] p-[24px] flex flex-col h-fit">
              <div className="relative">
                <Search
                  className="absolute left-[16px] top-1/2 transform -translate-y-1/2 text-[#A0A0A0]"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="w-[268px] h-[40px] min-w-[32px] min-h-[32px] py-[8px] pl-[44px] pr-[16px] border-[0.5px] border-[#E0E0E0] rounded-[8px] text-[15px] leading-[16px] text-[#4A4A4A] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#5D3FD3] bg-white"
                />
              </div>

              <div className="flex flex-col">
                <h3 className="text-[12px] font-medium mt-5 mb-4 text-[#AEAEAE] uppercase leading-[150%] tracking-[1%] align-middle">
                  CATEGORY
                </h3>
                <div className="flex flex-col gap-[12px]">
                  {categories.map(category => {
                    const IconComponent = category.icon;
                    const isSelected = selectedCategory === category.name;
                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategorySelection(category.name)}
                        className="flex items-center gap-[12px] rounded-[8px] text-left transition-colors text-[#4A4A4A]"
                      >
                        <span className="flex-shrink-0" style={getCategoryIconStyle(isSelected)}>
                          <IconComponent size={20} className="flex-shrink-0 text-[#818181]" />
                        </span>
                        <span
                          className={`text-[16px] leading-[24px] tracking-[0px] align-middle ${
                            isSelected
                              ? "font-semibold text-[#212121]"
                              : "font-medium text-[#818181]"
                          }`}
                        >
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="text-[12px] mt-5 mb-4 font-medium text-[#AEAEAE] uppercase leading-[150%] tracking-[1%]">
                  HOURLY RATE
                </h3>
                <div className="flex flex-col gap-4">
                  {hourlyRates.map(rate => {
                    const isSelected = selectedHourlyRate === rate.label;
                    return (
                      <button
                        key={rate.label}
                        onClick={() => handleHourlyRateSelection(rate.label)}
                        className="text-left"
                      >
                        <span
                          className={`text-[16px] leading-[24px] tracking-[0px] align-middle ${
                            isSelected
                              ? "font-semibold text-[#212121]"
                              : "font-medium text-[#818181]"
                          }`}
                        >
                          {rate.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                className="md:hidden w-full bg-[#212121] text-white rounded-full flex items-center justify-center gap-[8px] font-medium text-[14px] py-[8px] px-[16px] hover:bg-[#333333] transition-colors mt-8"
                onClick={() => setIsCreateServiceModalOpen(true)}
              >
                <Plus size={20} />
                <span>Add a Service</span>
              </button>
            </div>
          </div>

          {/* Jobs List */}
          <div className="flex-1 flex flex-col w-full mt-5 md:w-auto sm:gap-[16px] md:gap-0 md:min-w-0 md:max-lg:mt-0">
            {jobsLoading ? (
              <div className="bg-white rounded-[8px] p-[32px] text-center text-[#7A7A7A] text-[15px]">
                Loading services...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-[8px] p-[32px] text-center text-[#7A7A7A] text-[15px]">
                No services found
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <div key={index} className=" group group-hover:bg-[#fafafa]">
                  <div
                    onClick={() => handleJobCardClick(job)}
                    className="bg-white group-hover:bg-[#fafafa] p-6 sm:p-[8px] sm:pb-[16px] md:p-[24px] pb-[16px] md:pb-[24px] grid sm:grid-cols-[92px_1fr] grid-cols-[64px_1fr] gap-x-[12px] md:gap-x-[20px] gap-y-[8px] hover:shadow-sm transition-shadow cursor-pointer"
                  >
                    <div className="row-span-2 sm:row-span-3 sm:aspect-square">
                      <Image
                        src={job.profileImage}
                        alt={job.username}
                        width={64}
                        height={64}
                        className="rounded-[8px] object-cover sm:h-[92px] sm:w-[92px] w-[64px] h-[64px] md:w-[64px] md:h-[64px] opacity-100"
                        onError={e => {
                          (e.target as HTMLImageElement).src = "/images/Lenshead_1.png";
                        }}
                      />
                    </div>
                    <div className="flex items-start justify-between sm:gap-[8px] gap-[12px] sm:flex-col flex-row md:gap-[16px] row-span-2">
                      <div className="flex flex-col justify-evenly h-full min-w-0 flex-1">
                        <h4 className="text-[14px] md:text-[16px] font-medium text-[#212121] leading-[20px] md:leading-[24px]">
                          {job.username}
                        </h4>
                        <h3 className="sm:text-[18px] text-[20px] font-semibold text-[#212121] leading-[22px] md:leading-[24px]">
                          {job.jobName}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center min-w-[84px] h-[40px] py-[8px] px-[16px] border border-[#B4B4B4] rounded-full sm:text-[16px] text-[20px] font-semibold leading-[24px] tracking-[-0.2px] opacity-100 whitespace-nowrap bg-[#F6F6F6] group-hover:bg-white">
                          {job.paymentAmount}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 mt-[8px]">
                      <p className="text-[14px] md:text-[16px] text-[#6C6C6C] leading-[20px] md:leading-[24px] line-clamp-2 max-w-full">
                        {job.description}
                      </p>
                    </div>

                    <div className="col-span-2 mt-[8px]">
                      <div className="flex flex-wrap gap-3">
                        {job.tags
                          .filter(tag => tag !== "[tag]" && tag.trim() !== "")
                          .slice(0, 3)
                          .map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center justify-center h-[32px] py-[6px] px-[12px] bg-[#F2F2F2] text-[#323232] rounded-full text-[13px] font-medium leading-[20px] tracking-[0px] align-middle opacity-100"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                  {index < filteredJobs.length - 1 && (
                    <hr className=" border-0 h-[1px] bg-[#E8E8E8] my-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isMobile && (
        <button
          className="fixed bottom-[20px] right-[20px] flex bg-[#212121] text-white rounded-full items-center justify-center gap-[8px] font-medium text-[14px] py-[8px] px-[16px] hover:bg-[#333333] transition-colors shadow-lg z-50"
          onClick={() => setIsCreateServiceModalOpen(true)}
        >
          <Plus size={20} />
          <span>Add a Service</span>
        </button>
      )}

      <JobDetailDrawer job={selectedJob} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <JobDetailModal job={selectedJob} open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <CreateServiceModal
        open={isCreateServiceModalOpen}
        onClose={() => setIsCreateServiceModalOpen(false)}
        onPublished={handleServicePublished}
      />
    </div>
  );
};

export default FindTalent;
