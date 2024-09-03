"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import JobCard from "@/components/JobCard/JobCard";
import ProfileModal from "./profileModal";
import {
  useSession,
  SessionType,
  usePublications,
  profileId,
  ProfileId,
  appId,
} from "@lens-protocol/react-web";
import ViewJobModal from "../view-job-modal/view-job-modal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import getLensProfileData from "@/utils/getLensProfile";
import ProfileSkeleton from "@/components/reusable/profileSkeleton";

function getDomain(url: string) {
  return url.replace(/https?:\/\//, "").replace(/\/$/, "");
}

const Profile = () => {
  const [profileId, setProfileId] = useState<ProfileId[]>();
  const [data, setData] = useState<any[]>([]);
  const { data: session, loading: sessionLoading } = useSession();
  const { data: publications } = usePublications({
    where: {
      from: profileId,
      metadata: {
        publishedOn: [appId(process.env.NEXT_PUBLIC_APP_ID as string)],
        tags: {
          all: ["w3rk"],
        },
      },
    },
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [cardType, setCardType] = useState("job");
  const [selectedPublication, setSelectedPublication] = useState<any>();

  // const { data: profile, loading } = useProfile({
  //       forHandle: "lens/primal",
  //     });
  const [userData, setUserData] = useState<any>({
    displayName: "",
    handle: "@lenshandle.lens",
    cover: "",
    picture: "/images/paco-square.svg",
    following: 100,
    followers: 75,
    about:
      "bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla",
    location: "Location",
    website: "user website url",
    X: "",
    github: "",
    linkedin: "",
    jobTitle: "",
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenCardModal = (publication?: any) => {
    if (publication) setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  useEffect(() => {
    console.log("Session updated");
    if (session?.type === SessionType.WithProfile) {
      const profile = session.profile;
      setProfileId([profile.id]);

      const profileData = getLensProfileData(profile);

      const handle = {
        displayName: profileData.displayName,
        handle: profileData.handle,
        cover: profileData.coverPicture,
        picture:
          profileData.picture !== ""
            ? profileData.picture
            : "/images/paco-square.svg",
        following: profile ? profile.stats.following : 100,
        jobTitle: profileData.attributes["job title"]
          ? profileData.attributes["job title"]
          : "",
        followers: profile ? profile.stats.followers : 75,
        about: profileData.bio ? profileData.bio : userData.about,
        website: profileData.attributes.website
          ? profileData.attributes.website
          : "",
        location: profileData.attributes.location
          ? profileData.attributes.location
          : "",
        X: profileData.attributes.x ? profileData.attributes.x : "",
        github: profileData.attributes.github
          ? profileData.attributes.github
          : "",
        linkedin: profileData.attributes.linkedin
          ? profileData.attributes.linkedin
          : "",
      };
      console.log("Handle: ", handle);
      setUserData(handle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.type, session?.authenticated]);

  useEffect(() => {
    if (publications) {
      setData(
        publications.filter((publication) => publication.isHidden === false)
      );
      setLoading(false);
    }
  }, [publications]);

  return sessionLoading ? (
    <ProfileSkeleton />
  ) : (
    <div className="px-[156px] sm:px-[16px] pt-[110px] sm:pt-[122px] sm:w-full mb-[35px]">
      <div className="absolute w-full mx-0 left-0 top-156px sm:top-[79px] px-[156px] sm:px-[16px] -z-40">
        <div
          className="bg-[#E4E4E7] w-full h-[196px] sm:h-[110px] rounded-[16px] relative"
          style={{ backgroundImage: `url(${userData.cover})` }}
        ></div>
      </div>
      <div className="flex sm:flex-col sm:w-full gap-[30px] pt-[116px] sm:pt-[26px] px-[32px] sm:px-[0px]">
        <div className=" max-w-[350px] min-w-[350px] sm:w-full">
          <div className="w-[160px] h-[160px] sm:w-[80px] sm:h-[80px] relative mb-[16px] ml-[16px]">
            <Image
              src={userData.picture}
              layout="fill"
              className="rounded-[20px] sm:rounded-[12px]"
              alt="user icon"
            />
          </div>
          {userData.displayName !== "" && (
            <h3 className="leading-[19px] text-[16px] font-medium mb-[0px] sm:mb-[0px]">
              {userData.displayName}
            </h3>
          )}
          <span className="text-[#707070] leading-[16.94px] text-[14px] font-medium sm:mb-[20px]">
            {userData.handle}
          </span>
          {userData.jobTitle !== "" && (
            <h3 className="leading-[19px] text-[16px] font-medium mt-[10px] mb-[12px] sm:mt-[6px]">
              {userData.jobTitle}
            </h3>
          )}
          <div className="flex gap-[4px] leading-[16.94px] text-[14px] font-medium">
            <span>About Me</span>
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
          <Link href={"/settings"}>
            <button className="rounded-[8px] bg-[#E4E4E7] text-black px-[16px] py-[7px] mb-[16px] text-[14px]">
              Edit Profile
            </button>
          </Link>
          <hr className="bg-[#E4E4E7] h-[1px] mb-[16px]" />
          <div className="flex gap-[12px] mb-[19px]">
            {userData.X !== "" && (
              <a target="_blank" href={userData.X}>
                <Image
                  src="/images/twitter-social.svg"
                  alt="user icon"
                  width={24}
                  height={24}
                />
              </a>
            )}
            {userData.github !== "" && (
              <a target="_blank" href={userData.github}>
                <Image
                  src="/images/github-social.svg"
                  alt="user icon"
                  width={24}
                  height={24}
                />
              </a>
            )}
            {userData.linkedin !== "" && (
              <a target="_blank" href={userData.linkedin}>
                <Image
                  src="/images/linkedin-social.svg"
                  alt="user icon"
                  width={24}
                  height={24}
                />
              </a>
            )}
          </div>
          <div className="flex flex-col gap-[16px] mb-[20px] sm:mb-[0px]">
            {userData.website !== "" && (
              <Link href={userData.website}>
                <div className="flex gap-[11.6px] items-center">
                  <Image
                    src="/images/earth.svg"
                    alt="earth icon"
                    width={24}
                    height={24}
                  />
                  <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                    {getDomain(userData.website)}
                  </span>
                </div>
              </Link>
            )}
            {userData.location !== "" && (
              <div className="flex gap-[14.2px] items-center pl-[3.2px]">
                <Image
                  src="/images/location.svg"
                  alt="earth icon"
                  width={18.33}
                  height={24}
                />
                <span className="leading-[16.94px] text-[14px] font-medium text-[black]">
                  {userData.location}
                </span>
              </div>
            )}
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
            <button className="leading-[19.36px] text-[16px] font-medium text-[black] px-[10px] py-[7px] bg-[#E4E4E7] rounded-[8px] sm:w-fit">
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
          <div
            className={`border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-col gap-[16px] sm:mb-[14px] ${
              publications && data.length > 0 ? "" : "min-h-[430px]"
            }`}
          >
            {loading ? (
              <>
                <Skeleton
                  className="h-[208px] rounded-[16px] sm:h-[340px]"
                  baseColor="#E4E4E7"
                  borderRadius={"12px"}
                />
                <Skeleton
                  className="h-[208px] rounded-[16px] sm:h-[340px]"
                  baseColor="#E4E4E7"
                  borderRadius={"12px"}
                />
              </>
            ) : publications && data.length > 0 ? (
              data.map((publication, index) => {
                if (publication.__typename === "Post") {
                  var attributes: any = {};
                  publication.metadata.attributes?.map((attribute: any) => {
                    attributes[attribute.key] = attribute.value;
                  });

                  return (
                    <JobCard
                      key={index}
                      userAvatar="/images/head-2.svg"
                      username="adam.lens"
                      jobName="Post Title"
                      jobIcon="/images/bag.svg"
                      onCardClick={() => handleOpenCardModal(publication)}
                      setType={setCardType}
                      type={
                        attributes["post type"]
                          ? attributes["post type"]
                          : "job"
                      }
                      publication={publication}
                    />
                  );
                }
              })
            ) : (
              <div className="h-[460px] w-full flex flex-col gap-[11px] justify-center items-center">
                <Image
                  src="/images/case-grey.svg"
                  alt="job post icon"
                  color="black"
                  width={24}
                  height={21}
                />
                <span className="leading-[16.94px] max-w-[280px] text-center text-[16px] font-semibold text-[#707070]">
                  Make your first job/service post
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      {isJobModalOpen && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            <ProfileModal type="job" handleCloseModal={handleCloseJobModal} />
          </div>
        </div>
      )}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            <ProfileModal
              type="service"
              handleCloseModal={handleCloseServiceModal}
            />
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            <ViewJobModal
              handleCloseModal={handleCloseModal}
              type={cardType}
              publication={selectedPublication}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
