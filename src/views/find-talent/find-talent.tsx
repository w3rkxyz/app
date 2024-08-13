"use client";

import SearchInput from "@/components/reusable/SearchInput/SearchInput";

import JobCard from "@/components/JobCard/JobCard";
import MyButton from "@/components/reusable/Button/Button";
import { MouseEventHandler, useEffect, useState } from "react";
import ViewJobModal from "../view-job-modal/view-job-modal";
import {
  usePublications,
  useSearchPublications,
  appId,
} from "@lens-protocol/react-web";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const buttons = [
  {
    buttonText: "Blockchain Development",
    buttonStyles: "bg-[#FFC2C2] mb-[8px] sm:w-full",
  },
  {
    buttonText: "Programming & Development",
    buttonStyles: "bg-[#FFD8C2] mb-[8px] sm:w-full",
  },
  {
    buttonText: "Design",
    buttonStyles: "bg-[#FFF2C2] mb-[8px] sm:w-full w-[150px]",
  },
  { buttonText: "Marketing", buttonStyles: "bg-[#EFFFC2] mb-[8px] sm:w-full" },
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
  { buttonText: "Other", buttonStyles: "bg-[#E4E4E7] mb-[8px] sm:w-full" },
];

const FindTalent = () => {
  const [categoriesMobile, setCategoriesMobile] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState<any[]>([]);
  const { data: publications } = usePublications({
    where: {
      metadata: {
        publishedOn: [appId(process.env.NEXT_PUBLIC_APP_ID as string)],
        tags: {
          oneOf: ["service"],
        },
      },
    },
  });

  const { data: searchResults } = useSearchPublications({
    query: searchText,
    where: {
      metadata: {
        publishedOn: [appId(process.env.NEXT_PUBLIC_APP_ID as string)],
        tags: {
          oneOf: ["service"],
        },
      },
    },
  });
  const [loading, setLoading] = useState(true);
  const [selectedPublication, setSelectedPublication] = useState<any>();

  const toggleCategoriesMobile = () => {
    setCategoriesMobile(!categoriesMobile);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = (publication?: any) => {
    if (publication) setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  const onCLickCategory = (index: number) => {
    if (selectedCategories.includes(index)) {
      const updated = selectedCategories.filter((item) => item !== index);
      setSelectedCategories(updated);
    } else {
      var current = [...selectedCategories];
      current.push(index);
      setSelectedCategories(current);
    }
  };

  useEffect(() => {
    if (publications) {
      setData(publications);
      setLoading(false);
    }
  }, [publications]);

  useEffect(() => {
    if (searchResults) {
      if (searchText !== "" && searchResults.length > 0) {
        setData(searchResults);
      } else {
        if (publications) setData(publications);
      }
    }
  }, [searchResults]);

  return (
    <div className="find-work-section pt-[82px] md:pt-[120px] sm:pt-[60px] pb-[99px] sm:pb-10">
      <div className="custom-container">
        <div className="flex sm:flex-col md:flex-col justify-between items-center mt-[30px] sm:items-start sm:gap-[16px] relative">
          <h2 className="section-title text-center text-[32px] sm:text-[24px] font-semibold font-secondary leading-[20px] tracking-[-4%]">
            Find the <span className="text-gradient">talent</span> you need.
          </h2>
          <SearchInput
            toggleCategories={toggleCategoriesMobile}
            setSearchText={setSearchText}
          />
          <div
            className={`find-work-message-section w-[206px] bg-[#FFFFFF] rounded-[12px] p-[8px] sm:items-center gap-[3px] absolute top-[100%] self-end
            border-[1px] border-[#E4E4E7] hidden ${
              categoriesMobile ? "sm:flex" : "sm:hidden"
            } sm:flex-col`}
          >
            {buttons.map((button, index) => (
              <MyButton
                key={index}
                buttonText={button.buttonText}
                buttonType="secondary"
                buttonStyles={`${button.buttonStyles} ${
                  selectedCategories?.includes(index)
                    ? "border-[1px] border-black"
                    : ""
                }`}
                action={() => onCLickCategory(index)}
              />
            ))}
            <button className="mx-auto w-fit py-[10px] px-[20px] tx-[12px] leading-[14.5px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px] mt-[8px]">
              Apply
            </button>
          </div>
        </div>

        <div className="tags-section w-full flex sm:justify-center sm:flex-col md:flex-col justify-center md:items-start gap-[32px] mt-[30px] sm:mt-[16px]">
          <div
            className="find-work-message-section w-[250px] flex-shrink-0 h-fit sm:h-auto md:h-auto sm:my-0 sm:py-0 bg-[#FFFFFF] sm:bg-transparent md:bg-transparent rounded-[20px] sm:rounded-[0px] p-[29px] sm:w-full sm:items-center gap-2 sm:whitespace-nowrap md:w-full md:flex md:items-center md:whitespace-nowrap overflow-x-auto sm:ml-[-20px]
            border-[1px] border-[#E4E4E7] sm:hidden"
          >
            <h4 className="text-[20px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-center pb-[24px] sm:pb-[10px] md:pb-[10px]">
              Categories
            </h4>

            {buttons.map((button, index) => (
              <MyButton
                key={index}
                buttonText={button.buttonText}
                buttonType="secondary"
                buttonStyles={`${button.buttonStyles} ${
                  selectedCategories?.includes(index)
                    ? "border-[1px] border-black"
                    : ""
                }`}
                action={() => onCLickCategory(index)}
              />
            ))}
          </div>

          <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-1 flex-col gap-[16px]">
            {loading ? (
              <>
                <Skeleton
                  className="h-[208px] w-full rounded-[16px] sm:h-[340px]"
                  baseColor="#E4E4E7"
                  borderRadius={"12px"}
                />
                <Skeleton
                  className="h-[208px] w-full rounded-[16px] sm:h-[340px]"
                  baseColor="#E4E4E7"
                  borderRadius={"12px"}
                />
              </>
            ) : publications && publications.length > 0 ? (
              data.map((publication) => {
                if (publication.__typename === "Post") {
                  var attributes: any = {};
                  publication.metadata.attributes?.map((attribute: any) => {
                    attributes[attribute.key] = attribute.value;
                  });

                  return (
                    <JobCard
                      userAvatar="/images/head-2.svg"
                      username="adam.lens"
                      jobName="Post Title"
                      jobIcon="/images/bag.svg"
                      onCardClick={() => handleOpenModal(publication)}
                      type="service"
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
                  onCardClick={handleOpenModal}
                  type="service"
                />
                <JobCard
                  userAvatar="/images/head-2.svg"
                  username="adam.lens"
                  jobName="Post Title"
                  jobIcon="/images/bag.svg"
                  onCardClick={handleOpenModal}
                  type="service"
                />
                <JobCard
                  userAvatar="/images/head-2.svg"
                  username="adam.lens"
                  jobName="UI/UX Designer | Figma | Web, Dashboard Analytic, Mobile App | SaaS"
                  jobIcon="/images/bag.svg"
                  onCardClick={handleOpenModal}
                  type="service"
                />
                <JobCard
                  userAvatar="/images/head-2.svg"
                  username="adam.lens"
                  jobName="Post Title"
                  jobIcon="/images/bag.svg"
                  onCardClick={handleOpenModal}
                  type="service"
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
              type="service"
              publication={selectedPublication}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FindTalent;
