"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import JobCard from "@/components/Cards/JobCard";
import { toast } from "react-hot-toast";
import ViewJobModal from "../../../views/view-job-modal/view-job-modal";
import getLensProfileData from "@/utils/getLensProfile";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSearchParams } from "next/navigation";
import ProfileSkeleton from "@/components/reusable/profileSkeleton";
import { useRouter } from "next/router";
import ProfileModal from "@/views/profile/profileModal";
import CreatePostModal from "@/views/profile/CreatePostModal";
import { useSelector } from "react-redux";
import { useAccount, useFollowers, useFollowing, usePosts } from "@lens-protocol/react";
import getLensAccountData from "@/utils/getLensProfile";
import { get_score } from "@/api";
import { getLensClient, getPublicClient } from "@/client";
import { evmAddress } from "@lens-protocol/client";
import { follow, unfollow, fetchAccountStats } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useWalletClient } from "wagmi";
import { PlusIcon } from "lucide-react"
import FindWorkJobCard from "@/components/Cards/FindWorkJobCard";

function getDomain(url: string) {
  return url.replace(/https?:\/\//, "").replace(/\/$/, "");
}

type PageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export default function Profile({ params }: PageProps) {
  const { user: myProfile } = useSelector((state: any) => state.app);
  const { data: walletClient } = useWalletClient();
  const resolvedParams = use(params);
  const { handle: userId } = resolvedParams;
  const { data: profile, loading: profileLoading, error: profileError } = useAccount({
    username: { localName: userId },
  });

  console.log('Profile Page Debug:', { userId, profile, profileLoading, profileError });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileFollowed, setIsProfileFollowed] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  // Add Apps filter later
  const { data: publications, loading: publicationsLoading } = usePosts({
    filter: { metadata: { tags: { all: ["w3rk"] } }, authors: [profile?.address] },
  });
  const [cardType, setCardType] = useState("job");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [userData, setUserData] = useState<any>({
    displayName: "Ahmad ",
    handle: "@lenshandle.lens",
    cover: "/images/cover.png",
    picture: "/images/profile.jpg",
    following: 100,
    followers: 75,
    about:
      "User information can go here along with service offered information, total character limit will have to be decided bc we don’t wanna run over the limit. User information can go here along with service offered information, total character limit will have to be decided bc we don’t wanna run over the limit.",
    location: "Sans Fransisco, USA",
    website: "www.elodiemohrdesign.com",
    X: "www.elodiemohrdesign.com",
    github: "www.elodiemohrdesign.com",
    linkedin: "www.elodiemohrdesign.com",
    jobTitle: "Web Developer and Digital UI/UX Designer",
  });
  const [selectedPublication, setSelectedPublication] = useState<any>();
  const [dummyJobs, setDummyJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/find-work.json")
      .then(res => res.json())
      .then(data => setDummyJobs(data))
      .catch(err => console.error("Error loading dummy jobs:", err));
  }, []);

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

  const handleFollow = async () => {
    const sessionClient = await getLensClient();
    if (profile && sessionClient.isSessionClient()) {
      console.log('Profile: ', profile)
      switch (profile.operations?.canFollow.__typename) {
        case "AccountFollowOperationValidationPassed":
          // Follow is allowed
          console.log("Yes you can follow the user");

          const result = await follow(sessionClient, {
            account: evmAddress(profile.address),
          }).andThen(handleOperationWith(walletClient));

          if (result.isErr()) {
            // handle failure scenarios
            toast.error("couldn't follow user, try again later");
            setIsProfileFollowed(false)
            return;
          }

          toast.success("Followed successfully");
          setIsProfileFollowed(true)
          break;

        case "AccountFollowOperationValidationFailed":
          // Following is not possible
          console.log(profile.operations.canFollow.reason);
          toast.error(profile.operations.canFollow.reason);
          break;

        case "AccountFollowOperationValidationUnknown":
          // Validation outcome is unknown
          break;
      }
    } else if (!sessionClient.isSessionClient()) {
      toast.error("You need to login to follow");
    }
  };

  const getData = async () => {
    // if (profile && session) {
    if (profile) {
      console.log('Profile: ', profile)
      const profileData = getLensAccountData(profile);
      console.log('Profile Data: ', profileData)

      // Check if profileData and myProfile exist before accessing userLink
      if (profileData && myProfile && profileData.userLink && myProfile.userLink) {
        if (profileData.userLink === myProfile.userLink) setIsMyProfile(true);
      }

      const client = getPublicClient();
      const stats = await fetchAccountStats(client, { account: evmAddress(profile.address) });
      var followers = 0;
      var following = 0;
      if (stats.isOk()) {
        followers = stats.value ? stats.value.graphFollowStats.followers : 0;
        following = stats.value ? stats.value.graphFollowStats.following : 0;
      }
      setIsProfileFollowed(profile.operations?.isFollowedByMe ? true : false)

      const handle = {
        displayName: profileData.displayName,
        handle: profileData.handle,
        cover: profileData.coverPicture,
        picture: profileData.picture !== "" ? profileData.picture : "/images/paco-square.svg",
        following: following,
        jobTitle: profileData.attributes["job title"] ? profileData.attributes["job title"] : "",
        followers: followers,
        about: profileData.bio ? profileData.bio : userData.about,
        website: profileData.attributes.website ? profileData.attributes.website : "",
        location: profileData.attributes.location ? profileData.attributes.location : "",
        X: profileData.attributes.x ? profileData.attributes.x : "",
        github: profileData.attributes.github ? profileData.attributes.github : "",
        linkedin: profileData.attributes.linkedin ? profileData.attributes.linkedin : "",
      };
      // setUserData(handle);

      // Get score, but don't block page render if it fails
      try {
        const user_score = await get_score(profile.address);
        setScore(user_score);
      } catch (error) {
        console.error("Failed to fetch user score:", error);
        setScore(0); // Default score
      }
      setDataLoading(false);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, profile]);
  // }, [profileLoading, sessionLoading]);

  const handleImageError = () => {
    var data = { ...userData };
    data.picture = profile
      ? 'https://static.hey.xyz/images/default.png'
      : "/images/paco-square.svg";
    setUserData(data);
  };

  useEffect(() => {
    if (publications) {
      setData([...publications.items]);
      setLoading(false);
    }
  }, [publications]);

  if (profileError) {
    return (
      <div className="px-[156px] profile-md:px-[80px] profile-sm:px-[20px] sm:px-[16px] pt-[110px] sm:pt-[122px] sm:w-full mb-[40px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The profile &quot;{userId}&quot; could not be found.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return dataLoading ? (
    <ProfileSkeleton />
  ) : (
    <div className="bg-wmin-h-screen">
      <div className="px-[156px] profile-md:px-[80px] profile-sm:px-[20px] sm:px-[16px]  pt-[90px] sm:pt-[122px] sm:w-full mb-[40px]">
        <div className="absolute w-full mx-0 left-0 top-156px sm:top-[60px] px-[156px] profile-sm:px-[20px] profile-md:px-[80px] sm:px-[0px] -z-40">
          <div
            className=" bg-white w-full h-[196px] sm:h-[110px] rounded-[6px] sm:rounded-none z-[1000] relative"
            style={{ backgroundImage: `url(${userData.cover})` }}
          ></div>
        </div>
        <div className="flex lg:flex-col lg:w-full gap-[30px] pt-[36px] bg-white sm:pt-0 px-[32px] sm:px-[0px]">
          <div className="max-w-[350px] min-w-[350px] sm:w-full">
            <div className="w-[160px] h-[160px] sm:w-[135px] sm:h-[135px] relative mb-[16px] sm:ml-[16px]">
              <Image
                src={userData.picture}
                fill
                className="rounded-full"
                alt="user icon"
                onError={handleImageError}
              />
            </div>
            {userData.displayName !== "" && (
              <div className="flex items-center gap-2">
                <h3 className="leading-[19px] text-[24px] font-medium mb-[1px] sm:mb-[0px]">
                  {userData.displayName}
                </h3>
                <Link
                  href={"/settings"}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.24141 16.8751H3.75C3.58424 16.8751 3.42527 16.8093 3.30806 16.692C3.19085 16.5748 3.125 16.4159 3.125 16.2501V12.7587C3.12508 12.5932 3.19082 12.4344 3.30781 12.3173L12.9422 2.68291C13.0594 2.56579 13.2183 2.5 13.384 2.5C13.5497 2.5 13.7086 2.56579 13.8258 2.68291L17.3172 6.17198C17.4343 6.28917 17.5001 6.44808 17.5001 6.61377C17.5001 6.77946 17.4343 6.93837 17.3172 7.05557L7.68281 16.6923C7.56569 16.8093 7.40695 16.875 7.24141 16.8751Z" stroke="#212121" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M10.625 5L15 9.375" stroke="#212121" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </Link>
              </div>
            )}
            <span className="text-[#707070] leading-[16.94px] text-[14px] font-medium mb-[12px] sm:mb-[20px]">
              {userData.handle}
            </span>
            {userData.jobTitle !== "" && (
              <h3 className="leading-[19px] text-[16px] sm:text-[14px] font-medium mt-[10px] mb-[12px] sm:mt-[6px]">
                {userData.jobTitle}
              </h3>
            )}
            <p
              className={`leading-[16.94px] text-[14px] sm:text-[12px] font-medium text-[#707070] mb-[16px] ${userData.jobTitle === "" ? "mt-[10px]" : ""
                } `}
            >
              {userData.about}
            </p>

            <div className="flex  gap-[13px] mb-[16px]">

              <div className="flex gap-2">
                <span className="leading-[16.94px] text-[14px] sm:text-[12px] font-medium text-[black]">
                  {userData.followers}
                </span>
                <span className="leading-[16.94px] text-[14px] sm:text-[12px] font-medium text-[#707070]">
                  Followers
                </span>
              </div>
              <div className="flex gap-2">
                <span className="leading-[16.94px] text-[14px] sm:text-[12px] font-medium text-[black]">
                  {userData.following}
                </span>
                <span className="leading-[16.94px] text-[14px] sm:text-[12px] font-medium text-[#707070]">
                  Following
                </span>
              </div>
            </div>
            {isMyProfile ? (
              <></>
              // <Link
              //   href={"/settings"}
              //   className="rounded-[8px] bg-[#E4E4E7] text-black px-[16px] py-[7px] mb-[16px] text-[14px] inline-block text-center"
              // >
              //   Edit Profile
              // </Link>
            ) : (
              <div className="flex gap-[16px] mb-[16px]">
                {isProfileFollowed ? (
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
                <Link
                  href={`/messages?handle=${userData.handle}`}
                  className="rounded-[8px] bg-[#E4E4E7] text-black px-[16px] py-[6px] text-[14px] leading-[24px] inline-block text-center"
                >
                  Message
                </Link>
              </div>
            )}
            <hr className="bg-[#E4E4E7] h-[1px] mb-[16px]" />
            <div className="flex gap-[12px] mb-[19px] block sm:hidden">
              {userData.X !== "" && (
                <Link target="_blank" href={userData.X}>
                  <Image src="/images/twitter-social.svg" alt="user icon" width={24} height={24} className="sm:w-[16px] sm:h-[16px]" />
                </Link>
              )}
              {userData.github !== "" && (
                <Link target="_blank" href={userData.github}>
                  <Image src="/images/github-social.svg" alt="user icon" width={24} height={24} className="sm:w-[16px] sm:h-[16px]" />
                </Link>
              )}
              {userData.linkedin !== "" && (
                <Link target="_blank" href={userData.linkedin}>
                  <Image src="/images/linkedin-social.svg" alt="user icon" width={24} height={24} className="sm:w-[16px] sm:h-[16px]" />
                </Link>
              )}
            </div>
            <div className="flex flex-col gap-[16px] mb-[20px] sm:mb-[0px]">
              <div className="flex justify-between items-center">
                {userData.website !== "" && (
                  <Link href={userData.website} target="_blank">
                    <div className="flex gap-[11.6px] items-center">
                      <Image src="/images/earth.svg" alt="earth icon" width={24} height={24} className="sm:w-[16px] sm:h-[16px]" />
                      <span className="leading-[16.94px] text-[14px] sm:text-[12px] font-medium text-[black]">
                        {getDomain(userData.website)}
                      </span>
                    </div>
                  </Link>
                )}
                <div className="sm:flex gap-[12px] hidden">
                  {userData.X !== "" && (
                    <Link target="_blank" href={userData.X}>
                      <Image src="/images/twitter-social.svg" alt="user icon" width={24} height={24} className="sm:w-[16px] sm:h-[16px]" />
                    </Link>
                  )}
                  {userData.github !== "" && (
                    <Link target="_blank" href={userData.github}>
                      <Image src="/images/github-social.svg" alt="user icon" width={24} height={24} className="sm:w-[16px] sm:h-[16px]" />
                    </Link>
                  )}
                  {userData.linkedin !== "" && (
                    <Link target="_blank" href={userData.linkedin}>
                      <Image src="/images/linkedin-social.svg" alt="user icon" width={24} height={24} className="sm:w-[16px] sm:h-[16px]" />
                    </Link>
                  )}
                </div>
              </div>

              {userData.location !== "" && (
                <div className="flex gap-[14.2px] items-center pl-[3.2px]">
                  <Image src="/images/location.svg" alt="earth icon" width={18.33} height={24} className="sm:w-[16px] sm:h-[16px]" />
                  <span className="leading-[16.94px] text-[14px] sm:text-[12px] font-medium text-[black]">
                    {userData.location}
                  </span>
                </div>
              )}
              <div className="flex gap-[12.7px] items-center">
                <Image src="/images/w.svg" alt="earth icon" width={24} height={15.3} className="sm:w-[16px] sm:h-[16px]" />
                <span className="leading-[16.94px] text-[14px] sm:text-[12px] font-medium text-[black]">
                  {score}
                </span>
              </div>
            </div>
          </div>
          <hr className="bg-[#E4E4E7] h-[1px] mb-[0px] hidden lg:block" />
          <div className="sm:pt-0 pt-[196px] flex-1">
            <div className="flex sm:flex-col-reverse sm:gap-[16px] justify-between sm:justify-start mb-[16px] align-middle">
              <button className="leading-[19.36px] text-[20px] font-semibold text-[black] sm:w-fit">
                All Posts
              </button>
              <div className="flex gap-[12px] sm:gap-[15px] sm:justify-between">
                <button
                  className="rounded-full bg-[#212121] flex justify-center items-center gap-1 text-white px-[16px] py-[8px] text-[14px] sm:flex-1"
                  onClick={handleOpenJobModal}
                >
                  <PlusIcon className="w-5 h-5 mr-2" /> Create Post
                </button>
              </div>
              {isMyProfile && (
                <></>
              )}
            </div>
            <div
              className={`flex flex-col gap-[16px] sm:mb-[14px] ${publications && data.length > 0 ? "" : "min-h-[430px]"
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
                        type={attributes["post type"] ? attributes["post type"] : "job"}
                        publication={publication}
                      />
                    );
                  }
                })
              ) : (
                <div className="flex flex-col">
                  {dummyJobs.map((job, index) => (
                    <FindWorkJobCard
                      key={index}
                      job={job}
                      isLast={index === dummyJobs.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {
          isJobModalOpen && (
            <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
              <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
                <CreatePostModal
                  handleCloseModal={handleCloseJobModal}
                  handle={userData.handle}
                />
              </div>
            </div>
          )
        }
        {
          isModalOpen && (
            <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
              <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
                <ViewJobModal
                  handleCloseModal={handleCloseModal}
                  type={cardType}
                  publication={selectedPublication}
                />
              </div>
            </div>
          )
        }
      </div>
    </div >
  );
}
