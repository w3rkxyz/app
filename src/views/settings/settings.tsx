"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import JobCard from "@/components/JobCard/JobCard";

const Settings = () => {
  const [backgroundImage, setBackgroundImage] = useState<any>(null);
  const [photo, setPhoto] = useState<any>(null);

  const handleCoverUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(imageUrl);
    }
  };

  const handlePhotoUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
    }
  };

  return (
    <div className="px-[156px] sm:px-[16px] pt-[110px] sm:pt-[122px] sm:w-full">
      <div className="absolute w-full mx-0 left-0 top-156px sm:top-[79px] px-[156px] sm:px-[16px] z-20">
        <div
          className="bg-white w-full h-[196px] sm:h-[110px] rounded-[16px] relative flex justify-end items-end p-[16px]"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <label
            className="rounded-[8px] bg-[#E4E4E7] text-black px-[16px] py-[7px] sm:px-[14px] sm:py-[4px] text-[14px] w-fit h-fit cursor-pointer"
            htmlFor="file_upload"
          >
            Choose Cover
          </label>
          <input
            id="file_upload"
            type="file"
            name="file_upload"
            className="hidden"
            onChange={handleCoverUpload}
          />
          <label
            className={`w-[160px] h-[160px] sm:w-[80px] sm:h-[80px] absolute rounded-[16px] ${
              photo === null ? "border-[1px]" : ""
            } border-[#E4E4E7] flex justify-center items-center 
          left-[31px] bottom-[-80px] sm:left-[16px] sm:bottom-[-40px] bg-white cursor-pointer`}
            htmlFor="pic_upload"
          >
            {photo === null ? (
              <Image
                src="/images/add-photo.svg"
                className={`sm:w-[20px] sm:h-[20px]`}
                alt="user icon"
                width={32}
                height={32}
              />
            ) : (
              <div
                className={`w-full h-full rounded-[16px] bg-fit`}
                style={{ backgroundImage: `url(${photo})` }}
              ></div>
            )}
            <input
              id="pic_upload"
              type="file"
              name="file_upload"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>
      </div>
      <div className="flex flex-col sm:w-full pt-[230px] sm:pt-[130px] px-[294px] sm:px-[0px]">
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Name
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Add your name"
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[#FF4B4B]">
            Job Title
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Add your job title"
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px]">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Bio
          </span>
          <textarea
            className="form-input rounded-[12px] p-[11px] h-[160px] border-[1px] border-[#E4E4E7] resize-none sm:w-full"
            placeholder="Add your bio"
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            X (Twitter)
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Link to profile"
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[#FF4B4B]">
            Github
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Link to profile"
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[#FF4B4B]">
            Linkedin
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Link to profile"
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Website
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Website URL"
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Location
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Enter Location"
          />
        </div>
        <button className="mx-auto w-fit py-[4px] px-[24px] tx-[14px] leading-[24px] text-white bg-[#C6AAFF] rounded-[8px] font-semibold mb-[36px]">
          Save
        </button>
      </div>
    </div>
  );
};

export default Settings;
