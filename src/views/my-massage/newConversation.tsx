"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Oval } from "react-loader-spinner";
import { useAccounts } from "@lens-protocol/react";
import getLensAccountData from "@/utils/getLensProfile";

type Props = {
  handleCloseModal?: () => void;
  closeJobCardModal?: () => void;
  handleStartConversation: any;
};

const NewConversation = ({
  handleCloseModal,
  closeJobCardModal,
  handleStartConversation,
}: Props) => {
  const myDivRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState("");
  const { data: accounts, loading: accountsLoading } = useAccounts({
    filter: {
      searchBy: {
        localNameQuery: searchText,
      },
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (myDivRef.current && !myDivRef.current.contains(event.target as Node)) {
        if (handleCloseModal) {
          handleCloseModal();
        } else if (closeJobCardModal) {
          closeJobCardModal();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="w-[400px] sm:w-[94%] rounded-[12px] bg-white nav-space absolute px-[16px] sm:h-fit"
      ref={myDivRef}
    >
      <div className="w-full flex justify-between items-center py-[12px] border-b-[1px] border-b-[#E4E4E7]">
        <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
          New Conversation
        </span>
        <Image
          onClick={handleCloseModal}
          src="/images/Close.svg"
          alt="close icon"
          className="cursor-pointer"
          width={20}
          height={20}
        />
      </div>
      <input
        className="form-input rounded-[8px] p-[9px] border-[1px] border-[#E4E4E7] w-full my-[16px]"
        placeholder="Search..."
        onChange={e => setSearchText(e.target.value)}
      />
      {accounts && accounts.items.length > 0 && searchText !== "" ? (
        <div
          className={`user-search-box-modal mt-[0px] flex flex-col gap-[5px] absolute top-[105px] left-[16px] rounded-[10px] border-[1px] border-[#E4E4E7] bg-white py-[10px]`}
          onClick={e => e.stopPropagation()}
        >
          {accounts.items.slice(0, 7).map((acc, index) => {
            const profile = getLensAccountData(acc);
            return (
              <div
                className="text-[14px] hover:bg-[#f1f1f1] w-full gap-[8px] flex items-center cursor-pointer px-[10px] py-[8px]"
                key={index}
                onClick={() => handleStartConversation(profile)}
              >
                <div className="circle-div relative bg-gray-200 dark:border-gray-700">
                  <Image
                    src={profile.picture}
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        'https://static.hey.xyz/images/default.png';
                    }}
                    fill
                    className="circle-div relative bg-gray-200 dark:border-gray-700"
                    alt="user icon"
                  />
                </div>
                <span className="text-[14px] text-black mt-[1px]">
                  {profile.displayName !== "" ? profile.displayName : `Display Name`}
                </span>
                <span className="text-[13px] text-[#c1c0c0] mt-[1px]">
                  {profile.handle !== "" ? profile.handle : "@lenshandle"}
                </span>
              </div>
            );
          })}
        </div>
      ) : accountsLoading && searchText !== "" ? (
        <div
          className={`user-search-box-modal mt-[0px] flex flex-col absolute top-[105px] left-[16px] rounded-[10px] border-[1px] border-[#E4E4E7] bg-white py-[20px] align-middle items-center`}
          onClick={e => e.stopPropagation()}
        >
          <Oval
            visible={true}
            height="24"
            width="24"
            color="#000000"
            secondaryColor="#E4E4E7"
            strokeWidth={"5"}
            ariaLabel="oval-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
          <span className="font-bold text-[14px] mt-[6px]">Searching Users</span>
        </div>
      ) : null}
    </div>
  );
};

export default NewConversation;
