"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import MyButton from "@/components/reusable/Button/Button";
import { article, MetadataAttributeType, textOnly } from "@lens-protocol/metadata";
import { uploadJsonToIPFS } from "@/utils/uploadToIPFS";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { useCreatePost, UseCreatePostArgs } from "@lens-protocol/react";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { useWalletClient } from "wagmi";

type Props = {
  handleCloseModal?: () => void;
  type: string;
  closeJobCardModal?: () => void;
  handle: string;
};

function removeAtSymbol(text: string) {
  return text.startsWith("@") ? text.slice(1) : text;
}

const categories = [
  {
    buttonText: "Blockchain Development",
    buttonStyles: "bg-[#FFC2C2] mb-[8px] sm:font-bold sm:text-[10px] sm:leading-[11px] sm:w-full",
  },
  {
    buttonText: "Programming & Development",
    buttonStyles: "bg-[#FFD8C2] mb-[8px] sm:font-bold sm:text-[10px] sm:leading-[11px] sm:w-full",
  },
  {
    buttonText: "Design",
    buttonStyles: "bg-[#FFF2C2] mb-[8px] w-[150px] sm:w-full",
  },
  {
    buttonText: "Marketing",
    buttonStyles: "bg-[#EFFFC2] mb-[8px] sm:w-full",
  },
  {
    buttonText: "Admin Support",
    buttonStyles: "bg-[#C2FFC5] mb-[8px] sm:w-full",
  },
  {
    buttonText: "Customer Service",
    buttonStyles: "bg-[#C2FFFF] mb-[8px] sm:w-full",
  },
  {
    buttonText: "Security & Auditing",
    buttonStyles: "bg-[#C2CCFF] mb-[8px] sm:w-full",
  },
  {
    buttonText: "Consulting & Advisory",
    buttonStyles: "bg-[#D9C2FF] mb-[8px] sm:w-full",
  },
  {
    buttonText: "Community Building",
    buttonStyles: "bg-[#FAC2FF] mb-[8px] sm:w-full",
  },
  {
    buttonText: "Other",
    buttonStyles: "bg-[#E4E4E7] mb-[0px] sm:w-full",
  },
];

const tagColors: any = {
  "Blockchain Development": "#FFC2C2",
  "Programming & Development": "#FFD8C2",
  Design: "#FFF2C2",
  Marketing: "#EFFFC2",
  "Admin Support": "#C2FFC5",
  "Customer Service": "#C2FFFF",
  "Security & Auditing": "#C2CCFF",
  "Consulting & Advisory": "#D9C2FF",
  "Community Building": "#FAC2FF",
  Other: "#E4E4E7",
};

const tokens = [
  { text: "Bitcoin (BTC)", image: "/images/btc.svg" },
  { text: "Ethereum (ETH)", image: "/images/eth.svg" },
  { text: "Tether (USDT)", image: "/images/usdt.svg" },
  { text: "BNB (BNB)", image: "/images/bnb.svg" },
  { text: "Solana (SOL)", image: "/images/solana.svg" },
  { text: "USDC (USDC)", image: "/images/usdc.svg" },
  { text: "Dai (DAI)", image: "/images/dai.svg" },
  { text: "GHO (GHO)", image: "/images/green-coin.svg" },
  { text: "Bonsai (BONSAI)", image: "/images/bw-coin.svg" },
];

function getTokenNamesByIndexes(indexes: number[]): string {
  return indexes
    .map(index => {
      const match = tokens[index].text.match(/\(([^)]+)\)/);
      return match ? match[1] : ""; // Return the token name if matched, otherwise return an empty string
    })
    .filter(name => name !== "")
    .join(", "); // Filter out any empty strings just in case
}

const ProfileModal = ({ handleCloseModal, closeJobCardModal, type, handle }: Props) => {
  const { data: walletClient } = useWalletClient();
  const { execute, loading, error } = useCreatePost({ handler: handleOperationWith(walletClient) });
  const myDivRef = useRef<HTMLDivElement>(null);
  const tagModalRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tokenModalRef = useRef<HTMLButtonElement>(null);
  const [showMobile, setShowMobile] = useState(false);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [showTokens, setShowTokens] = useState(false);
  const [payementType, setPayementType] = useState<"hourly" | "fixed">("hourly");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>(["", "", ""]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [fixedPrice, setFixedPrice] = useState("");
  const [savingData, setSavingData] = useState(false);

  const handleTagClick = (id: number) => {
    setSelectedTag(selectedTag === id ? null : id);
  };

  const canSubmitPost = () => {
    const payementAmount = payementType === "fixed" ? fixedPrice : hourlyRate;
    const tagSelected = tags[0] !== "" || tags[1] !== "" || tags[2] !== "";
    if (
      title !== "" &&
      description !== "" &&
      payementAmount !== "" &&
      selectedTokens.length !== 0 &&
      tagSelected
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleTagSelect = (id: number, tag: string) => {
    var temp = [...tags];
    categories.map((category, index) => {
      if (category.buttonText === temp[id]) {
        const updated = selectedCategories.filter(item => item !== index);
        setSelectedCategories(updated);
      }
    });
    temp[id] = temp[id] === tag ? "" : tag;
    setTags(temp);
  };

  const toggleTokensModal = () => {
    setShowTokens(!showTokens);
  };

  const onCLickCategory = (index: number, buttonIndex: number) => {
    // if (
    //   selectedCategories.includes(index) &&
    //   tags[buttonIndex] === categories[index].buttonText
    // ) {
    //   const updated = selectedCategories.filter((item) => item !== index);
    //   setSelectedCategories(updated);
    // } else {
    //   var current = [...selectedCategories];
    //   current.push(index);
    //   setSelectedCategories(current);
    // }

    // var newSelectedCategories: number[] = [];
    // categories.map((category, index) => {
    //   if (tags.includes(category.buttonText)) {
    //     newSelectedCategories.push(index);
    //   }
    // });
    // setSelectedCategories(newSelectedCategories);
    if (
      !selectedCategories.includes(index) &&
      !tags.includes(categories[index].buttonText) &&
      tags[buttonIndex] === ""
    ) {
      var current = [...selectedCategories];
      current.push(index);
      setSelectedCategories(current);
      handleTagSelect(buttonIndex, categories[index].buttonText);
    } else if (tags[buttonIndex] === categories[index].buttonText) {
      const updated = selectedCategories.filter(item => item !== index);
      setSelectedCategories(updated);
      handleTagSelect(buttonIndex, categories[index].buttonText);
    } else {
    }
  };

  const onCLickToken = (index: number) => {
    if (selectedTokens.includes(index)) {
      const updated = selectedTokens.filter(item => item !== index);
      setSelectedTokens(updated);
    } else {
      var current = [...selectedTokens];
      current.push(index);
      setSelectedTokens(current);
    }
  };

  useEffect(() => {
    setShowMobile(true);

    function handleClickOutside(event: MouseEvent) {
      if (myDivRef.current && !myDivRef.current.contains(event.target as Node)) {
        if (handleCloseModal) {
          handleCloseModal();
        } else if (closeJobCardModal) {
          closeJobCardModal();
        }
      } else if (tagModalRefs.current) {
        let clickedOutside = true;
        for (let i = 0; i < tagModalRefs.current.length; i++) {
          if (tagModalRefs.current[i]?.contains(event.target as Node)) {
            clickedOutside = false;
            break;
          }
        }
        if (clickedOutside) {
          setSelectedTag(null);
        }
      }

      if (tokenModalRef.current && !tokenModalRef.current.contains(event.target as Node)) {
        setShowTokens(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  const handlePost = async () => {
    setSavingData(true);
    var updatedTags = tags.filter(item => item !== "");
    updatedTags = [...updatedTags, type, "w3rk"];
    if (canSubmitPost()) {
      const publicContent = `${type === "job" ? "📢 Job Opportunity!" : "🛠 Ready for work!"} \n\n${
        type === "job"
          ? `Just posted a job on @w3rkxyz for a ${title}`
          : `Just listed my services on @w3rkxyz as a ${title}`
      }\n\nFor more details please visit www.w3rk.xyz/${removeAtSymbol(handle)}`;
      const heyMetadata = textOnly({
        content: publicContent,
        tags: updatedTags,
        attributes: [
          {
            key: "paid in",
            value: getTokenNamesByIndexes(selectedTokens),
            type: MetadataAttributeType.STRING,
          },
          {
            key: "payement type",
            value: payementType,
            type: MetadataAttributeType.STRING,
          },
          {
            key: payementType,
            value: payementType === "fixed" ? fixedPrice : hourlyRate,
            type: MetadataAttributeType.STRING,
          },
          {
            key: "post type",
            value: type,
            type: MetadataAttributeType.STRING,
          },
          {
            key: "title",
            value: title,
            type: MetadataAttributeType.STRING,
          },
          {
            key: "content",
            value: description,
            type: MetadataAttributeType.STRING,
          },
        ],
      });

      const heyMetadataURI = await uploadJsonToIPFS(heyMetadata);

      const heyResult = await execute({
        contentUri: heyMetadataURI,
      });

      if (heyResult.isErr()) {
        toast.error(heyResult.error.message);
        return;
      }

      // const heyCompletion = await heyResult.value.waitForCompletion()

      // if (heyCompletion.isFailure()) {
      //   toast.error(heyCompletion.error.message);
      //   return;
      // }
      setSavingData(false);

      handleCloseModal?.();
      type === "job" ? toast.success("Job Posted Succesfully!") : toast.success("Service Listed!");
    } else {
      toast.error("Fill all fields and select at least one tag!");
      setSavingData(false);
    }
  };

  return (
    <div
      className={`view-job-modal-section sm:w-full rounded-[12px] sm:rounded-none sm:rounded-tl-[12px]  sm:rounded-tr-[12px] bg-white nav-space sm:absolute sm:mobile-modal 
      ${showMobile ? "open-modal" : ""}`}
      ref={myDivRef}
    >
      <div className="w-[664px] sm:w-full flex justify-between items-center px-[16px] py-[13px] border-b-[1px] border-b-[#E4E4E7] rounded-none sm:rounded-tl-[12px] sm:rounded-tr-[12px]">
        <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
          {type === "job" ? "Create a Job Post" : "Create a Service Listing"}
        </span>
        <Image
          onClick={handleCloseModal}
          className="cursor-pointer"
          src="/images/Close.svg"
          alt="close icon"
          width={20}
          height={20}
        />
      </div>
      <div className="bg-[white] rounded-[12px] sm:rounded-none p-[16px] sm:w-full max-w-[664px] flex flex-col">
        <div className="flex flex-col gap-[4px] sm:gap-[6px] mb-[16px] sm:w-full">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            {type === "job" ? "Job Title" : "Service Title"}
          </span>
          <input
            className="form-input rounded-[12px] p-[11px] border-[1px] border-[#E4E4E7] sm:w-full"
            placeholder="Title your post.."
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[4px] sm:gap-[6px] mb-[16px]">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            Description
          </span>
          <textarea
            className="form-input rounded-[12px] p-[11px] h-[160px] border-[1px] border-[#E4E4E7] resize-none sm:w-full"
            placeholder="Type a description.."
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="flex gap-[10px] mb-[16px]">
          <div className="w-[100px]">
            <span
              className={`leading-[14.52px] text-[14px] font-medium ${
                payementType === "hourly" ? "text-[black]" : "text-[#E4E4E7]"
              }`}
            >
              Hourly Rate
            </span>
            <input
              className="form-input rounded-[8px] px-[11px] py-[7px] border-[1px] border-[#E4E4E7]"
              placeholder="$ /hr..."
              type="number"
              onChange={e => {
                setPayementType("hourly");
                setHourlyRate(e.target.value);
              }}
            />
          </div>
          <span className="mt-[26px] text-[#707070]">or</span>
          <div className="w-[100px]">
            <span
              className={`leading-[14.52px] text-[14px] font-medium ${
                payementType === "fixed" ? "text-[black]" : "text-[#E4E4E7]"
              }`}
            >
              Fixed Price
            </span>
            <input
              className={`form-input rounded-[8px] px-[11px] py-[7px] border-[1px] border-[#E4E4E7]`}
              placeholder="$ Amount..."
              type="number"
              onChange={e => {
                setPayementType("fixed");
                setFixedPrice(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="w-[110px] sm:w-full mb-[16px]">
          <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
            {type === "job" ? "Paid In" : "Tokens Accepted"}
          </span>
          <button
            className="w-[250px] sm:w-full rounded-[8px] border-[1px] border-[#E4E4E7] p-[7px] flex justify-between items-center relative"
            onClick={e => {
              e.stopPropagation();
              toggleTokensModal();
            }}
            ref={tokenModalRef}
          >
            {selectedTokens.length > 0 ? (
              <span className="flex gap-[3px]">
                {selectedTokens.map(tokenIndex => {
                  return (
                    <Image
                      src={tokens[tokenIndex].image}
                      alt="token icon"
                      width={20}
                      height={20}
                      key={tokenIndex}
                    />
                  );
                })}
              </span>
            ) : (
              <span className="font-normal leading-[14.52px] text-[12px] text-[#707070]">
                Select Tokens
              </span>
            )}
            <Image src="/images/drop-down.svg" alt="drop-down icon" width={20} height={20} />
            <div
              className={`find-work-message-section w-[100%] bg-[#FFFFFF] rounded-[8px] p-[16px] sm:items-start gap-[6px] absolute top-[100%] sm:top-[-265px] left-0
              border-[1px] border-[#E4E4E7] ${showTokens ? "flex" : "hidden"} flex-col z-[999]`}
              onClick={e => {
                e.stopPropagation();
              }}
            >
              {tokens.map((token, index) => (
                <button
                  key={index}
                  className={`flex gap-[8px] items-center rounded-[6px] ${
                    selectedTokens?.includes(index) ? "border-[1px] border-black" : ""
                  }`}
                  onClick={() => onCLickToken(index)}
                >
                  <Image src={token.image} alt="token icon" width={20} height={20} />
                  <span className="font-medium text-[11px] leading-[20px] text-black">
                    {token.text}
                  </span>
                </button>
              ))}
            </div>
          </button>
        </div>
        <span className="leading-[14.52px] text-[14px] font-medium text-[black] mb-[4px]">
          Select Tags
        </span>
        <div className="flex sm:flex-col sm:gap-[10px] justify-between sm:justify-start mb-[24px]">
          {[1, 2, 3].map((id, buttonIndex) =>
            tags[buttonIndex] === "" ? (
              <div
                key={id}
                className="rounded-[8px] border-[1px] border-[#E4E4E7] px-[9px] py-[10px] flex justify-between items-center w-[200px] relative cursor-pointer"
                onClick={() => handleTagClick(id)}
                ref={el => {
                  tagModalRefs.current[id] = el;
                }}
              >
                <>
                  <span className="font-normal leading-[14.52px] text-[12px] text-[#707070]">
                    Add Tag
                  </span>
                  <Image src="/images/plus.svg" alt="drop-down icon" width={12} height={12} />
                </>
                <div
                  className={`find-work-message-section w-[200px] bg-[#FFFFFF] rounded-[8px] p-[20px] sm:items-center gap-[3px] absolute top-[-381px] sm:top-[-478px] left-0
            border-[1px] border-[#E4E4E7] ${
              selectedTag === id ? "flex" : "hidden"
            } flex-col z-[999]`}
                  onClick={e => e.stopPropagation()}
                >
                  {categories.map((button, index) => (
                    <MyButton
                      key={index}
                      buttonText={button.buttonText}
                      buttonType="dropdown"
                      buttonStyles={`${button.buttonStyles} ${
                        selectedCategories?.includes(index) ? "border-[1px] border-black" : ""
                      }`}
                      action={() => {
                        onCLickCategory(index, buttonIndex);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`${`bg-[${
                    tagColors[tags[buttonIndex]]
                  }]`} rounded-[8px] text-[12px] font-semibold w-[200px] px-[9px] py-[10px] flex justify-center items-center relative cursor-pointer`}
                  onClick={() => handleTagClick(id)}
                  ref={el => {
                    tagModalRefs.current[id] = el;
                  }}
                >
                  {tags[buttonIndex]}
                  <div
                    className={`find-work-message-section w-[200px] bg-[#FFFFFF] rounded-[8px] p-[20px] sm:items-center gap-[3px] absolute top-[-381px] sm:top-[-478px] left-0
              border-[1px] border-[#E4E4E7] ${
                selectedTag === id ? "flex" : "hidden"
              } flex-col z-[999]`}
                    onClick={e => e.stopPropagation()}
                  >
                    {categories.map((button, index) => (
                      <MyButton
                        key={index}
                        buttonText={button.buttonText}
                        buttonType="dropdown"
                        buttonStyles={`${button.buttonStyles} ${
                          selectedCategories?.includes(index) ? "border-[1px] border-black" : ""
                        }`}
                        action={() => {
                          onCLickCategory(index, buttonIndex);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )
          )}
        </div>
        {savingData ? (
          <Oval
            visible={true}
            height="32"
            width="32"
            color="#2D2D2D"
            secondaryColor="#a2a2a3"
            strokeWidth={8}
            ariaLabel="oval-loading"
            wrapperClass="mx-auto"
          />
        ) : (
          <button
            className="mx-auto w-fit py-[8px] px-[23px] text-[14px] leading-[14.5px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px]"
            onClick={handlePost}
          >
            Post
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
