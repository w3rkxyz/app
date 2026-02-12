"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Oval } from "react-loader-spinner";
import { type Account } from "@lens-protocol/client";
import getLensAccountData, { AccountData } from "@/utils/getLensProfile";
import { useConversations } from "@/hooks/useConversations";
import useSearchAccounts from "@/hooks/useSearchAccounts";
import { IdentifierKind, type Identifier } from "@xmtp/browser-sdk";
import { useXMTP } from "@/app/XMTPContext";

type Props = {
  handleCloseModal: () => void;
};

const NewConversation = ({ handleCloseModal }: Props) => {
  const { client, setNotOnNetwork, setInvalidUser } = useXMTP();
  const { newDmWithIdentifier, selectConversation } = useConversations();
  const myDivRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState("");
  const { data: accounts, loading: accountsLoading } = useSearchAccounts({
    filter: {
      searchBy: {
        localNameQuery: searchText,
      },
    },
  });

  // useEffect(() => {
  //   const getAccounts = async () => {
  //     const client = getPublicClient();
  //     const accounts = await fetchAccounts(client, {
  //       filter: { searchBy: { localNameQuery: searchText } },
  //     });
  //     console.log("Accounts: ", accounts);
  //   };
  //   if (searchText.length > 4) {
  //     getAccounts();
  //   }
  // }, [searchText]);

  // useEffect(() => {
  //   // console.log("Inbox ID changed");
  //   const createDm = async () => {
  //     // console.log("Got here with inboxID: ", inboxId);
  //     if (error) {
  //       setCreatingConvo(false);
  //       handleCloseModal();
  //     }

  //     if (inboxId && selectedprofile) {
  //       console.log("Got here with inboxID 1: ", memberId);
  //       const conversation = await newDmWithIdentifier(
  //         {
  //           identifier: memberId,
  //           identifierKind: "Ethereum",
  //         },
  //         selectedprofile
  //       );
  //       setCreatingConvo(false);
  //       console.log("Coversation Created: ", conversation);
  //       handleCloseModal();
  //     }
  //   };
  //   // createDm();
  // }, [inboxId, error, selectedprofile]);

  const [creatingConvo, setCreatingConvo] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const handleCreate = async (account: Account) => {
    if (!client) return;

    const profile = getLensAccountData(account);
    setSelectedUser(profile.displayName);
    setCreatingConvo(true);
    try {
      const identityCandidates = Array.from(
        new Set(
          [account.address, account.owner]
            .filter((value): value is string => typeof value === "string" && value.length > 0)
            .map(value => value.toLowerCase())
        )
      );

      const identifiers: Identifier[] = identityCandidates.map(identifier => ({
        identifier,
        identifierKind: IdentifierKind.Ethereum,
      }));

      const canMessageResult = await client.canMessage(identifiers);
      const activeIdentifier = identityCandidates.find(identifier =>
        Boolean(canMessageResult.get(identifier))
      );

      if (activeIdentifier) {
        const conversation = await newDmWithIdentifier(
          {
            identifier: activeIdentifier,
            identifierKind: IdentifierKind.Ethereum,
          },
          profile
        );

        if (conversation !== "Failed") {
          selectConversation(conversation);
        }
      } else {
        setInvalidUser(profile);
        setNotOnNetwork(true);
      }
    } finally {
      setCreatingConvo(false);
      handleCloseModal();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (myDivRef.current && !myDivRef.current.contains(event.target as Node)) {
        handleCloseModal();
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
      {creatingConvo ? (
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
          <span className="font-bold text-[14px] mt-[6px]">
            Creating a new Dm with {selectedUser}
          </span>
        </div>
      ) : accounts && accounts.length > 0 && searchText !== "" ? (
        <div
          className={`user-search-box-modal mt-[0px] flex flex-col gap-[5px] absolute top-[105px] left-[16px] rounded-[10px] border-[1px] border-[#E4E4E7] bg-white py-[10px]`}
          onClick={e => e.stopPropagation()}
        >
          {accounts.slice(0, 7).map((acc, index) => {
            const profile = getLensAccountData(acc);
            return (
              <div
                className="text-[14px] hover:bg-[#f1f1f1] w-full gap-[8px] flex items-center cursor-pointer px-[10px] py-[8px]"
                key={index}
                onClick={() => handleCreate(acc)}
              >
                <div className="circle-div relative bg-gray-200 dark:border-gray-700">
                  <Image
                    src={profile.picture}
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        "https://static.hey.xyz/images/default.png";
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
