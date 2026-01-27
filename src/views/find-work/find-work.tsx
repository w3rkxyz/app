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
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const categories: Category[] = [
  { name: "Blockchain Development", icon: LinkIcon },
  { name: "Programming & Development", icon: Code },
  { name: "Design", icon: Palette },
  { name: "Consulting & Advisory", icon: MessageCircle },
  { name: "Marketing", icon: TrendingUp },
  { name: "Admin Support", icon: Headphones },
  { name: "Customer Service", icon: ShoppingBag },
  { name: "Security & Auditing", icon: Shield },
  { name: "Community Building", icon: Users },
  { name: "Other", icon: HelpCircle },
];

const FindWork = () => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Design");
  const [searchText, setSearchText] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      selectedCategory === "All" || job.tags.some(tag => tag === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-[60px] sm:pt-[20px] custom-container max-w-[1440px] mx-auto">
        <div className="flex sm:flex-col md:flex-row gap-[16px] md:gap-[32px] sm:pt-[48px] md:pt-[32px] pb-[80px] md:pb-[32px] px-[16px] md:px-0">
          <div className="hidden md:flex flex-col gap-[12px]" ref={dropdownRef}>
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
                        onClick={() => {
                          setSelectedCategory(category.name);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] text-left transition-colors ${
                          isSelected ? "bg-[#EEEEEE]" : "hover:bg-[#F5F5F5]"
                        }`}
                      >
                        <IconComponent size={20} className="flex-shrink-0 text-[#818181]" />
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

          <div className="md:hidden w-[320px] flex-shrink-0">
            <div className="bg-white rounded-[8px] p-[24px] flex flex-col gap-[12px] h-fit">
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

              <div className="flex flex-col gap-[12px]">
                <h3 className="text-[12px] font-medium text-[#AEAEAE] uppercase leading-[150%] tracking-[1%] align-middle">
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
                        <IconComponent size={20} className="flex-shrink-0 text-[#818181]" />
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

              <button
                className="md:hidden w-full bg-[#212121] text-white rounded-full flex items-center justify-center gap-[8px] font-medium text-[14px] py-[8px] px-[16px] hover:bg-[#333333] transition-colors mt-auto"
                onClick={() => setIsCreateJobModalOpen(true)}
              >
                <Plus size={20} />
                <span>Publish a Job</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col w-full md:w-auto md:gap-0">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-[8px] p-[32px] text-center text-[#7A7A7A] text-[15px]">
                No jobs found
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <div key={index} className=" group group-hover:bg-[#fafafa]">
                  <div
                    onClick={() => handleJobCardClick(job)}
                    className="bg-white group-hover:bg-[#fafafa] p-[16px] md:p-[24px] pb-[16px] md:pb-[24px] grid grid-cols-[64px_1fr] gap-x-[12px] md:gap-x-[20px] gap-y-[8px] hover:shadow-sm transition-shadow cursor-pointer"
                  >
                    <div className="row-span-2">
                      <Image
                        src={job.profileImage}
                        alt={job.username}
                        width={64}
                        height={64}
                        className="rounded-[8px] object-cover w-[64px] h-[64px] md:w-[64px] md:h-[64px] opacity-100"
                        onError={e => {
                          (e.target as HTMLImageElement).src = "/images/Lenshead_1.png";
                        }}
                      />
                    </div>
                    <div className="flex items-start justify-between gap-[12px] md:gap-[16px] row-span-2">
                      <div className="flex flex-col justify-evenly h-full min-w-0 flex-1">
                        <h4 className="text-[14px] md:text-[16px] font-medium text-[#212121] leading-[20px] md:leading-[24px]">
                          {job.username}
                        </h4>
                        <h3 className="sm:text-[18px] text-[20px] font-semibold text-[#212121] leading-[22px] md:leading-[24px]">
                          {job.jobName}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center min-w-[84px] h-[40px] py-[8px] px-[16px] border border-[#B4B4B4] rounded-full sm:text-[18px] text-[20px] font-semibold leading-[24px] tracking-[-0.2px] opacity-100 whitespace-nowrap bg-[#F6F6F6] group-hover:bg-white">
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
                      <div className="flex flex-wrap gap-[4px]">
                        {job.tags
                          .filter(tag => tag !== "[tag]" && tag.trim() !== "")
                          .slice(0, 3)
                          .map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center justify-center min-w-[118px] h-[32px] py-[6px] px-[12px] bg-[#F2F2F2] text-[#323232] rounded-full text-[13px] font-medium leading-[20px] tracking-[0px] align-middle opacity-100"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                  {index < filteredJobs.length - 1 && (
                    <hr className="md:hidden border-0 h-[1px] bg-[#8C8C8C33] my-0" />
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
