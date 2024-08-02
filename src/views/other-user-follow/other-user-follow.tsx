"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import JobCard from "@/components/JobCard/JobCard";
import ProfileModal from "../profile/profileModal";
import {
  useProfile,
  useFollow,
  useSession,
  SessionType,
} from "@lens-protocol/react-web";
import { toast } from "react-hot-toast";
import ViewJobModal from "../view-job-modal/view-job-modal";

const OtherUserFollow = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: profile, loading } = useProfile({
    forHandle: "lens/primal",
  });
  const { data: session, loading: sessionLoading } = useSession();
  const { execute: follow, loading: followLoading } = useFollow();
  const [cardType, setCardType] = useState("job");
  const [userData, setUserData] = useState<any>({
    handle: "adam.lens",
    picture: "/images/paco-square.svg",
    following: 100,
    followers: 75,
    about:
      "bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla",
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenCardModal = () => {
    setIsModalOpen(true);
  };

  const handleFollow = async () => {
    if (profile) {
      if (profile.operations.canFollow === "NO") {
        toast.error("Must navigate here from homepage");
        return null;
      }

      if (session?.type === SessionType.WithProfile) {
        const result = await follow({ profile });

        if (result.isFailure()) {
          // handle failure scenarios
          toast.error("couldn't follow user, try again later");
          return;
        }

        // this might take a while depending on the congestion of the network
        const completion = await result.value.waitForCompletion();

        if (completion.isFailure()) {
          console.log(
            "There was an error processing the transaction",
            completion.error.message
          );
          return;
        }

        toast.success("Followed successfully");
      }
    }
  };

  return (
    <div className="px-[156px] sm:px-[16px] pt-[110px] sm:pt-[122px] sm:w-full mb-[40px]">
      <div className="absolute w-full mx-0 left-0 top-156px sm:top-[79px] px-[156px] sm:px-[16px] -z-40">
        <div className="bg-[#E4E4E7] w-full h-[196px] sm:h-[110px] rounded-[16px] relative"></div>
      </div>
      <div className="flex sm:flex-col sm:w-full gap-[24px] pt-[116px] sm:pt-[26px] px-[32px] sm:px-[0px]">
        <div className=" max-w-[320px] min-w-[320px] sm:w-full">
          <div className="w-[160px] h-[160px] sm:w-[80px] sm:h-[80px] relative mb-[16px] ml-[16px]">
            <Image
              src={
                profile?.metadata?.picture?.__typename == "ImageSet"
                  ? profile?.metadata && profile?.metadata?.picture?.raw?.uri
                  : "/images/paco-square.svg"
              }
              layout="fill"
              className="rounded-[20px] sm:rounded-[12px]"
              alt="user icon"
            />
          </div>
          <h3 className="leading-[19px] text-[16px] font-semibold mb-[0px] sm:mb-[0px]">
            Display Name
          </h3>
          <span className="text-[#707070] leading-[16.94px] text-[14px] font-medium mb-[12px] sm:mb-[20px]">
            {profile?.handle?.localName
              ? `${profile?.handle?.localName}.${profile?.handle?.namespace}`
              : "@lenshandle.lens"}
          </span>
          <h3 className="leading-[19px] text-[16px] font-semibold mt-[10px] mb-[12px] sm:mt-[6px]">
            Job Title
          </h3>
          <div className="flex gap-[4px] leading-[16.94px] text-[14px] font-medium">
            <span>About me</span>
            <span className="text-[#F71919]">max. 260 characters</span>
          </div>
          <p className="leading-[16.94px] text-[14px] font-medium text-[#707070] mb-[16px]">
            {profile?.metadata?.bio ? profile.metadata.bio : userData.about}
          </p>

          <div className="flex gap-[13px] mb-[16px]">
            <div className="flex flex-col">
              <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                {profile ? profile.stats.following : 100}
              </span>
              <span className="leading-[16.94px] text-[14px] font-medium text-[#707070]">
                Following
              </span>
            </div>
            <div className="flex flex-col">
              <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                {profile ? profile.stats.followers : 75}
              </span>
              <span className="leading-[16.94px] text-[14px] font-medium text-[#707070]">
                Followers
              </span>
            </div>
          </div>
          <div className="flex gap-[16px] mb-[16px]">
            {profile?.operations.isFollowedByMe.value ? (
              <button className="rounded-[8px] bg-[#351A6B] text-white px-[16px] py-[6px] text-[14px] leading-[24px]">
                Following
              </button>
            ) : (
              <button
                className="rounded-[8px] bg-[#C6AAFF] hover:bg-[#351A6B] text-white px-[16px] py-[6px] text-[14px] leading-[24px]"
                onClick={handleFollow}
              >
                Follow
              </button>
            )}
            <button className="rounded-[8px] bg-[#E4E4E7] text-black px-[16px] py-[6px] text-[14px] leading-[24px]">
              Message
            </button>
          </div>
          <hr className="bg-[#E4E4E7] h-[1px] mb-[16px]" />
          <div className="flex gap-[12px] mb-[19px]">
            <Image
              src="/images/twitter-social.svg"
              alt="user icon"
              width={24}
              height={24}
            />
            <Image
              src="/images/github-social.svg"
              alt="user icon"
              width={24}
              height={24}
            />
            <Image
              src="/images/linkedin-social.svg"
              alt="user icon"
              width={24}
              height={24}
            />
          </div>
          <div className="flex flex-col gap-[16px] mb-[20px] sm:mb-[0px]">
            <div className="flex gap-[11.6px] items-center">
              <Image
                src="/images/earth.svg"
                alt="earth icon"
                width={24}
                height={24}
              />
              <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                user website url
              </span>
            </div>
            <div className="flex gap-[14.2px] items-center pl-[3.2px]">
              <Image
                src="/images/location.svg"
                alt="earth icon"
                width={18.33}
                height={24}
              />
              <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                Location
              </span>
            </div>
            <div className="flex gap-[12.7px] items-center">
              <Image
                src="/images/w.svg"
                alt="earth icon"
                width={24}
                height={15.3}
              />
              <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                23,694
              </span>
            </div>
          </div>
        </div>
        <hr className="bg-[#E4E4E7] h-[1px] mb-[0px] hidden sm:block" />
        <div className="pt-[96px] sm:pt-[0px] flex-1">
          <div className="flex sm:flex-col sm:gap-[16px] justify-between sm:justify-start mb-[16px] align-middle">
            <button className="leading-[19.36px] text-[16px] font-semibold text-[black] px-[10px] py-[7px] bg-[#E4E4E7] rounded-[8px] sm:w-fit">
              Posts
            </button>
          </div>
          <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-col gap-[16px] sm:mb-[14px]">
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Post Title"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenCardModal}
              setType={setCardType}
              type="service"
            />
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Post Title"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenCardModal}
              setType={setCardType}
              type="job"
            />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            <ViewJobModal handleCloseModal={handleCloseModal} type={cardType} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherUserFollow;
