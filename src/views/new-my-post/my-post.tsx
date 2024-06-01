"use client";

import React, { useEffect, useState } from "react";
import JobCard from "@/components/JobCard/JobCard";
import Sidebar from "@/components/reusable/Sidebar/Sidebar";
import PostJobModal from "../post-job-modal/post-job-modal";
import ListServiceModal from "../list-service-modal/list-service-modal";
import ViewJobModal2 from "../view-job-modal-2/view-job-modal-2";
import ViewServiceModal from "../view-service-modal/view-service-modal";

const NewMyPost = () => {
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isListServiceModalOpen, setIsListServiceModalOpen] = useState(false);
  const [selectedJobName, setSelectedJobName] = useState("");
  const [isJobCardOpen, setIsJobCardOpen] = useState(false);

  const handlePostJobOpen = () => {
    setIsPostJobModalOpen(true);
  };

  const handleListServiceOpen = () => {
    setIsListServiceModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPostJobModalOpen(false);
  };
  const handleCloseModal2 = () => {
    setIsListServiceModalOpen(false);
  };

  const handleJobCardOpen = (jobName: string) => {
    setIsJobCardOpen(true);
    setSelectedJobName(jobName);
  };
  const handleJobCardClose = () => {
    setIsJobCardOpen(false);
  };

  return (
    <div className="find-work-section pt-[170px] mb-[57px] sm:mb-10 sm:pt-[90px]">
      <div className="custom-container">
        <div className="flex sm:flex-col justify-between items-center md:items-start gap-5">
          <div className="flex-shrink-0">
            <div className="flex gap-[10px] mb-3 sm:mb-6">
              <button
                onClick={handlePostJobOpen}
                className="w-full text-[14px] text-white font-semibold font-secondary leading-[20px] tracking-[-1%] py-3 bg-[#A274FF] rounded-[10px]"
              >
                Post A Job
              </button>
              {isPostJobModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
                  <PostJobModal closeModal={handleCloseModal} />
                </div>
              )}
              <button
                onClick={handleListServiceOpen}
                className="w-full py-3 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] bg-white rounded-[10px]"
              >
                List A Service
              </button>
              {isListServiceModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
                  <ListServiceModal closeModal={handleCloseModal2} />
                </div>
              )}
            </div>
            <div className="sm:bg-[#FFFFFF] sm:px-4 sm:rounded-[16px]">
              <Sidebar height="692px" />
            </div>
          </div>

          <div className="right-panel flex-1">
            <JobCard
              cardStyles="flex !justify-start md:!justify-between gap-[55px] md:gap-5 sm:gap-0 items-center pl-[32px] md:pl-0"
              jobName="Service Name"
              onCardClick={() => handleJobCardOpen("Service Name")}
            />
            <JobCard
              cardStyles="flex !justify-start md:!justify-between gap-[55px] md:gap-5 sm:gap-0 items-center pl-[32px] md:pl-0"
              jobName="Job Name"
              onCardClick={() => handleJobCardOpen("Job Name")}
            />
            <JobCard
              cardStyles="flex !justify-start md:!justify-between gap-[55px] md:gap-5 sm:gap-0 items-center pl-[32px] md:pl-0"
              jobName="Service Name"
              onCardClick={() => handleJobCardOpen("Service Name")}
            />
            <JobCard
              cardStyles="flex !justify-start md:!justify-between gap-[55px] md:gap-5 sm:gap-0 items-center pl-[32px] md:pl-0"
              jobName="Job Name"
              onCardClick={() => handleJobCardOpen("Job Name")}
            />
            <JobCard
              cardStyles="flex !justify-start md:!justify-between gap-[55px] md:gap-5 sm:gap-0 items-center pl-[32px] md:pl-0"
              jobName="Service Name"
              onCardClick={() => handleJobCardOpen("Service Name")}
            />

            {isJobCardOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
                <div className="w-full">
                  {selectedJobName === "Service Name" ? (
                    <ViewServiceModal closeJobCardModal={handleJobCardClose} />
                  ) : selectedJobName === "Job Name" ? (
                    <ViewJobModal2 closeJobCardModal={handleJobCardClose} />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMyPost;
