"use client";

import SearchInput from "@/components/reusable/SearchInput/SearchInput";

import JobCard from "@/components/JobCard/JobCard";
import MyButton from "@/components/reusable/Button/Button";
import ViewJobModal from "../view-job-modal/view-job-modal";
import { useEffect, useState } from "react";

const buttons = [
  {
    buttonText: "Blockchain Development",
    buttonStyles: "bg-[#FFC2C2] mb-[8px]",
  },
  {
    buttonText: "Programming & Development",
    buttonStyles: "bg-[#FFD8C2] mb-[8px]",
  },
  { buttonText: "Design", buttonStyles: "bg-[#FFF2C2] mb-[8px] w-[150px]" },
  { buttonText: "Marketing", buttonStyles: "bg-[#EFFFC2] mb-[8px]" },
  { buttonText: "Admin Support", buttonStyles: "bg-[#C2FFC5] mb-[8px]" },
  { buttonText: "Customer Service", buttonStyles: "bg-[#C2FFFF] mb-[8px]" },
  { buttonText: "Security & Auditing", buttonStyles: "bg-[#C2CCFF] mb-[8px]" },
  {
    buttonText: "Consulting & Advisory",
    buttonStyles: "bg-[#D9C2FF] mb-[8px]",
  },
  { buttonText: "Community Building", buttonStyles: "bg-[#FAC2FF] mb-[8px]" },
  { buttonText: "Other", buttonStyles: "bg-[#E4E4E7] mb-[8px]" },
];

const FindWork = () => {
  const [categoriesMobile, setCategoriesMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleCategoriesMobile = () => {
    setCategoriesMobile(!categoriesMobile);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="find-work-section pt-[82px] md:pt-[120px] sm:pt-[60px] mb-[99px] sm:mb-10">
      <div className="custom-container">
        <div className="flex sm:flex-col md:flex-col justify-between items-center mt-[30px]  sm:items-start sm:gap-[16px] relative">
          <h2 className="section-title text-center sm:text-start text-[32px] sm:text-[20px] font-semibold font-secondary leading-[20px] tracking-[-4%]">
            Discover your next{" "}
            <span className="text-gradient">opportunity.</span>
          </h2>
          <SearchInput toggleCategories={toggleCategoriesMobile} />
          <div
            className={`find-work-message-section w-[206px] bg-[#FFFFFF] rounded-[8px] p-[8px] sm:items-center gap-[3px] absolute top-[100%] self-end
            border-[1px] border-[#E4E4E7] hidden ${
              categoriesMobile ? "sm:flex" : "sm:hidden"
            } sm:flex-col`}
          >
            <MyButton
              buttonText="Blockchain Development"
              buttonType="secondary"
              buttonStyles="bg-[#FFC2C2] mb-[8px] sm:font-bold sm:text-[10px] sm:leading-[11px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Programming & Development"
              buttonType="secondary"
              buttonStyles="bg-[#FFD8C2] mb-[8px] sm:font-bold sm:text-[10px] sm:leading-[11px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Design"
              buttonType="secondary"
              buttonStyles="bg-[#FFF2C2] mb-[8px] w-[150px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Marketing"
              buttonType="secondary"
              buttonStyles="bg-[#EFFFC2] mb-[8px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Admin Support"
              buttonType="secondary"
              buttonStyles="bg-[#C2FFC5] mb-[8px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Customer Service"
              buttonType="secondary"
              buttonStyles="bg-[#C2FFFF] mb-[8px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Security & Auditing"
              buttonType="secondary"
              buttonStyles="bg-[#C2CCFF] mb-[8px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Consulting & Advisory"
              buttonType="secondary"
              buttonStyles="bg-[#D9C2FF] mb-[8px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Community Building"
              buttonType="secondary"
              buttonStyles="bg-[#FAC2FF] mb-[8px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Other"
              buttonType="secondary"
              buttonStyles="bg-[#E4E4E7] mb-[8px] sm:w-full"
            ></MyButton>
            <button className="mx-auto w-fit py-[10px] px-[20px] tx-[12px] leading-[14.5px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px] mt-[8px]">
              Apply
            </button>
          </div>
        </div>

        <div className="tags-section flex sm:flex-col md:flex-col justify-center md:items-start gap-[32px] mt-[30px] sm:mt-[16px]">
          <div
            className="find-work-message-section w-[250px] flex-shrink-0 h-fit sm:h-auto md:h-auto sm:my-0 sm:py-0 bg-[#FFFFFF] sm:bg-transparent md:bg-transparent rounded-[20px] sm:rounded-[0px] p-[29px] sm:w-full sm:items-center gap-2 sm:whitespace-nowrap md:w-full md:flex md:items-center md:whitespace-nowrap overflow-x-auto sm:ml-[-20px]
            border-[1px] border-[#E4E4E7] sm:hidden"
          >
            <h4 className="text-[20px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-center pb-[24px] sm:pb-[10px] md:pb-[10px]">
              Categories
            </h4>

            {buttons.map((button, index) => (
              <MyButton
                key={index}
                buttonText={button.buttonText}
                buttonType="secondary"
                buttonStyles={`${button.buttonStyles} ${
                  selectedCategory === index ? "border-[1px] border-black" : ""
                }`}
                action={() => setSelectedCategory(index)}
              />
            ))}
          </div>

          <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-col gap-[16px]">
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Post Title"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenModal}
              type="job"
            />
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Post Title"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenModal}
              type="job"
            />
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="UI/UX Designer | Figma | Web, Dashboard Analytic, Mobile App | SaaS"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenModal}
              type="job"
            />
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Post Title"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenModal}
              type="job"
            />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            <ViewJobModal handleCloseModal={handleCloseModal} type="job" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FindWork;
