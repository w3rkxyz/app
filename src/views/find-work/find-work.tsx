"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Bell,
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
  Plus,
} from "lucide-react";
import JobDetailDrawer from "@/components/find-work/job-detail-drawer";
import JobDetailModal from "@/components/find-work/job-detail-modal";
import CreateJobModal from "@/components/find-work/create-job-modal";

import FindWorkJobCard from "@/components/Cards/FindWorkJobCard";
import { SVGAdminSupport, SVGBlockChain, SVGCampaign, SVGCode, SVGDesignPallete, SVGInfo, SVGLock, SVGUsers, SVGUserSound } from "@/assets/list-svg-icon";

interface JobData {
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
  icon: any;
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

const FindWork = () => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tabletDropdownRef = useRef<HTMLDivElement>(null);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);

  useEffect(() => {
    fetch("/find-work.json")
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error("Error loading jobs:", err));
  }, []);

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
      const isInsideDesktopFilter = dropdownRef.current?.contains(target) ?? false;
      const isInsideTabletFilter = tabletDropdownRef.current?.contains(target) ?? false;

      if (!isInsideDesktopFilter && !isInsideTabletFilter) {
        setIsCategoryDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      !searchText ||
      job.jobName.toLowerCase().includes(searchText.toLowerCase()) ||
      job.description.toLowerCase().includes(searchText.toLowerCase()) ||
      job.username.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      !selectedCategory || selectedCategory === "All" || job.tags.some(tag => tag === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);
  const getCategoryIconStyle = (isSelected: boolean) => ({
    filter: isSelected ? "brightness(0.26)" : "none",
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-[64px] sm:pt-[36px] custom-container max-w-[1440px] mx-auto">
        <div className="flex sm:flex-col md:flex-row md:max-lg:flex-col gap-[16px] md:gap-[24px] lg:gap-[32px] sm:pt-[48px] md:pt-[32px] pb-[80px] md:pb-[32px] px-[8px] md:px-[24px] lg:px-0">
          <div className="hidden lg:flex flex-col gap-[12px]" ref={dropdownRef}>
            <h3 className="text-[12px] font-medium text-[#AEAEAE] uppercase leading-[150%] tracking-[1%] align-middle">
              CATEGORY
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
                  className={`text-[#818181] transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""
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
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] text-left transition-colors ${isSelected ? "bg-[#EEEEEE]" : "hover:bg-[#F5F5F5]"
                          }`}
                      >
                        <span className="flex-shrink-0" style={getCategoryIconStyle(isSelected)}>
                          <IconComponent size={20} />
                        </span>
                        <span
                          className={`text-[16px] leading-[24px] tracking-[0px] align-middle ${isSelected
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

          <div className="hidden md:max-lg:grid grid-cols-2 gap-[12px] w-full" ref={tabletDropdownRef}>
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
                      <selectedCategoryData.icon size={20} className="text-[#818181] flex-shrink-0" />
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
                  className={`text-[#818181] transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""
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
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] text-left transition-colors ${isSelected ? "bg-[#EEEEEE]" : "hover:bg-[#F5F5F5]"
                          }`}
                      >
                        <span className="flex-shrink-0" style={getCategoryIconStyle(isSelected)}>
                          <IconComponent size={20} />
                        </span>
                        <span
                          className={`text-[16px] leading-[24px] tracking-[0px] align-middle ${isSelected
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
                <h3 className="text-[12px] font-medium text-[#AEAEAE] mt-5 mb-4 uppercase leading-[150%] tracking-[1%] align-middle">
                  CATEGORY
                </h3>
                <div className="flex flex-col gap-[12px]">
                  {categories.map(category => {
                    const IconComponent = category.icon;
                    const isSelected = selectedCategory === category.name;
                    return (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className="flex items-center gap-[12px] rounded-[8px] text-left transition-colors text-[#4A4A4A]"
                      >
                        <span className="flex-shrink-0" style={getCategoryIconStyle(isSelected)}>
                          <IconComponent size={20} className="flex-shrink-0 text-[#818181]" />
                        </span>
                        <span
                          className={`text-[16px] leading-[24px] tracking-[0px] align-middle ${isSelected
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

              <button
                className="md:hidden w-full bg-[#212121] text-white rounded-full flex items-center justify-center gap-[8px] font-medium text-[14px] py-[10px] px-[16px] hover:bg-[#333333] transition-colors mt-8"
                onClick={() => setIsCreateJobModalOpen(true)}
              >
                <Plus size={20} />
                <span>Publish a Job</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col w-full mt-5 md:w-auto sm:gap-[16px] md:gap-0 md:min-w-0 md:max-lg:mt-0">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-[8px] p-[32px] text-center text-[#7A7A7A] text-[15px]">
                No jobs found
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <FindWorkJobCard
                  key={index}
                  job={job}
                  onClick={handleJobCardClick}
                  isLast={index === filteredJobs.length - 1}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {isMobile && (
        <button
          className="fixed bottom-[20px] right-[20px] flex bg-[#212121] text-white rounded-full items-center justify-center gap-[8px] font-medium text-[14px] py-[8px] px-[16px] hover:bg-[#333333] transition-colors shadow-lg z-50"
          onClick={() => setIsCreateJobModalOpen(true)}
        >
          <Plus size={20} />
          <span>Publish a Job</span>
        </button>
      )}

      <JobDetailDrawer job={selectedJob} open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <JobDetailModal job={selectedJob} open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <CreateJobModal
        open={isCreateJobModalOpen}
        onClose={() => setIsCreateJobModalOpen(false)}
      />
    </div>
  );
};

export default FindWork;
