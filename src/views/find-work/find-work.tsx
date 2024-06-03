"use client";

import SearchInput from "@/components/reusable/SearchInput/SearchInput";

import JobCard from "@/components/JobCard/JobCard";
import MyButton from "@/components/reusable/Button/Button";
import { useEffect, useState } from "react";
import ViewJobModal from "../view-job-modal/view-job-modal";

const FindWork = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="find-work-section pt-[170px] md:pt-[120px] sm:pt-[70px] mb-[99px] sm:mb-10">
      <div className="custom-container">
        <div className="flex sm:flex-col md:flex-col justify-between items-center my-[30px]">
          <h2 className="section-title text-center text-[32px] sm:text-[24px] font-semibold font-secondary leading-[20px] tracking-[-4%] pb-4">
            Discover <span className="text-primary">opportunities</span>.
          </h2>
          <SearchInput />
        </div>

        <div className="tags-section flex sm:flex-col md:flex-col justify-center items-center md:items-start gap-[25px] mt-[30px] sm:mt-[-20px]">
          <div className="find-work-message-section w-[250px] flex-shrink-0 h-[591px] sm:h-auto md:h-auto sm:my-0 sm:py-0 bg-[#FFFFFF] sm:bg-transparent md:bg-transparent rounded-[20px] sm:rounded-[0px] p-[23px] sm:w-full sm:flex sm:items-center gap-2 sm:whitespace-nowrap md:w-full md:flex md:items-center md:whitespace-nowrap overflow-x-auto sm:ml-[-20px]">
            <h4 className="text-[20px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-center pb-5 sm:pb-[10px] md:pb-[10px]">
              Tags
            </h4>

            <MyButton
              buttonText="Blockchain Development"
              buttonType="secondary"
              buttonStyles="bg-[#FFAEAE]/50 mb-[6px] sm:font-bold sm:text-[10px] sm:leading-[11px] sm:w-full"
            ></MyButton>
            <MyButton
              buttonText="Programming & Development"
              buttonType="secondary"
              buttonStyles="bg-[#FFD5AE]/50 mb-[6px] sm:font-bold sm:text-[10px] sm:leading-[11px]"
            ></MyButton>
            <MyButton
              buttonText="Design"
              buttonType="secondary"
              buttonStyles="bg-[#FDFFAE]/50 mb-[6px] w-[150px]"
            ></MyButton>
            <MyButton
              buttonText="Marketing"
              buttonType="secondary"
              buttonStyles="bg-[#E0FFAE]/50 mb-[6px]"
            ></MyButton>
            <MyButton
              buttonText="Admin Support"
              buttonType="secondary"
              buttonStyles="bg-[#AEFFBB]/50 mb-[6px]"
            ></MyButton>
            <MyButton
              buttonText="Customer Service"
              buttonType="secondary"
              buttonStyles="bg-[#AEFAFF]/50 mb-[6px]"
            ></MyButton>
            <MyButton
              buttonText="Security & Auditing"
              buttonType="secondary"
              buttonStyles="bg-[#AED8FF]/50 mb-[6px]"
            ></MyButton>
            <MyButton
              buttonText="Consulting & Advisory"
              buttonType="secondary"
              buttonStyles="bg-[#BAAEFF]/50 mb-[6px]"
            ></MyButton>
            <MyButton
              buttonText="Community Building"
              buttonType="secondary"
              buttonStyles="bg-[#EAAEFF]/50 mb-[6px]"
            ></MyButton>
            <MyButton
              buttonText="Other"
              buttonType="secondary"
              buttonStyles="bg-[#FFAEF2]/50 mb-[6px]"
            ></MyButton>
          </div>

          <div className="flex-1 md:w-full sm:mt-[-20px]">
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Job Name"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenModal}
            />
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Job Name"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenModal}
            />
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Job Name"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenModal}
            />
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Job Name"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenModal}
            />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="w-full">
            <ViewJobModal handleCloseModal={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FindWork;
