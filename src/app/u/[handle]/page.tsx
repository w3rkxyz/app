"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CreatePostModal from "@/views/profile/CreatePostModal";
import { PlusIcon } from "lucide-react";
import ProfilePostCard from "@/components/Cards/ProfilePostCard";

function getDomain(url: string) {
  return url.replace(/https?:\/\//, "").replace(/\/$/, "");
}

// Dummy data matching design (Kate Elodie Mohr)
export const DUMMY_USER = {
  displayName: "Kate Elodie Mohr",
  handle: "@mohr007",
  cover: "/images/cover.png",
  picture: "/images/profile.jpg",
  following: 134,
  followers: 798,
  about:
    "User information can go here along with service offered information, total character limit will have to be decided bc we don't wanna run over the limit. User information can go here along with service offered information, total character limit will have to be decided bc we don't wanna run over the limit.",
  location: "San Francisco, USA",
  website: "www.elodiemohrdesign.com",
  X: "https://x.com/example",
  github: "https://github.com/example",
  linkedin: "https://linkedin.com/in/example",
  jobTitle: "Web Developer and Digital UI/UX Designer",
};

const DUMMY_POSTS = [
  {
    type: "job" as const,
    title: "Smart Contract Developer",
    description:
      "We're looking for an experienced Solidity developer to review and optimize our DeFi smart contracts. The role involves auditing security risks, reducing gas costs, and improving overall performance.",
    tags: ["Blockchain", "Security", "web3"],
    paymentAmount: "$500",
  },
  {
    type: "service" as const,
    title: "Web3 Product Designer",
    description:
      "Seeking a skilled designer with Web3 experience to create user interfaces for our decentralized application. Must be familiar with wallet flows, dApp patterns, and crypto UX best practices.",
    tags: ["Product Design", "UI/UX", "Web3"],
    paymentAmount: "$40.00/hr",
  },
  {
    type: "job" as const,
    title: "UI/UX Designer",
    description:
      "We need a creative designer to redesign our DeFi platform's user experience. The ideal candidate should have experience with financial applications and understand Web3 user flows.",
    tags: ["Design", "Marketing", "Community Building"],
    paymentAmount: "$1,200",
  },
];

type PageProps = {
  params: Promise<{ handle: string }>;
};

export default function Profile({ params }: PageProps) {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const userData = DUMMY_USER;
  const dummyPosts = DUMMY_POSTS;
  const score = 23694;

  const handleOpenJobModal = () => setIsJobModalOpen(true);
  const handleCloseJobModal = () => setIsJobModalOpen(false);
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = "/images/paco-square.svg";
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="px-[156px] profile-md:px-[80px] profile-sm:px-[20px] sm:p-[0px] sm:pt-[60px] pt-[90px]  sm:w-full mb-[40px]">
        {/* Profile header - LinkedIn-style banner + overlaid photo */}
        <div className="relative w-full">
          <div className="w-full sm:h-[226] aspect-[1344/201] relative sm:rounded-none rounded-t-[12px] overflow-hidden bg-[#C0E0E7]">
            {userData.cover ? (
              <Image
                src={userData.cover}
                fill
                className="object-cover"
                alt="Cover"
                sizes="(max-width: 1344px) 100vw, 1344px"
              />
            ) : null}
          </div>
          <div className="absolute left-6 sm:left-4 -bottom-20 sm:-bottom-[68px] w-[154px] h-[154px] sm:w-[135px] sm:h-[135px] rounded-full border-[3px] border-white overflow-hidden">
            <div className="relative w-full h-full">
              <Image
                src={userData.picture}
                fill
                className="rounded-full object-cover"
                alt="Profile"
                onError={handleImageError}
              />
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col lg:w-full gap-[30px] pt-[90px] sm:pt-[68px] bg-white px-[32px] sm:px-[0px]">
          {/* Left column - Profile info */}
          <div className="max-w-[350px] sm:max-w-full min-w-[350px] sm:min-w-0 sm:w-full sm:px-[16px]">
            <div className="flex items-center gap-2 mb-[4px]">
              <h1 className="text-[24px] font-bold text-[#212121] leading-[29px]">
                {userData.displayName}
              </h1>
              <Link href="/settings" className="text-[#212121] hover:opacity-80">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.24141 16.8751H3.75C3.58424 16.8751 3.42527 16.8093 3.30806 16.692C3.19085 16.5748 3.125 16.4159 3.125 16.2501V12.7587C3.12508 12.5932 3.19082 12.4344 3.30781 12.3173L12.9422 2.68291C13.0594 2.56579 13.2183 2.5 13.384 2.5C13.5497 2.5 13.7086 2.56579 13.8258 2.68291L17.3172 6.17198C17.4343 6.28917 17.5001 6.44808 17.5001 6.61377C17.5001 6.77946 17.4343 6.93837 17.3172 7.05557L7.68281 16.6923C7.56569 16.8093 7.40695 16.875 7.24141 16.8751Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.625 5L15 9.375"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
            <span className="block text-[#6C6C6C] text-[14px] font-medium mb-[12px] leading-[20px]">
              {userData.handle}
            </span>
            <h2 className="text-[16px] font-semibold text-[#212121] mb-[12px] leading-[22px]">
              {userData.jobTitle}
            </h2>
            <p className="text-[14px] text-[#6C6C6C] leading-[20px] mb-[16px]">{userData.about}</p>

            {/* Followers / Following */}
            <div className="flex gap-[16px] my-[16px] sm:py-0 py-[16px]">
              <span className="leading-[20px]">
                <span className="font-semibold sm:text-[14px] text-[20px] text-[#212121]">
                  {userData.followers}
                </span>
                <span className="font-medium sm:text-[12px] text-[16px] text-[#6C6C6C] ml-1">
                  Followers
                </span>
              </span>
              <span className=" leading-[20px]">
                <span className="font-semibold sm:text-[14px] text-[20px] text-[#212121]">
                  {userData.following}
                </span>
                <span className="font-medium sm:text-[12px] text-[16px] text-[#6C6C6C] ml-1">
                  Following
                </span>
              </span>
            </div>
            <hr className="bg-[##8C8C8C33] h-[1px] mb-0" />
            {/* Social links */}
            <div className="flex gap-[12px] my-[16px]">
              {userData.X && (
                <Link
                  target="_blank"
                  href={userData.X}
                  className="text-[#6C6C6C] hover:text-[#212121]"
                >
                  <Image src="/images/twitter-social.svg" alt="X" width={24} height={24} />
                </Link>
              )}
              {userData.github && (
                <Link
                  target="_blank"
                  href={userData.github}
                  className="text-[#6C6C6C] hover:text-[#212121]"
                >
                  <Image src="/images/github-social.svg" alt="GitHub" width={24} height={24} />
                </Link>
              )}
              {userData.linkedin && (
                <Link
                  target="_blank"
                  href={userData.linkedin}
                  className="text-[#6C6C6C] hover:text-[#212121]"
                >
                  <Image src="/images/linkedin-social.svg" alt="LinkedIn" width={24} height={24} />
                </Link>
              )}
            </div>

            {/* Website, Location, W-score */}
            <div className="flex flex-col gap-[12px]">
              {userData.website && (
                <Link
                  href={userData.website}
                  target="_blank"
                  className="flex items-center gap-[12px] text-[#212121] hover:opacity-80"
                >
                  <Image src="/icons/globe.svg" alt="" width={20} height={20} />
                  <span className="text-[14px] font-medium">{getDomain(userData.website)}</span>
                </Link>
              )}
              {userData.location && (
                <div className="flex items-center gap-[12px] text-[#212121]">
                  <Image src="/images/MapPin.svg" alt="" width={18} height={24} />
                  <span className="text-[14px] font-medium">{userData.location}</span>
                </div>
              )}
              <div className="flex items-center gap-[12px]">
                <Image
                  src="/images/w.svg"
                  alt="Score"
                  width={24}
                  height={16}
                  className="text-[#351A6B]"
                />
                <span className="text-[14px] font-semibold text-[#212121]">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              className="w-full sm:flex h-[40px] hidden items-center justify-center gap-2 rounded-full bg-[#212121] text-white py-2 px-4 text-[14px] font-medium hover:bg-[#333] transition-colors shrink-0 mt-[16px]"
              onClick={handleOpenJobModal}
            >
              <PlusIcon className="w-5 h-5" />
              Create Post
            </button>
          </div>
          <hr className="bg-[#E4E4E7] h-[1px] mb-0 hidden lg:block" />

          {/* Right column - All Posts */}
          <div className="sm:pt-0 pt-[0] flex-1 min-w-0 sm:px-[16px]">
            <div className="flex flex-row items-center justify-between gap-4 mb-[16px]">
              <h2 className="text-[20px] font-semibold text-[#212121] leading-[24px]">All Posts</h2>
              <button
                className="order-1 sm:hidden md:order-2 w-full max-w-[153px] md:w-[153px] h-[40px] flex items-center justify-center gap-2 rounded-full bg-[#212121] text-white py-2 px-4 text-[14px] font-medium hover:bg-[#333] transition-colors shrink-0"
                onClick={handleOpenJobModal}
              >
                <PlusIcon className="w-5 h-5" />
                Create Post
              </button>
            </div>
            <div className="bg-white">
              {dummyPosts.map((post, index) => (
                <ProfilePostCard
                  key={index}
                  profileImage={userData.picture}
                  displayName={userData.displayName}
                  type={post.type}
                  title={post.title}
                  description={post.description}
                  tags={post.tags}
                  paymentAmount={post.paymentAmount}
                  isLast={index === dummyPosts.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {isJobModalOpen && (
          <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800/50 flex justify-center items-center sm:items-end cursor-auto">
            <div className="w-full flex justify-center items-center sm:items-end min-h-full sm:min-h-0">
              <CreatePostModal handleCloseModal={handleCloseJobModal} handle={userData.handle} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
