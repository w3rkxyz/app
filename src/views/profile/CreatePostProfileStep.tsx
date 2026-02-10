"use client";

import React from "react";
import Image from "next/image";
import FormInput from "@/components/onboarding/form-input";
import FormTextarea from "@/components/onboarding/form-textarea";
import NavigationButtons from "@/components/onboarding/navigation-buttons";
import type { Step2ProfileProps } from "@/types/onboarding";

export interface CreatePostProfileStepProps extends Step2ProfileProps {
  /** When true, navigation buttons are not rendered (modal provides footer) */
  hideNavigation?: boolean;
  /** Optional step label, e.g. "Step 2 of 3" */
  stepLabel?: string;
  /** Optional title override */
  title?: string;
  /** Optional subtitle override */
  subtitle?: string;
}

const CreatePostProfileStep: React.FC<CreatePostProfileStepProps> = ({
  formData,
  profilePhoto,
  bannerPhoto,
  onInputChange,
  onProfilePhotoChange,
  onBannerPhotoChange,
  onBack,
  onContinue,
  hideNavigation = false,
  stepLabel = "Step 2 of 3",
  title = "Complete Your Profile",
  subtitle = "A good profile builds trust and helps you get noticed.",
}) => {
  return (
    <div className="flex w-full max-w-full flex-col px-2 py-4 xs:px-4 sm:px-6 md:px-8">
      <div className="mx-auto w-full max-w-[584px]">
        <p className="mb-1 text-xs text-[#83899F] xs:text-[13px]">{stepLabel}</p>

        <div className="mb-4 xs:mb-6 sm:mb-8">
          <h1 className="mb-1 text-[20px] font-medium text-primary-black xs:text-[24px] sm:text-[28px]">
            {title}
          </h1>
          <p className="text-sm text-[#83899F] xs:text-base">{subtitle}</p>
        </div>

        {/* Profile Photo */}
        <div className="mb-4 flex flex-col gap-4 xs:mb-6 xs:flex-row xs:justify-between xs:items-center">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#212121] xs:mb-2 xs:text-sm">
              Profile Photo
            </label>
            <p className="mb-2 text-xs text-[#83899F] xs:mb-4 xs:text-sm">
              Recommended size: 300 X 300
            </p>
          </div>
          <div className="flex items-center gap-4 xs:gap-6">
            <div className="relative flex-shrink-0">
              {profilePhoto ? (
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 xs:h-24 xs:w-24 sm:h-32 sm:w-32">
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center xs:h-24 xs:w-24 sm:h-32 sm:w-32">
                  <Image
                    src="/icons/choose-photo.svg"
                    alt="Choose photo"
                    width={100}
                    height={100}
                    className="h-10 w-10 xs:h-12 xs:w-12 sm:h-full sm:w-full object-contain"
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
                <label className="absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-700 hover:bg-gray-600 xs:h-8 xs:w-8">
                  <svg
                    className="h-3 w-3 text-white xs:h-4 xs:w-4"
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
        <div className="mb-4 xs:mb-6">
          <label className="mb-1 block text-xs font-medium text-[#212121] xs:mb-2 xs:text-sm">
            Banner
          </label>
          <p className="mb-2 text-xs text-[#83899F] xs:mb-4 xs:text-sm">
            Upload a banner photo (optional)
          </p>
          <label className="flex h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-[#FBFCFC] p-4 transition-colors hover:border-gray-400 xs:h-[140px] xs:p-6 sm:h-[172px] sm:p-8">
            {bannerPhoto ? (
              <div className="relative h-full w-full overflow-hidden rounded-lg">
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
                  className="mb-1 h-5 w-5 text-gray-400 xs:mb-2 xs:h-[28px] xs:w-[28px]"
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
                <p className="text-[10px] text-[#969BA1] xs:text-sm">Minimum width 480 pixels</p>
              </>
            )}
            <input type="file" accept="image/*" onChange={onBannerPhotoChange} className="hidden" />
          </label>
        </div>

        {/* Form Fields */}
        <div className="space-y-3 xs:space-y-4">
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
            <label className="mb-1 block text-xs font-medium text-[#212121] xs:mb-2 xs:text-sm">
              Add Website
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 xs:left-4">
                <Image src="/icons/link.svg" alt="Link" height={20} width={20} />
              </span>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={onInputChange}
                placeholder="Add your website"
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none xs:rounded-lg xs:pl-12 xs:pr-4 xs:py-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#212121] xs:mb-2 xs:text-sm">
              Add Social Links
            </label>
            <div className="space-y-3 xs:space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-700 xs:left-4">
                  <Image src="/icons/x.svg" alt="X Icon" height={16} width={16} />
                </span>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={onInputChange}
                  placeholder="Add your X URL"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none xs:pl-12 xs:pr-4 xs:py-3"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-600 xs:left-4">
                  <Image src="/icons/linkedin.svg" alt="Linkedin Icon" height={20} width={20} />
                </span>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={onInputChange}
                  placeholder="Add your LinkedIn URL"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none xs:pl-12 xs:pr-4 xs:py-3"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg xs:left-4">
                  <Image src="/icons/github.svg" alt="Github Icon" height={20} width={20} />
                </span>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={onInputChange}
                  placeholder="Add your Github URL"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none xs:pl-12 xs:pr-4 xs:py-3"
                />
              </div>
            </div>
          </div>
        </div>

        {!hideNavigation && (
          <NavigationButtons
            onBack={onBack}
            onContinue={onContinue}
            continueLabel="Continue"
            continueDisabled={!formData.name || !formData.jobTitle}
            showSkip={false}
          />
        )}
      </div>
    </div>
  );
};

export default CreatePostProfileStep;
