"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { uploadFileToIPFS, uploadJsonToIPFS } from "@/utils/uploadToIPFS";
import {
  useSetProfileMetadata,
  useSession,
  SessionType,
  Profile,
} from "@lens-protocol/react-web";
import { MetadataAttributeType, profile } from "@lens-protocol/metadata";
import { toast } from "react-hot-toast";
import getLensProfileData from "@/utils/getLensProfile";

const Settings = () => {
  const { execute: update, error, loading } = useSetProfileMetadata();
  const { data: session, loading: sessionLoading } = useSession();
  const [backgroundImage, setBackgroundImage] = useState<any>(null);
  const [photo, setPhoto] = useState<any>(null);
  const [formState, setFormState] = useState({
    name: "",
    picture: "",
    cover: "",
    jobTitle: "",
    bio: "",
    X: "",
    github: "",
    linkedin: "",
    website: "",
    location: "",
  });

  useEffect(() => {
    console.log("running this");
    if (
      session?.type === SessionType.WithProfile &&
      session.profile?.metadata
    ) {
      const profile = session.profile;
      const profileData = getLensProfileData(profile);

      const handle = {
        name: profileData.displayName,
        picture: profileData.picture,
        cover: profileData.coverPicture,
        jobTitle: profileData.attributes["job title"]
          ? profileData.attributes["job title"]
          : "",
        bio: profileData.bio,
        X: profileData.attributes.X ? profileData.attributes.X : "",
        github: profileData.attributes.github
          ? profileData.attributes.github
          : "",
        linkedin: profileData.attributes.linkedin
          ? profileData.attributes.linkedin
          : "",
        website: profileData.attributes.website
          ? profileData.attributes.website
          : "",
        location: profileData.attributes.location
          ? profileData.attributes.location
          : "",
      };
      setBackgroundImage(handle.cover);
      setPhoto(handle.picture);
      setFormState(handle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.type]);

  // Generic change handler for all inputs
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCoverUpload = async (event: any) => {
    const file = event.target.files[0];
    const cover = event.target.files;
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(imageUrl);
      const coverLink = await uploadFileToIPFS(cover);
      setFormState((prevState) => ({
        ...prevState,
        ["cover"]: coverLink,
      }));
    }
  };

  const handlePhotoUpload = async (event: any) => {
    const file = event.target.files[0];
    const pic = event.target.files;
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
      const pictureLink = await uploadFileToIPFS(pic);
      setFormState((prevState) => ({
        ...prevState,
        ["picture"]: pictureLink,
      }));
    }
  };

  const handleSubmit = async () => {
    // console.log(formState)

    const attributesMap: {
      key: string;
      value: string;
      type: MetadataAttributeType.STRING;
    }[] = [
      {
        key: "location",
        value: formState.location,
        type: MetadataAttributeType.STRING,
      },
      {
        key: "website",
        value: formState.website,
        type: MetadataAttributeType.STRING,
      },
      {
        key: "job title",
        value: formState.jobTitle,
        type: MetadataAttributeType.STRING,
      },
      {
        key: "X",
        value: formState.X,
        type: MetadataAttributeType.STRING,
      },
      {
        key: "linkedin",
        value: formState.linkedin,
        type: MetadataAttributeType.STRING,
      },
      {
        key: "github",
        value: formState.github,
        type: MetadataAttributeType.STRING,
      },
    ];

    const attributes = attributesMap.filter(
      (attribute: {
        key: string;
        value: string;
        type: MetadataAttributeType.STRING;
      }) => attribute.value !== ""
    );

    console.log(attributes);

    const metadata = profile({
      name: formState.name !== "" ? formState.name : undefined,
      bio: formState.bio !== "" ? formState.bio : undefined,
      picture: formState.picture !== "" ? formState.picture : undefined,
      coverPicture: formState.cover !== "" ? formState.cover : undefined,
      attributes: attributes.length !== 0 ? attributes : undefined,
    });

    const metadataURI = await uploadJsonToIPFS(metadata);

    const result = await update({
      metadataURI,
    });

    if (result.isFailure()) {
      toast.error(result.error.message);
      return;
    }

    const completion = await result.value.waitForCompletion();

    if (completion.isFailure()) {
      toast.error(completion.error.message);
      return;
    }

    toast.success("Profile updated");
    console.log("Profile updated");
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
            name="name"
            onChange={handleChange}
            value={formState.name}
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Job Title
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Add your job title"
            name="jobTitle"
            onChange={handleChange}
            value={formState.jobTitle}
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px]">
          <div className="flex gap-[4px] items-center align-middle leading-[16.94px] text-[14px] font-medium">
            <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
              Bio
            </span>
            <span className="text-[#F71919]">max. 260 characters</span>
          </div>
          <textarea
            className="form-input rounded-[12px] p-[11px] h-[160px] border-[1px] border-[#E4E4E7] resize-none sm:w-full"
            placeholder="Add your bio"
            name="bio"
            onChange={handleChange}
            value={formState.bio}
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            X (Twitter)
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Link to profile"
            name="X"
            onChange={handleChange}
            value={formState.X}
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Github
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Link to profile"
            name="github"
            onChange={handleChange}
            value={formState.github}
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Linkedin
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Link to profile"
            name="linkedin"
            onChange={handleChange}
            value={formState.linkedin}
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Website
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Website URL"
            name="website"
            onChange={handleChange}
            value={formState.website}
          />
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Location
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Enter Location"
            name="location"
            onChange={handleChange}
            value={formState.location}
          />
        </div>
        <button
          className="mx-auto w-fit py-[4px] px-[24px] tx-[14px] leading-[24px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[36px]"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Settings;
