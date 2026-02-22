"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { MetadataAttributeType, account } from "@lens-protocol/metadata";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { uri } from "@lens-protocol/client";
import { toast } from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { getLensClient } from "@/client";
import getLensAccountData from "@/utils/getLensProfile";
import { fetchAccount, setAccountMetadata } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useWalletClient } from "wagmi";
import { useSelector } from "react-redux";
import FormInput from "@/components/onboarding/form-input";
import FormTextarea from "@/components/onboarding/form-textarea";
import { Camera, ChevronDown } from "lucide-react";
import {
  uploadFileToLensStorage,
  uploadMetadataToLensStorage,
  storageClient,
} from "@/utils/storage-client";
import type { RootState } from "@/redux/store";

const COUNTRY_NAMES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand",
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const Settings = () => {
  const { data: authenticatedUser, loading: authenticatedUserLoading } = useAuthenticatedUser();
  const { data: walletClient } = useWalletClient();
  const profile = useSelector((state: RootState) => state.app.user);

  const coverUploadInputRef = useRef<HTMLInputElement>(null);
  const photoUploadInputRef = useRef<HTMLInputElement>(null);
  const pendingCoverPreviewRef = useRef<string | null>(null);
  const pendingPhotoPreviewRef = useRef<string | null>(null);
  const locationDropdownRef = useRef<HTMLDivElement | null>(null);

  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [pendingCoverPreview, setPendingCoverPreview] = useState("");
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState("");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

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

  const countryOptions = useMemo(
    () => [...COUNTRY_NAMES].sort((a, b) => a.localeCompare(b)).map(name => ({ value: name, label: name })),
    []
  );

  const resolveDisplayMediaUrl = (value: string) => {
    if (!value) return "";
    if (value.startsWith("lens://")) {
      return storageClient.resolve(value);
    }
    return value;
  };

  const normalizeUri = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return trimmed;

    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      return trimmed;
    }

    const ipfsPathMatch = trimmed.match(/^\/?ipfs\/(.+)$/i);
    if (ipfsPathMatch?.[1]) {
      return `ipfs://${ipfsPathMatch[1]}`;
    }

    if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[1-9A-HJ-NP-Za-km-z]+)$/i.test(trimmed)) {
      return `ipfs://${trimmed}`;
    }

    return trimmed;
  };

  const accountDataToFormState = (accountData: ReturnType<typeof getLensAccountData>) => ({
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
  });

  useEffect(() => {
    return () => {
      if (pendingCoverPreviewRef.current) {
        URL.revokeObjectURL(pendingCoverPreviewRef.current);
      }
      if (pendingPhotoPreviewRef.current) {
        URL.revokeObjectURL(pendingPhotoPreviewRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadSettingsProfile = async () => {
      if (authenticatedUserLoading) {
        return;
      }

      const hasProfileFallback =
        Boolean(profile?.address) || Boolean(profile?.displayName) || Boolean(profile?.handle);

      try {
        const client = await getLensClient();
        if (!active) return;

        // Hydrate from the active Lens account first (Redux), then fallback to session address.
        // This prevents blank settings when authenticatedUser.address is a wallet/manager address.
        let account = null;

        if (profile?.address) {
          account = await fetchAccount(client, {
            address: profile.address,
          }).unwrapOr(null);
        }

        if (!account && authenticatedUser?.address) {
          account = await fetchAccount(client, {
            address: authenticatedUser.address,
          }).unwrapOr(null);
        }

        if (!active) return;

        if (account) {
          const accountData = getLensAccountData(account);
          setFormState(accountDataToFormState(accountData));
        } else if (profile) {
          // Soft fallback so users still see their current saved session profile data.
          setFormState({
            name: profile.displayName || "",
            picture: profile.picture || "",
            cover: profile.coverPicture || "",
            jobTitle: profile.attributes?.["job title"] || "",
            bio: profile.bio || "",
            X: profile.attributes?.x || "",
            github: profile.attributes?.github || "",
            linkedin: profile.attributes?.linkedin || "",
            website: profile.attributes?.website || "",
            location: profile.attributes?.location || "",
          });
        } else if (!authenticatedUser && !hasProfileFallback) {
          // Keep settings page open (do not force redirect) even when session is not yet available.
          // Saving will still require an authenticated session.
          setFormState({
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
        }

        setPendingCoverFile(null);
        setPendingPhotoFile(null);
        setPendingCoverPreview("");
        setPendingPhotoPreview("");
      } catch (error) {
        console.error("Failed to load account settings profile:", error);
      } finally {
        if (active) {
          setSettingsLoaded(true);
        }
      }
    };

    void loadSettingsProfile();

    return () => {
      active = false;
    };
  }, [authenticatedUser, authenticatedUserLoading, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (pendingCoverPreviewRef.current) {
        URL.revokeObjectURL(pendingCoverPreviewRef.current);
      }
      const previewUrl = URL.createObjectURL(file);
      pendingCoverPreviewRef.current = previewUrl;
      setPendingCoverPreview(previewUrl);
      setPendingCoverFile(file);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (pendingPhotoPreviewRef.current) {
        URL.revokeObjectURL(pendingPhotoPreviewRef.current);
      }
      const previewUrl = URL.createObjectURL(file);
      pendingPhotoPreviewRef.current = previewUrl;
      setPendingPhotoPreview(previewUrl);
      setPendingPhotoFile(file);
    }
  };

  const handleSubmit = async () => {
    const sessionClient = await getLensClient();

    if (!sessionClient.isSessionClient()) {
      toast.error("Please login again to update your profile.");
      return;
    }

    if (!walletClient) {
      toast.error("Wallet not ready. Please reconnect and try again.");
      return;
    }

    setSavingData(true);

    try {
      let coverUri = formState.cover;
      let pictureUri = formState.picture;

      if (pendingCoverFile) {
        coverUri = await uploadFileToLensStorage(pendingCoverFile);
      }

      if (pendingPhotoFile) {
        pictureUri = await uploadFileToLensStorage(pendingPhotoFile);
      }

      const attributesMap: {
        key: string;
        value: string;
        type: MetadataAttributeType.STRING;
      }[] = [
        { key: "location", value: formState.location, type: MetadataAttributeType.STRING },
        { key: "website", value: formState.website, type: MetadataAttributeType.STRING },
        { key: "job title", value: formState.jobTitle, type: MetadataAttributeType.STRING },
        { key: "x", value: formState.X.trim(), type: MetadataAttributeType.STRING },
        { key: "linkedin", value: formState.linkedin.trim(), type: MetadataAttributeType.STRING },
        { key: "github", value: formState.github.trim(), type: MetadataAttributeType.STRING },
      ];

      const attributes = attributesMap.filter(attribute => attribute.value !== "");

      const metadata = account({
        name: formState.name !== "" ? formState.name : undefined,
        bio: formState.bio !== "" ? formState.bio : undefined,
        picture: pictureUri !== "" ? pictureUri : undefined,
        coverPicture: coverUri !== "" ? coverUri : undefined,
        attributes: attributes.length !== 0 ? attributes : undefined,
      });

      const metadataUriValue = await uploadMetadataToLensStorage(metadata);

      const result = await setAccountMetadata(sessionClient, {
        metadataUri: uri(normalizeUri(metadataUriValue)),
      }).andThen(handleOperationWith(walletClient));

      if (result.isErr()) {
        toast.error(result.error.message);
        return;
      }

      setFormState(prev => ({
        ...prev,
        cover: coverUri,
        picture: pictureUri,
      }));

      setPendingCoverFile(null);
      setPendingPhotoFile(null);
      setPendingCoverPreview("");
      setPendingPhotoPreview("");

      if (pendingCoverPreviewRef.current) {
        URL.revokeObjectURL(pendingCoverPreviewRef.current);
        pendingCoverPreviewRef.current = null;
      }
      if (pendingPhotoPreviewRef.current) {
        URL.revokeObjectURL(pendingPhotoPreviewRef.current);
        pendingPhotoPreviewRef.current = null;
      }

      toast.success("Profile updated");
    } catch (error: any) {
      const msg = error?.message || "Failed to update profile. Please try again.";
      toast.error(msg);
      console.error("Failed to update profile settings:", error);
    } finally {
      setSavingData(false);
    }
  };

  if (!settingsLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Oval
          visible={true}
          height="32"
          width="32"
          color="#2D2D2D"
          secondaryColor="#a2a2a3"
          strokeWidth={8}
          ariaLabel="settings-loading"
        />
      </div>
    );
  }

  return (
    <div className="px-[156px] profile-sm:px-[80px] lg:px-[20px] sm:px-[16px] pt-[110px] sm:pt-[122px] bg-white sm:w-full pb-10">
      <div className="relative w-full rounded-xl pb-16 border-[0.5px] border-[#C3C7CE]">
        <div className="w-full sm:h-[226] aspect-[1344/201] relative sm:rounded-none rounded-t-[12px] overflow-hidden bg-[#C0E0E7]">
          {(pendingCoverPreview || formState.cover) ? (
            <Image
              src={pendingCoverPreview || resolveDisplayMediaUrl(formState.cover)}
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
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            Change Cover
          </button>
        </div>

        <div className="absolute left-6 sm:left-4 bottom-5 sm:-bottom-[68px] w-[154px] h-[154px] sm:w-[135px] sm:h-[135px] rounded-full border-[3px] border-white z-20">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={
                pendingPhotoPreview ||
                resolveDisplayMediaUrl(formState.picture) ||
                "https://static.hey.xyz/images/default.png"
              }
              fill
              className="rounded-full object-cover"
              alt="Profile"
            />
          </div>

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
            className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-white border border-[#D1D5DB] flex items-center justify-center hover:bg-[#F3F4F6] shadow-sm"
            aria-label="Change profile picture"
          >
            <Camera size={16} className="text-[#212121]" />
          </button>
        </div>
      </div>

      <div style={{ boxShadow: "0px 4px 30px 0px #0000000A" }} className="flex flex-col max-w-[823px] mx-auto sm:p-4 p-8 bg-white sm:w-full space-y-4 rounded-2xl sm:my-16 my-5">
        <FormInput
          label="Name"
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Add Your Name"
        />

        <FormInput
          label="Job Title / Industry"
          name="jobTitle"
          value={formState.jobTitle}
          onChange={handleChange}
          placeholder="Add your job title"
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

        <div ref={locationDropdownRef} className="relative">
          <label className="mb-2 block xs:text-[14px] text-sm font-medium text-[#212121]">
            Location
          </label>
          <button
            type="button"
            className="w-full xs:rounded-[8px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-left text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:outline-none flex items-center justify-between"
            onClick={() => setIsLocationDropdownOpen(prev => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isLocationDropdownOpen}
          >
            <span className={formState.location ? "text-gray-900" : "text-[#9CA3AF]"}>
              {formState.location || "Add your location"}
            </span>
            <ChevronDown size={16} className="text-[#707070]" />
          </button>

          {isLocationDropdownOpen ? (
            <div className="absolute top-full left-0 right-0 z-30 mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-md">
              {countryOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    formState.location === option.value ? "bg-gray-50 text-[#212121]" : "text-[#4B5563]"
                  }`}
                  onClick={() => {
                    setFormState(prev => ({ ...prev, location: option.value }));
                    setIsLocationDropdownOpen(false);
                  }}
                  role="option"
                  aria-selected={formState.location === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <FormInput
          label="Add Links"
          name="website"
          value={formState.website}
          onChange={handleChange}
          placeholder="Add your Website"
          type="url"
          autoComplete="new-password"
          startContent={
            <Image src="/images/setting-link.svg" alt="Website" width={16} height={16} />
          }
        />

        <FormInput
          name="X"
          value={formState.X}
          onChange={handleChange}
          placeholder="Add your X URL"
          type="url"
          autoComplete="new-password"
          startContent={
            <Image src="/images/setting-x.svg" alt="X" width={16} height={16} />
          }
        />

        <FormInput
          name="linkedin"
          value={formState.linkedin}
          onChange={handleChange}
          placeholder="Add your LinkedIn URL"
          type="url"
          autoComplete="new-password"
          startContent={
            <Image src="/images/setting-linkedin.svg" alt="LinkedIn" width={20} height={16} />
          }
        />

        <FormInput
          name="github"
          value={formState.github}
          onChange={handleChange}
          placeholder="Add your Github URL"
          type="url"
          autoComplete="new-password"
          startContent={
            <Image src="/images/setting-github.svg" alt="Github" width={20} height={10} />
          }
        />

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
              className="rounded-full px-4 py-2 text-sm font-medium text-white transition-all max-w-fit sm:text-base bg-[#212121] hover:bg-gray-800 cursor-pointer"
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
