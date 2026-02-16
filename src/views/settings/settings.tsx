"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { fileToDataURI, jsonToDataURI } from "@/utils/dataUriHelpers";
import { MetadataAttributeType, account } from "@lens-protocol/metadata";
import { uri, useAccount } from "@lens-protocol/react";
import { toast } from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { getLensClient } from "@/client";
import getLensAccountData from "@/utils/getLensProfile";
import { fetchAccount, setAccountMetadata } from "@lens-protocol/client/actions";
import { useRouter } from "next/navigation";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useWalletClient } from "wagmi";
import FormInput from "@/components/onboarding/form-input";
import FormTextarea from "@/components/onboarding/form-textarea";
import FormSelect from "@/components/onboarding/form-select";
import { Camera } from "lucide-react";

const Settings = () => {
  const [userId, setUserId] = useState("");
  const { data: profile, loading: profileLoading } = useAccount({
    username: { localName: userId },
  });
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  const coverUploadInputRef = useRef<HTMLInputElement>(null);
  const photoUploadInputRef = useRef<HTMLInputElement>(null);
  const [savingData, setSavingData] = useState(false);
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

  const countryOptions = useMemo(() => {
    try {
      const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
      const supportedValuesOf = (Intl as any).supportedValuesOf;
      if (typeof supportedValuesOf !== "function") {
        return [
          { value: "United States", label: "United States" },
          { value: "United Kingdom", label: "United Kingdom" },
        ];
      }

      const countries = (supportedValuesOf("region") as string[])
        .filter(code => code.length === 2)
        .map(code => displayNames.of(code))
        .filter((name): name is string => Boolean(name) && name.toUpperCase() !== name)
        .sort((a, b) => a.localeCompare(b))
        .map(name => ({ value: name, label: name }));

      return countries;
    } catch {
      return [
        { value: "United States", label: "United States" },
        { value: "United Kingdom", label: "United Kingdom" },
      ];
    }
  }, []);

  async function getAuthenticatedAccount() {
    const client = await getLensClient();

    if (client.isSessionClient()) {
      if (userId === "") {
        const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
        if (!authenticatedUser) {
          return null;
        }

        const account = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(
          null
        );
        if (account) {
          setUserId(account.username?.localName ? account.username.localName : "");
        }
      }

      if (profile) {
        const accountData = getLensAccountData(profile);
        const handle = {
          name: accountData.displayName,
          picture: accountData.picture,
          cover: accountData.coverPicture,
          jobTitle: accountData.attributes["job title"] ? accountData.attributes["job title"] : "",
          bio: accountData.bio,
          X: accountData.attributes.x ? accountData.attributes.x : "",
          github: accountData.attributes.github ? accountData.attributes.github : "",
          linkedin: accountData.attributes.linkedin ? accountData.attributes.linkedin : "",
          website: accountData.attributes.website ? accountData.attributes.website : "",
          location: accountData.attributes.location ? accountData.attributes.location : "",
        };

        setFormState(handle);
      }
    } else {
      router.push("/");
    }
  }

  useEffect(() => {
    void getAuthenticatedAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, userId]);

  // Generic change handler for all inputs
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCoverUpload = async (event: any) => {
    const file = event.target.files[0];
    const cover = event.target.files;
    if (file) {
      const coverLink = await fileToDataURI(cover);
      setFormState(prevState => ({
        ...prevState,
        ["cover"]: coverLink,
      }));
    }
  };

  const handlePhotoUpload = async (event: any) => {
    const file = event.target.files[0];
    const pic = event.target.files;
    if (file) {
      const pictureLink = await fileToDataURI(pic);
      setFormState(prevState => ({
        ...prevState,
        ["picture"]: pictureLink,
      }));
    }
  };

  const handleSubmit = async () => {
    const sessionClient = await getLensClient();
    if (!sessionClient.isSessionClient()) return;
    setSavingData(true);

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
        key: "x",
        value: formState.X.trim(),
        type: MetadataAttributeType.STRING,
      },
      {
        key: "linkedin",
        value: formState.linkedin.trim(),
        type: MetadataAttributeType.STRING,
      },
      {
        key: "github",
        value: formState.github.trim(),
        type: MetadataAttributeType.STRING,
      },
    ];

    const attributes = attributesMap.filter(
      (attribute: { key: string; value: string; type: MetadataAttributeType.STRING }) =>
        attribute.value !== ""
    );

    type Attribute = {
      key: string;
      value: string | number;
      type: MetadataAttributeType;
    };

    function mergeAttributes(original: Attribute[], updates: Attribute[]): Attribute[] {
      const map = new Map<string, Attribute>();

      for (const attr of original) {
        map.set(attr.key, attr); // Use `key` instead of `trait_type`
      }

      for (const attr of updates) {
        map.set(attr.key, attr); // Updates will override same key
      }

      return Array.from(map.values());
    }

    const metadata = account({
      name: formState.name !== "" ? formState.name : undefined,
      bio: formState.bio !== "" ? formState.bio : undefined,
      picture: formState.picture !== "" ? formState.picture : undefined,
      coverPicture: formState.cover !== "" ? formState.cover : undefined,
      attributes: attributes.length !== 0 ? attributes : []
    });

    const metadataURI = await jsonToDataURI(metadata);

    const result = await setAccountMetadata(sessionClient, {
      metadataUri: uri(metadataURI),
    }).andThen(handleOperationWith(walletClient));

    if (result.isErr()) {
      toast.error(result.error.message);
      setSavingData(false);
      return;
    }

    toast.success("Profile updated");
    setSavingData(false);
  };

  return (
    <div className="px-[156px] profile-sm:px-[80px] lg:px-[20px] sm:px-[16px] pt-[110px] sm:pt-[122px] bg-white sm:w-full pb-10">
      {/* <div className="absolute w-full mx-0 left-0 top-156px sm:top-[79px] px-[156px] profile-sm:px-[80px] lg:px-[20px] sm:px-[16px] z-20 bg-white">
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
      </div> */}
      <div className="relative w-full rounded-xl pb-16 border-[0.5px] border-[#C3C7CE]">
                <div className="w-full sm:h-[226] aspect-[1344/201] relative sm:rounded-none rounded-t-[12px] overflow-hidden bg-[#C0E0E7]">
                  {formState.cover ? (
                      <Image
                        src={formState.cover}
                        fill
                        className="object-cover"
                        alt="Cover"
                        sizes="(max-width: 1344px) 100vw, 1344px"
                      />
                  ) : null}
                  <input
                    ref={coverUploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                  <button
                    type="button"
                    onClick={() => coverUploadInputRef.current?.click()}
                    className="absolute right-5 z-50 bottom-5 border border-[#212121] rounded-full bg-white px-4 py-2 text-sm flex items-center gap-1"
                  ><svg
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
                </svg> Change Cover</button>
                </div>
                <div className="absolute left-6 sm:left-4 bottom-5 sm:-bottom-[68px] w-[154px] h-[154px] sm:w-[135px] sm:h-[135px] rounded-full border-[3px] border-white overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src={formState.picture || "https://static.hey.xyz/images/default.png"}
                      fill
                      className="rounded-full object-cover"
                      alt="Profile"
                      // onError={handleImageError}
                    />
                    <input
                      ref={photoUploadInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <button
                      type="button"
                      onClick={() => photoUploadInputRef.current?.click()}
                      className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white border border-[#D1D5DB] flex items-center justify-center hover:bg-[#F3F4F6]"
                      aria-label="Change profile picture"
                    >
                      <Camera size={16} className="text-[#212121]" />
                    </button>
                  </div>
                </div>
              </div>
      <div style={{ boxShadow: '0px 4px 30px 0px #0000000A' }} className="flex flex-col max-w-[823px] mx-auto sm:p-4 p-8 bg-white sm:w-full space-y-4 rounded-2xl sm:my-16 my-5">
        <FormInput
          label="Name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Add Your Name"
          required
        />
        <FormInput
          label="Job Title / Industry"
          name="jobTitle"
          value={formState.jobTitle}
          onChange={handleChange}
          placeholder="Add your job title"
          required
        />
        <FormTextarea
            label="Bio"
            name="bio"
            value={formState.bio}
            onChange={handleChange}
            placeholder="Tell us a bit about yourself"
            maxLength={800}
            rows={5}
          />
          <FormSelect
            label="Location"
            name="location"
            value={formState.location}
            onChange={handleChange}
            placeholder="Add your location"
            required
            options={countryOptions}
          />
        <FormInput
        label="Add Website"
          name="website"
          value={formState.website}
          onChange={handleChange}
          placeholder="Add your Website"
          type="url"
          startContent={<Image
                            src="/images/setting-link.svg"
                            alt="Score"
                            width={16}
                            height={16}
                          />}
        />
        <FormInput
          name="X"
          value={formState.X}
          onChange={handleChange}
          placeholder="Add your X URL"
          type="url"
          startContent={<Image
                            src="/images/setting-x.svg"
                            alt="Score"
                            width={16}
                            height={16}
                          />}
        />
        <FormInput
          name="linkedin"
          value={formState.linkedin}
          onChange={handleChange}
          placeholder="Add your LinkedIn URL"
          type="url"
          startContent={<Image
                            src="/images/setting-linkedin.svg"
                            alt="Score"
                            width={20}
                            height={16}
                          />}
        />
        <FormInput
          name="github"
          value={formState.github}
          onChange={handleChange}
          placeholder="Add your Github URL"
          type="url"
          startContent={<Image
                            src="/images/setting-github.svg"
                            alt="Score"
                            width={20}
                            height={10}
                          />}
        />
        {/* <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            X (Twitter)
          </span>
          <div className="w-full flex">
            <div className="rounded-l-[12px] w-[142px] pl-[10px] bg-[#F2F2F2] border-[1px] border-[#E4E4E7] flex items-center text-[#707070] text-[14px] font-normal leading-[14.52px]">
              https://x.com/
            </div>
            <input
              className="link-input rounded-r-[12px] p-[11px] border-[1px] flex-1 border-[#E4E4E7] sm:w-full border-l-0"
              placeholder="Enter X Username"
              name="X"
              onChange={handleChange}
              value={formState.X}
            />
          </div>
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">Github</span>
          <div className="w-full flex">
            <div className="rounded-l-[12px] w-[142px] pl-[10px] bg-[#F2F2F2] border-[1px] border-[#E4E4E7] flex items-center text-[#707070] text-[14px] font-normal leading-[14.52px]">
              https://github.com/
            </div>
            <input
              className="link-input rounded-r-[12px] p-[11px] border-[1px] flex-1 border-[#E4E4E7] sm:w-full border-l-0"
              placeholder="Enter Github Username"
              name="github"
              onChange={handleChange}
              value={formState.github}
            />
          </div>
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">Linkedin</span>
          <div className="w-full flex">
            <div className="rounded-l-[12px] w-[142px] pl-[10px] bg-[#F2F2F2] border-[1px] border-[#E4E4E7] flex items-center text-[#707070] text-[14px] font-normal leading-[14.52px]">
              https://linkedin.com/
            </div>
            <input
              className="link-input rounded-r-[12px] p-[11px] border-[1px] flex-1 border-[#E4E4E7] sm:w-full border-l-0"
              placeholder="Enter LinkedIn Username"
              name="linkedin"
              onChange={handleChange}
              value={formState.linkedin}
            />
          </div>
        </div>
        <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">Website</span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Website URL"
            name="website"
            onChange={handleChange}
            value={formState.website}
          />
        </div> */}
        {/* <div className="flex flex-col gap-[5px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">Location</span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Enter Location"
            name="location"
            onChange={handleChange}
            value={formState.location}
          />
        </div> */}
        {savingData ? (
          <Oval
            visible={true}
            height="32"
            width="32"
            color="#2D2D2D"
            secondaryColor="#a2a2a3"
            strokeWidth={8}
            ariaLabel="oval-loading"
            wrapperClass="mx-auto mb-[36px]"
          />
        ) : (
          <div className="flex items-end justify-end border-t-[0.5px] border-[#C3C7CE] pt-8">

          <button
            // className="mx-auto w-fit py-[4px] px-[24px] tx-[14px] leading-[24px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[36px]"
            className={`rounded-full px-4 py-2 text-sm font-medium text-white transition-all max-w-fit sm:text-base
              ${
            'bg-[#212121] hover:bg-gray-800 cursor-pointer'
          }
          `}
            onClick={handleSubmit}
            >
            Save Changes
          </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
