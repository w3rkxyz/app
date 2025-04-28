"use client";

import SearchInput from "@/components/reusable/SearchInput/SearchInput";

import JobCard from "@/components/Cards/JobCard";
import MyButton from "@/components/reusable/Button/Button";
import ViewJobModal from "../view-job-modal/view-job-modal";
import { useEffect, useState } from "react";
import {
  usePublications,
  useSearchPublications,
  appId,
  AnyPublication,
} from "@lens-protocol/react-web";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { ContentWarning, MainContentFocus } from "@lens-protocol/client";
import { fetchPosts } from "@lens-protocol/client/actions";

import { client } from "../../client";

const buttons = [
  {
    buttonText: "Blockchain Development",
    buttonStyles: "bg-[#FFC2C2] mb-[8px]",
  },
  {
    buttonText: "Programming & Development",
    buttonStyles: "bg-[#FFD8C2] mb-[8px]",
  },
  { buttonText: "Design", buttonStyles: "bg-[#FFF2C2] mb-[8px]" },
  { buttonText: "Marketing", buttonStyles: "bg-[#EFFFC2] mb-[8px]" },
  { buttonText: "Admin Support", buttonStyles: "bg-[#C2FFC5] mb-[8px]" },
  { buttonText: "Customer Service", buttonStyles: "bg-[#C2FFFF] mb-[8px]" },
  { buttonText: "Security & Auditing", buttonStyles: "bg-[#C2CCFF] mb-[8px]" },
  {
    buttonText: "Consulting & Advisory",
    buttonStyles: "bg-[#D9C2FF] mb-[8px]",
  },
  { buttonText: "Community Building", buttonStyles: "bg-[#FAC2FF] mb-[8px]" },
  { buttonText: "Other", buttonStyles: "bg-[#E4E4E7] mb-[8px]" },
];

function selectedCategoriesText(selected: number[]) {
  var array: string[] = [];
  selected.map(item => {
    array.push(buttons[item].buttonText);
  });
  return array;
}

function filterbyTags(array1: string[], array2: string[]) {
  return array2.every(item => array1.includes(item));
}

const FindWork = () => {
  const [categoriesMobile, setCategoriesMobile] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState<any[]>([]);
  const {
    data: publications,
    hasMore,
    loading: publicationsLoading,
  } = usePublications({
    where: {
      metadata: {
        publishedOn: [appId(process.env.NEXT_PUBLIC_APP_ID as string)],
        tags: {
          all: ["w3rk", "job"],
        },
      },
    },
  });

  // const { data: searchResults } = useSearchPublications({
  //   query: searchText,
  //   where: {
  //     metadata: {
  //       publishedOn: [appId(process.env.NEXT_PUBLIC_APP_ID as string)],
  //       tags: {
  //         all: ["w3rk", "job"],
  //       },
  //     },
  //   },
  // });
  const [loading, setLoading] = useState(true);
  const [selectedPublication, setSelectedPublication] = useState<any>();

  const toggleCategoriesMobile = () => {
    setCategoriesMobile(!categoriesMobile);
  };

  const handleCloseModal = () => {
    // document.documentElement.style.paddingRight = "";
    setIsModalOpen(false);
  };

  interface Item {
    metadata: {
      attributes: string[];
    };
  }

  const searchItems = (items: AnyPublication[], searchText: string) => {
    const filtered = items.filter(item => {
      if (item.__typename === "Post") {
        const attribute4 = item.metadata.attributes?.[4].value.toLowerCase();
        const attribute5 = item.metadata.attributes?.[5].value.toLowerCase();
        return (
          attribute4?.includes(searchText.toLowerCase()) ||
          attribute5?.includes(searchText.toLowerCase())
        );
      }
    });
    setData(filtered);
  };

  const handleSearch = (searchText: string) => {
    if (publications) {
      const filtered = searchItems(publications, searchText);
    }
  };

  const handleOpenModal = (publication?: any) => {
    if (publication) setSelectedPublication(publication);
    // const scrollbarWidth =
    //   window.innerWidth - document.documentElement.clientWidth;
    // // document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    setIsModalOpen(true);
  };

  const onCLickCategory = (index: number) => {
    if (selectedCategories.includes(index)) {
      const updated = selectedCategories.filter(item => item !== index);
      setSelectedCategories(updated);
    } else {
      var current = [...selectedCategories];
      current.push(index);
      setSelectedCategories(current);
    }
  };

  useEffect(() => {
    if (publications) {
      setData(publications.filter(publication => publication.isHidden === false));
      console.log("Publications: ", publications);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publications]);

  // useEffect(() => {
  //   console.log('There was an update!')
  //   if (searchResults) {
  //     if (searchText !== "" && searchResults.length > 0) {
  //       setData(searchResults.filter((publication) => publication.isHidden === false));
  //       console.log("Results: ", searchResults);
  //     } else {
  //       if (publications) setData(publications);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchResults]);

  useEffect(() => {
    const getData = async () => {
      const result = await fetchPosts(client, {
        filter: {
          apps: [appId(process.env.NEXT_PUBLIC_APP_ID as string)],
          metadata: {
            tags: { all: ["w3rk", "job"] },
          },
        },
      });
      console.log(result);
    };
    getData();
  }, []);

  return (
    <div className="find-work-section pt-[82px] md:pt-[120px] sm:pt-[60px] mb-[20px]">
      <div className="custom-container">
        <div className="flex sm:flex-col md:flex-col justify-between items-center mt-[30px]  sm:items-start sm:gap-[16px] gap-[56px] relative">
          <h2 className="section-title flex-shrink-0 text-center sm:text-start text-[32px] sm:text-[20px] font-semibold font-secondary leading-[20px] tracking-[-4%]">
            Discover your next <span className="text-gradient">opportunity.</span>
          </h2>
          <div className="max-w-[600px] flex-1 md:w-full relative">
            <SearchInput toggleCategories={toggleCategoriesMobile} handleSearch={handleSearch} />
            <div
              className={`find-work-message-section w-[206px] bg-[#FFFFFF] rounded-[8px] p-[8px] sm:items-center gap-[3px] absolute top-[100%] right-0
            border-[1px] border-[#E4E4E7] hidden ${
              categoriesMobile ? "sm:flex banner-tablet:flex" : "sm:hidden banner-tablet:hidden"
            } sm:flex-col banner-tablet:flex-col z-[100]`}
            >
              <MyButton
                buttonText="Blockchain Development"
                buttonType="secondary"
                buttonStyles="bg-[#FFC2C2] mb-[8px] sm:font-bold sm:text-[10px] sm:leading-[11px] sm:w-full"
              ></MyButton>
              <MyButton
                buttonText="Programming & Development"
                buttonType="secondary"
                buttonStyles="bg-[#FFD8C2] mb-[8px] sm:font-bold sm:text-[10px] sm:leading-[11px] sm:w-full"
              ></MyButton>
              <MyButton
                buttonText="Design"
                buttonType="secondary"
                buttonStyles="bg-[#FFF2C2] mb-[8px] w-[150px] sm:w-full"
              ></MyButton>
              <MyButton
                buttonText="Marketing"
                buttonType="secondary"
                buttonStyles="bg-[#EFFFC2] mb-[8px] sm:w-full"
              ></MyButton>
              <MyButton
                buttonText="Admin Support"
                buttonType="secondary"
                buttonStyles="bg-[#C2FFC5] mb-[8px] sm:w-full"
              ></MyButton>
              <MyButton
                buttonText="Customer Service"
                buttonType="secondary"
                buttonStyles="bg-[#C2FFFF] mb-[8px] sm:w-full"
              ></MyButton>
              <MyButton
                buttonText="Security & Auditing"
                buttonType="secondary"
                buttonStyles="bg-[#C2CCFF] mb-[8px] sm:w-full"
              ></MyButton>
              <MyButton
                buttonText="Consulting & Advisory"
                buttonType="secondary"
                buttonStyles="bg-[#D9C2FF] mb-[8px] sm:w-full"
              ></MyButton>
              <MyButton
                buttonText="Community Building"
                buttonType="secondary"
                buttonStyles="bg-[#FAC2FF] mb-[8px] sm:w-full"
              ></MyButton>
              <MyButton
                buttonText="Other"
                buttonType="secondary"
                buttonStyles="bg-[#E4E4E7] mb-[8px] sm:w-full"
              ></MyButton>
              <button className="mx-auto w-fit py-[10px] px-[20px] tx-[12px] leading-[14.5px] text-white bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] font-semibold mb-[8px] mt-[8px]">
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="tags-section w-full flex sm:justify-center sm:flex-col md:flex-col md:items-start gap-[35px] mt-[50px] sm:mt-[16px]">
          <div
            className="find-work-message-section w-fit flex flex-col px-[24px] flex-shrink-0 h-fit sm:h-auto md:h-auto sm:my-0 sm:py-0 bg-[#FFFFFF] sm:bg-transparent md:bg-transparent rounded-[20px] p-[29px] pt-[32px]
            border-[1px] border-[#E4E4E7] sm:hidden banner-tablet:hidden"
          >
            <h4 className="text-[20px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-center pb-[34px] sm:pb-[10px] md:pb-[10px]">
              Categories
            </h4>

            {buttons.map((button, index) => (
              <button
                key={index}
                className={`${button.buttonStyles} ${
                  selectedCategories?.includes(index) ? "border-[1px] border-black" : ""
                } rounded-[8px] leading-[14.52px] text-[12px] font-semibold py-[9px] w-[200px] sm:px-0 sm:w-[190px] sm:flex sm:justify-center min-w-[200px]`}
                onClick={() => onCLickCategory(index)}
              >
                {button.buttonText}
              </button>
            ))}
          </div>

          <div className="border-[1px] border-[#E4E4E7] rounded-[16px] p-[16px] flex flex-1 w-full flex-col gap-[16px]">
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
              data.map((publication, index) => {
                if (
                  publication.__typename === "Post" &&
                  filterbyTags(
                    publication.metadata.tags,
                    selectedCategoriesText(selectedCategories)
                  )
                ) {
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
                      onCardClick={() => handleOpenModal(publication)}
                      type="job"
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
                  type="job"
                />
                <JobCard
                  userAvatar="/images/head-2.svg"
                  username="adam.lens"
                  jobName="Post Title"
                  jobIcon="/images/bag.svg"
                  onCardClick={handleOpenModal}
                  type="job"
                />
                <JobCard
                  userAvatar="/images/head-2.svg"
                  username="adam.lens"
                  jobName="UI/UX Designer | Figma | Web, Dashboard Analytic, Mobile App | SaaS"
                  jobIcon="/images/bag.svg"
                  onCardClick={handleOpenModal}
                  type="job"
                />
                <JobCard
                  userAvatar="/images/head-2.svg"
                  username="adam.lens"
                  jobName="Post Title"
                  jobIcon="/images/bag.svg"
                  onCardClick={handleOpenModal}
                  type="job"
                />
              </>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed h-screen w-screen overflow-hidden inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center sm:items-end cursor-auto">
          <div className="w-full flex justify-center sm:just align-middle sm:align-bottom">
            <ViewJobModal
              handleCloseModal={handleCloseModal}
              type="job"
              publication={selectedPublication}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FindWork;
