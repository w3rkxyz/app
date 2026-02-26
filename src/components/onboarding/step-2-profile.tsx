"use client";

import React from "react";
import Image from "next/image";
import FormInput from "./form-input";
import FormTextarea from "./form-textarea";
import NavigationButtons from "./navigation-buttons";
import type { Step2ProfileProps } from "@/types/onboarding";

const Step2Profile: React.FC<Step2ProfileProps> = ({
  formData,
  profilePhoto,
  bannerPhoto,
  onInputChange,
  onProfilePhotoChange,
  onBannerPhotoChange,
  onBack,
  onContinue,
  saving = false,
}) => {
  return (
    <div className="flex min-h-screen flex-col w-full xs:px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[584px]">
        <p className="mb-1 text-[13px] text-[#83899F]">Step 2 of 3</p>

        <div className="mb-8">
          <h1 className="mb-1 xs:text-[24px] text-[28px] font-medium text-prrimary ">
            Complete Your Profile
          </h1>
          <p className="text-base text-[#83899F]">
            A good profile builds trust and helps you get noticed.
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#212121]">Profile Photo</label>
            <p className="mb-4 text-sm text-[#83899F]">Recommended size: 300 X 300</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              {profilePhoto ? (
                <div className="sm:h-[50px] sm:w-[50px] overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 h-32 w-32">
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <label className="flex sm:h-[50px] sm:w-[50px]  cursor-pointer items-center justify-center h-32 w-32">
                  <Image
                    src="/icons/choose-photo.svg"
                    alt="Choose photo"
                    width={100}
                    height={100}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onProfilePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
              {profilePhoto && (
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-700 hover:bg-gray-600">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onProfilePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Banner Section */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[#212121]">Banner</label>
          <p className="mb-4 text-sm text-[#83899F]">Upload a banner photo (optional)</p>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-[#FBFCFC] p-8 p transition-colors h-[172px] hover:border-gray-400">
            {bannerPhoto ? (
              <div className="relative h-32 w-full overflow-hidden rounded-lg sm:h-48">
                <Image
                  src={bannerPhoto}
                  alt="Banner"
                  width={800}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <>
                <svg
                  className="mb-2 h-[28px] w-[28px] text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-sm text-[#969BA1]">Minimum width 480 pixels</p>
              </>
            )}
            <input type="file" accept="image/*" onChange={onBannerPhotoChange} className="hidden" />
          </label>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <FormInput
            label="Name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Add your name"
            required
          />

          <FormInput
            label="Job Title / Industry"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={onInputChange}
            placeholder="Add your job title"
            required
          />

          <FormTextarea
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={onInputChange}
            placeholder="Tell us a bit about yourself"
            maxLength={300}
            rows={4}
          />

          <FormInput
            label="Location"
            name="location"
            value={formData.location}
            onChange={onInputChange}
            placeholder="Add your location"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-[#212121]">Add Website</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Image src={"/icons/link.svg"} alt="Link" height={20} width={20} />
              </span>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={onInputChange}
                placeholder="Add your website"
                className="w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#212121]">
              Add Social Links
            </label>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-700">
                  <Image src={"/icons/x.svg"} alt="X Icon" height={16} width={16} />
                </span>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={onInputChange}
                  placeholder="Add your X URL"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none"
                />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-600">
                  <Image src={"/icons/linkedin.svg"} alt="Linkedin Icon" height={20} width={20} />
                </span>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={onInputChange}
                  placeholder="Add your LinkedIn URL"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none"
                />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  <Image src={"/icons/github.svg"} alt="Github Icon" height={20} width={20} />
                </span>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={onInputChange}
                  placeholder="Add your Github URL"
                  className="w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <NavigationButtons
          onBack={onBack}
          onContinue={onContinue}
          continueLabel="Continue"
          continueDisabled={!formData.name || !formData.jobTitle || saving}
          showSkip={false}
        />
      </div>
    </div>
  );
};

export default Step2Profile;
