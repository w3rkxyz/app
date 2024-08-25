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
  usePublications,
  ProfileId,
  appId,
} from "@lens-protocol/react-web";
import { toast } from "react-hot-toast";
import ViewJobModal from "../view-job-modal/view-job-modal";
import getLensProfileData from "@/utils/getLensProfile";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSearchParams } from "next/navigation";

// export const dynamic = "force-dynamic";

const OtherUserFollow = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("handle");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileId, setProfileId] = useState<ProfileId[]>();
  const [data, setData] = useState<any[]>([]);
  console.log("userID: ", id);
  const { data: profile } = useProfile({
    forHandle: `lens/${id}`,
  });
  const { data: session } = useSession();
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
  const { execute: follow, loading: followLoading } = useFollow();
  const [cardType, setCardType] = useState("job");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>({
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
    jobTitle: "Job Title",
  });
  const [selectedPublication, setSelectedPublication] = useState<any>();
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenCardModal = (publication?: any) => {
    if (publication) setSelectedPublication(publication);
    setIsModalOpen(true);
  };
  const handleFollow = async () => {
    if (profile) {
      if (profile.operations.canFollow === "NO") {
        toast.error("Can't follow if directly routed to user profile");
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

  useEffect(() => {
    console.log("Session updated");
    if (profile) {
      setProfileId([profile.id]);
      console.log("Profile: ", profile);

      const profileData = getLensProfileData(profile);
      console.log(profileData);

      const handle = {
        handle: profileData.displayName,
        cover: profileData.coverPicture,
        picture:
          profileData.picture !== ""
            ? profileData.picture
            : "/images/paco-square.svg",
        following: profile ? profile.stats.following : 100,
        jobTitle: profileData.attributes["job title"]
          ? profileData.attributes["job title"]
          : "Job Title",
        followers: profile ? profile.stats.followers : 75,
        about: profileData.bio ? profileData.bio : userData.about,
        website: profileData.attributes.website
          ? profileData.attributes.website
          : "user website url",
        location: profileData.attributes.location
          ? profileData.attributes.location
          : "Location",
        X: profileData.attributes.X ? profileData.attributes.X : "",
        github: profileData.attributes.github
          ? profileData.attributes.github
          : "",
        linkedin: profileData.attributes.linkedin
          ? profileData.attributes.linkedin
          : "",
      };
      setUserData(handle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleImageError = () => {
    var data = { ...userData };
    data.picture = "/images/paco-square.svg";
    setUserData(data);
  };

  useEffect(() => {
    if (publications) {
      setData(publications);
      setLoading(false);
    }
  }, [publications]);

  return (
    <div className="px-[156px] sm:px-[16px] pt-[110px] sm:pt-[122px] sm:w-full mb-[40px]">
      <div className="absolute w-full mx-0 left-0 top-156px sm:top-[79px] px-[156px] sm:px-[16px] -z-40">
        <div
          className="bg-[#E4E4E7] w-full h-[196px] sm:h-[110px] rounded-[16px] relative"
          style={{ backgroundImage: `url(${userData.cover})` }}
        ></div>
      </div>
      <div className="flex sm:flex-col sm:w-full gap-[24px] pt-[116px] sm:pt-[26px] px-[32px] sm:px-[0px]">
        <div className=" max-w-[320px] min-w-[320px] sm:w-full">
          <div className="w-[160px] h-[160px] sm:w-[80px] sm:h-[80px] relative mb-[16px] ml-[16px]">
            <Image
              src={userData.picture}
              layout="fill"
              className="rounded-[20px] sm:rounded-[12px]"
              alt="user icon"
              onError={handleImageError}
            />
          </div>
          <h3 className="leading-[19px] text-[16px] font-semibold mb-[0px] sm:mb-[0px]">
            Display Name
          </h3>
          <span className="text-[#707070] leading-[16.94px] text-[14px] font-medium mb-[12px] sm:mb-[20px]">
            {userData.handle}
          </span>
          <h3 className="leading-[19px] text-[16px] font-semibold mt-[10px] mb-[12px] sm:mt-[6px]">
            {userData.jobTitle}
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
            {userData.X !== "" ? (
              <a target="_blank" href={userData.X}>
                <Image
                  src="/images/twitter-social.svg"
                  alt="user icon"
                  width={24}
                  height={24}
                />
              </a>
            ) : (
              <Image
                src="/images/twitter-social.svg"
                alt="user icon"
                width={24}
                height={24}
              />
            )}
            {userData.github !== "" ? (
              <a target="_blank" href={userData.github}>
                <Image
                  src="/images/github-social.svg"
                  alt="user icon"
                  width={24}
                  height={24}
                />
              </a>
            ) : (
              <Image
                src="/images/github-social.svg"
                alt="user icon"
                width={24}
                height={24}
              />
            )}
            {userData.linkedin !== "" ? (
              <a target="_blank" href={userData.linkedin}>
                <Image
                  src="/images/linkedin-social.svg"
                  alt="user icon"
                  width={24}
                  height={24}
                />
              </a>
            ) : (
              <Image
                src="/images/linkedin-social.svg"
                alt="user icon"
                width={24}
                height={24}
              />
            )}
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
                {userData.website}
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
                {userData.location}
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
            ) : publications && publications.length > 0 ? (
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
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
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

export default OtherUserFollow;
