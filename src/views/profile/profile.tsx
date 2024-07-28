"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import JobCard from "@/components/JobCard/JobCard";
import ProfileModal from "./profileModal";
import { useSession, SessionType } from "@lens-protocol/react-web";

const Profile = () => {
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isListServiceModalOpen, setIsListServiceModalOpen] = useState(false);
  const [selectedJobName, setSelectedJobName] = useState("");
  const [isJobCardOpen, setIsJobCardOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // const { data: profile, loading } = useProfile({
  //       forHandle: "lens/primal",
  //     });
  const { data: session, loading: sessionLoading } = useSession();
  const [userData, setUserData] = useState<any>({
    handle: "adam.lens",
    picture: "/images/paco.svg",
    following: 100,
    followers: 75,
    about:
      "bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla",
  });

  const handleOpenJobModal = () => {
    setIsJobModalOpen(true);
  };

  const handleOpenServiceModal = () => {
    setIsServiceModalOpen(true);
  };

  const handleCloseJobModal = () => {
    setIsJobModalOpen(false);
  };

  const handleCloseServiceModal = () => {
    setIsServiceModalOpen(false);
  };

  const handleOpenCardModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    console.log("Session updated");
    if (session?.type === SessionType.WithProfile) {
      const profile = session.profile;
      const handle = {
        handle: profile?.handle?.localName
          ? `${profile?.handle?.localName}.${profile?.handle?.namespace}`
          : "@lenshandle.lens",
        picture:
          session.profile?.metadata?.picture?.__typename == "ImageSet"
            ? session.profile?.metadata?.picture?.raw?.uri
            : "/images/paco.svg",
        following: profile ? profile.stats.following : 100,
        followers: profile ? profile.stats.followers : 75,
        about: profile?.metadata?.bio ? profile.metadata.bio : userData.about,
      };
      console.log("Bio: ", profile?.metadata?.bio);
      setUserData(handle);
    }
  }, [session?.type]);

  return (
    <div className="px-[156px] sm:px-[16px] pt-[110px] sm:w-full mb-[40px]">
      <div className="absolute w-full mx-0 left-0 top-156px sm:top-[66px] px-[156px] sm:px-[16px] -z-40">
        <div className="bg-[#E4E4E7] w-full h-[196px] sm:h-[110px] rounded-[16px] relative"></div>
      </div>
      <div className="flex sm:flex-col sm:w-full gap-[24px] pt-[116px] sm:pt-[26px] px-[32px] sm:px-[0px]">
        <div className=" max-w-[320px] min-w-[320px] sm:w-full">
          <div className="w-[160px] h-[160px] sm:w-[80px] sm:h-[80px] relative mb-[16px] ml-[16px]">
            <Image
              src={userData.picture}
              layout="fill"
              className="rounded-[20px] sm:rounded-[12px]"
              alt="user icon"
            />
          </div>
          <h3 className="leading-[19px] text-[16px] font-semibold mb-[12px] sm:mb-[0px]">
            Display Name
          </h3>
          <span className="text-[#707070] leading-[16.94px] text-[14px] font-medium mb-[12px] sm:mb-[20px]">
            {userData.handle}
          </span>
          <h3 className="leading-[19px] text-[16px] font-semibold mb-[12px] sm:mt-[6px]">
            Job Title
          </h3>
          <div className="flex gap-[4px] leading-[16.94px] text-[14px] font-medium">
            <span>About me</span>
            <span className="text-[#F71919]">max. 260 characters</span>
          </div>
          <p className="leading-[16.94px] text-[14px] font-medium text-[#707070] mb-[16px]">
            {userData.about}
          </p>

          <div className="flex gap-[13px] mb-[16px]">
            <div className="flex flex-col">
              <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                {userData.following}
              </span>
              <span className="leading-[16.94px] text-[14px] font-medium text-[#707070]">
                Following
              </span>
            </div>
            <div className="flex flex-col">
              <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                {userData.followers}
              </span>
              <span className="leading-[16.94px] text-[14px] font-medium text-[#707070]">
                Followers
              </span>
            </div>
          </div>
          <button className="rounded-[8px] bg-[#E4E4E7] text-black px-[16px] py-[7px] mb-[16px] text-[14px]">
            Edit Profile
          </button>
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
            <div className="flex gap-[12px] align-middle">
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
            <div className="flex gap-[12px] align-middle">
              <Image
                src="/images/location.svg"
                alt="earth icon"
                width={24}
                height={24}
              />
              <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                Location
              </span>
            </div>
            <div className="flex gap-[12px] align-middle">
              <Image
                src="/images/w.svg"
                alt="earth icon"
                width={24}
                height={24}
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
            <div className="flex gap-[12px] sm:gap-[15px] sm:justify-between">
              <button
                className="rounded-[8px] bg-[#C6AAFF] text-white px-[16px] py-[7px] text-[14px] sm:flex-1"
                onClick={handleOpenJobModal}
              >
                Post A Job
              </button>
              <button
                className="rounded-[8px] bg-[#351A6B] text-white px-[16px] py-[7px] text-[14px] sm:flex-1"
                onClick={handleOpenServiceModal}
              >
                List A Service
              </button>
            </div>
          </div>
          <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-col gap-[16px] sm:mb-[14px]">
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Post Title"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenCardModal}
              type="service"
            />
            <JobCard
              userAvatar="/images/head-2.svg"
              username="adam.lens"
              jobName="Post Title"
              jobIcon="/images/bag.svg"
              onCardClick={handleOpenCardModal}
              type="job"
            />
          </div>
        </div>
      </div>
      {isJobModalOpen && (
        <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            <ProfileModal type="job" handleCloseModal={handleCloseJobModal} />
          </div>
        </div>
      )}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            <ProfileModal
              type="service"
              handleCloseModal={handleCloseServiceModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
