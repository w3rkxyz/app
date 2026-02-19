"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useAccount as useLensAccount } from "@lens-protocol/react";
import { fetchPosts } from "@lens-protocol/client/actions";
import { PlusIcon } from "lucide-react";
import CreatePostModal from "@/views/profile/CreatePostModal";
import ProfilePostCard from "@/components/Cards/ProfilePostCard";
import getLensAccountData from "@/utils/getLensProfile";
import { client } from "@/client";

function getDomain(url: string) {
  return url.replace(/https?:\/\//, "").replace(/\/$/, "");
}

function toAbsoluteUrl(url: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function readAttributeMap(metadata: any): Record<string, string> {
  const map: Record<string, string> = {};
  const attributes = metadata?.attributes;
  if (!Array.isArray(attributes)) return map;

  attributes.forEach((attribute: any) => {
    if (attribute?.key && typeof attribute?.value === "string") {
      map[attribute.key] = attribute.value;
    }
  });

  return map;
}

type ProfilePost = {
  type: "job" | "service";
  title: string;
  description: string;
  tags: string[];
  paymentAmount: string;
};

function parseProfilePost(post: any): ProfilePost | null {
  const attributes = readAttributeMap(post?.metadata);
  const rawType = (attributes["post type"] || "").toLowerCase();
  const type: "job" | "service" = rawType === "service" ? "service" : "job";

  const title = attributes["title"] || "Untitled Post";
  const description = attributes["content"] || post?.metadata?.content || "";

  const paymentType = (attributes["payement type"] || attributes["payment type"] || "").toLowerCase();
  const hourly = attributes["hourly"];
  const fixed = attributes["fixed"];

  let paymentAmount = "";
  if (paymentType === "hourly" && hourly) {
    paymentAmount = `$${hourly}/hr`;
  } else if (fixed) {
    paymentAmount = `$${fixed}`;
  } else if (hourly) {
    paymentAmount = `$${hourly}/hr`;
  } else {
    paymentAmount = "$0";
  }

  const tags = Array.isArray(post?.metadata?.tags)
    ? post.metadata.tags.filter((tag: string) => !["w3rk", "job", "service"].includes(tag))
    : [];

  return {
    type,
    title,
    description,
    tags,
    paymentAmount,
  };
}

function getFollowCount(account: any, key: "followers" | "following") {
  return (
    account?.graphFollowStats?.[key] ??
    account?.graphsFollowStats?.[key] ??
    account?.stats?.[key] ??
    0
  );
}

export default function Profile() {
  const params = useParams<{ handle: string }>();
  const routeHandle = Array.isArray(params?.handle) ? params.handle[0] : params?.handle;
  const normalizedHandle = useMemo(
    () => decodeURIComponent(routeHandle || "").replace(/^@/, "").trim(),
    [routeHandle]
  );

  const { user: loggedInProfile } = useSelector((state: any) => state.app);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const {
    data: lensAccount,
    loading: profileLoading,
    error: profileError,
  } = useLensAccount({
    username: { localName: normalizedHandle },
  });

  const accountData = lensAccount ? getLensAccountData(lensAccount as any) : null;
  const isOwnProfile =
    Boolean(loggedInProfile?.userLink) &&
    loggedInProfile.userLink.toLowerCase() === normalizedHandle.toLowerCase();

  const handleOpenJobModal = () => setIsJobModalOpen(true);
  const handleCloseJobModal = () => setIsJobModalOpen(false);

  useEffect(() => {
    let active = true;

    async function loadProfilePosts() {
      if (!lensAccount?.address) {
        setProfilePosts([]);
        return;
      }

      setPostsLoading(true);

      try {
        const result = await fetchPosts(client, {
          filter: {
            authors: [lensAccount.address],
          },
        });

        if (!active) return;

        if (result.isErr()) {
          console.error("Failed to load posts:", result.error);
          setProfilePosts([]);
          return;
        }

        const posts = result.value?.items
          ?.map(parseProfilePost)
          .filter((post): post is ProfilePost => Boolean(post)) ?? [];

        setProfilePosts(posts);
      } catch (error) {
        if (!active) return;
        console.error("Failed to load posts:", error);
        setProfilePosts([]);
      } finally {
        if (active) {
          setPostsLoading(false);
        }
      }
    }

    void loadProfilePosts();

    return () => {
      active = false;
    };
  }, [lensAccount?.address]);

  const displayName = accountData?.displayName || normalizedHandle || "User";
  const handle = accountData?.handle || (normalizedHandle ? `@${normalizedHandle}` : "@user");
  const coverPicture = accountData?.coverPicture || "";
  const profilePicture = accountData?.picture || "https://static.hey.xyz/images/default.png";
  const about = accountData?.bio || "";
  const jobTitle = accountData?.attributes?.["job title"] || "";
  const website = accountData?.attributes?.website || "";
  const websiteUrl = toAbsoluteUrl(website);
  const location = accountData?.attributes?.location || "";
  const x = accountData?.attributes?.x || "";
  const github = accountData?.attributes?.github || "";
  const linkedin = accountData?.attributes?.linkedin || "";
  const followers = getFollowCount(lensAccount, "followers");
  const following = getFollowCount(lensAccount, "following");
  const score = 23694;
  const createPostHandle = loggedInProfile?.handle || handle;

  if (!normalizedHandle) {
    return (
      <div className="bg-white min-h-screen pt-[120px] px-[24px]">
        <p className="text-[16px] text-[#6C6C6C]">Invalid profile route.</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="bg-white min-h-screen pt-[120px] px-[24px]">
        <p className="text-[16px] text-[#6C6C6C]">Loading profile...</p>
      </div>
    );
  }

  if (profileError || !lensAccount || !accountData) {
    return (
      <div className="bg-white min-h-screen pt-[120px] px-[24px]">
        <p className="text-[16px] text-[#212121] font-semibold">Profile not found</p>
        <p className="text-[14px] text-[#6C6C6C] mt-[6px]">
          Could not load <span className="font-medium">@{normalizedHandle}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-[156px] profile-md:px-[80px] profile-sm:px-[20px] sm:p-[0px] sm:pt-[60px] pt-[90px] sm:w-full mb-[40px]">
        <div className="relative w-full">
          <div className="w-full sm:h-[226] aspect-[1344/201] relative sm:rounded-none rounded-t-[12px] overflow-hidden bg-[#C0E0E7]">
            {coverPicture ? (
              <Image
                src={coverPicture}
                fill
                className="object-cover"
                alt="Cover"
                sizes="(max-width: 1344px) 100vw, 1344px"
              />
            ) : null}
          </div>
          <div className="absolute left-6 sm:left-4 -bottom-20 sm:-bottom-[68px] w-[154px] h-[154px] sm:w-[135px] sm:h-[135px] rounded-full border-[3px] border-white overflow-hidden">
            <div className="relative w-full h-full">
              <Image src={profilePicture} fill className="rounded-full object-cover" alt="Profile" />
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col lg:w-full gap-[30px] pt-[90px] sm:pt-[68px] bg-white px-[32px] sm:px-[0px]">
          <div className="max-w-[350px] sm:max-w-full min-w-[350px] sm:min-w-0 sm:w-full sm:px-[16px]">
            <div className="flex items-center gap-2 mb-[4px]">
              <h1 className="text-[24px] font-bold text-[#212121] leading-[29px]">{displayName}</h1>
              {isOwnProfile ? (
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
              ) : null}
            </div>
            <span className="block text-[#6C6C6C] text-[14px] font-medium mb-[12px] leading-[20px]">
              {handle}
            </span>
            {jobTitle ? (
              <h2 className="text-[16px] font-semibold text-[#212121] mb-[12px] leading-[22px]">
                {jobTitle}
              </h2>
            ) : null}
            {about ? (
              <p className="text-[14px] text-[#6C6C6C] leading-[20px] mb-[16px]">{about}</p>
            ) : null}

            <div className="flex gap-[16px] my-[16px] sm:py-0 py-[16px]">
              <span className="leading-[20px]">
                <span className="font-semibold sm:text-[14px] text-[20px] text-[#212121]">
                  {followers}
                </span>
                <span className="font-medium sm:text-[12px] text-[16px] text-[#6C6C6C] ml-1">
                  Followers
                </span>
              </span>
              <span className=" leading-[20px]">
                <span className="font-semibold sm:text-[14px] text-[20px] text-[#212121]">
                  {following}
                </span>
                <span className="font-medium sm:text-[12px] text-[16px] text-[#6C6C6C] ml-1">
                  Following
                </span>
              </span>
            </div>
            <hr className="bg-[##8C8C8C33] h-[1px] mb-0" />

            <div className="flex gap-[12px] my-[16px]">
              {x ? (
                <Link target="_blank" href={toAbsoluteUrl(x)} className="text-[#6C6C6C] hover:text-[#212121]">
                  <Image src="/images/twitter-social.svg" alt="X" width={24} height={24} />
                </Link>
              ) : null}
              {github ? (
                <Link
                  target="_blank"
                  href={toAbsoluteUrl(github)}
                  className="text-[#6C6C6C] hover:text-[#212121]"
                >
                  <Image src="/images/github-social.svg" alt="GitHub" width={24} height={24} />
                </Link>
              ) : null}
              {linkedin ? (
                <Link
                  target="_blank"
                  href={toAbsoluteUrl(linkedin)}
                  className="text-[#6C6C6C] hover:text-[#212121]"
                >
                  <Image src="/images/linkedin-social.svg" alt="LinkedIn" width={24} height={24} />
                </Link>
              ) : null}
            </div>

            <div className="flex flex-col gap-[12px]">
              {website ? (
                <Link
                  href={websiteUrl}
                  target="_blank"
                  className="flex items-center gap-[12px] text-[#212121] hover:opacity-80"
                >
                  <Image src="/icons/globe.svg" alt="" width={20} height={20} />
                  <span className="text-[14px] font-medium">{getDomain(websiteUrl)}</span>
                </Link>
              ) : null}
              {location ? (
                <div className="flex items-center gap-[12px] text-[#212121]">
                  <Image src="/images/MapPin.svg" alt="" width={18} height={24} />
                  <span className="text-[14px] font-medium">{location}</span>
                </div>
              ) : null}
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
              {postsLoading ? (
                <p className="text-[14px] text-[#6C6C6C] py-[12px]">Loading posts...</p>
              ) : profilePosts.length === 0 ? (
                <p className="text-[14px] text-[#6C6C6C] py-[12px]">No posts yet.</p>
              ) : (
                profilePosts.map((post, index) => (
                  <ProfilePostCard
                    key={`${post.title}-${index}`}
                    profileImage={profilePicture}
                    displayName={displayName}
                    type={post.type}
                    title={post.title}
                    description={post.description}
                    tags={post.tags}
                    paymentAmount={post.paymentAmount}
                    isLast={index === profilePosts.length - 1}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {isJobModalOpen && (
          <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800/50 flex justify-center items-center sm:items-end cursor-auto">
            <div className="w-full flex justify-center items-center sm:items-end min-h-full sm:min-h-0">
              <CreatePostModal handleCloseModal={handleCloseJobModal} handle={createPostHandle} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
