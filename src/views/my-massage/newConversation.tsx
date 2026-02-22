"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Oval } from "react-loader-spinner";
import { type Account } from "@lens-protocol/client";
import getLensAccountData, { AccountData } from "@/utils/getLensProfile";
import { useConversations } from "@/hooks/useConversations";
import useSearchAccounts from "@/hooks/useSearchAccounts";
import { Dm, IdentifierKind, type Identifier } from "@xmtp/browser-sdk";
import { useXMTP } from "@/app/XMTPContext";
import type { ContentTypes } from "@/app/XMTPContext";
import { useAccount } from "wagmi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

type Props = {
  handleCloseModal: () => void;
};

const NewConversation = ({ handleCloseModal }: Props) => {
  const { client, setNotOnNetwork, setInvalidUser } = useXMTP();
  const { newDmWithIdentifier, selectConversation } = useConversations();
  const { address: walletAddress } = useAccount();
  const lensProfile = useSelector((state: RootState) => state.app.user);
  const myDivRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState("");
  const { data: accounts, loading: accountsLoading } = useSearchAccounts({
    filter: {
      searchBy: {
        localNameQuery: searchText,
      },
    },
  });
  const selfAddresses = useMemo(
    () =>
      [walletAddress, lensProfile?.address]
        .filter((value): value is string => Boolean(value))
        .map(value => value.toLowerCase()),
    [walletAddress, lensProfile?.address]
  );
  const selfHandle = useMemo(
    () => lensProfile?.handle?.replace(/^@/, "").toLowerCase() || "",
    [lensProfile?.handle]
  );
  const filteredAccounts = useMemo(() => {
    if (!accounts) {
      return [];
    }

    return accounts.filter(account => {
      const accountAddress = account.address?.toLowerCase() || "";
      const ownerAddress = account.owner?.toLowerCase() || "";
      const localName = account.username?.localName?.toLowerCase() || "";

      const isOwnAddress =
        (accountAddress && selfAddresses.includes(accountAddress)) ||
        (ownerAddress && selfAddresses.includes(ownerAddress));
      const isOwnHandle = selfHandle !== "" && localName === selfHandle;

      return !isOwnAddress && !isOwnHandle;
    });
  }, [accounts, selfAddresses, selfHandle]);

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
      const normalizeIdentifier = (identifier: string) => {
        const normalized = identifier.toLowerCase();
        const segments = normalized.split(":");
        const tail = segments[segments.length - 1];
        if (tail.startsWith("0x") && tail.length === 42) {
          return tail;
        }
        return normalized;
      };

      const identityCandidates = Array.from(
        new Set(
          [account.address, account.owner]
            .filter((value): value is string => typeof value === "string" && value.length > 0)
            .map(normalizeIdentifier)
        )
      );

      let existingDm: Dm<ContentTypes> | undefined;
      const existingConversations = await client.conversations.list();
      for (const conversation of existingConversations) {
        if (!(conversation instanceof Dm)) {
          continue;
        }

        const members = await conversation.members();
        const memberIdentifiers = members.flatMap(member =>
          member.accountIdentifiers.map(accountIdentifier =>
            normalizeIdentifier(accountIdentifier.identifier)
          )
        );
        if (memberIdentifiers.some(identifier => identityCandidates.includes(identifier))) {
          existingDm = conversation as Dm<ContentTypes>;
          break;
        }
      }

      if (existingDm) {
        selectConversation(existingDm);
        return;
      }

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
      className="relative w-[460px] sm:w-[94%] rounded-[16px] border border-[#E4E4E7] bg-white px-[18px] py-[8px] shadow-[0_24px_48px_rgba(0,0,0,0.12)] sm:h-fit"
      ref={myDivRef}
    >
      <div className="w-full flex justify-between items-center py-[12px] border-b border-[#E4E4E7]">
        <span className="leading-[20px] text-[15px] font-semibold text-black">
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
      <div className="pt-[14px] pb-[12px]">
        <span className="text-[12px] leading-[16px] text-[#7C7C82] font-medium">Username</span>
        <div className="relative mt-[8px]">
          <input
            className="rounded-[12px] h-[44px] px-[12px] border border-[#E4E4E7] bg-[#FCFCFC] w-full text-[14px] leading-[18px] text-[#111111] placeholder-[#9B9BA1] focus:outline-none focus:border-[#C6AAFF] transition-colors"
            placeholder="Search Lens account"
            onChange={e => setSearchText(e.target.value)}
          />

          {creatingConvo ? (
            <div
              className="absolute top-full left-0 right-0 mt-[8px] z-[20] rounded-[12px] border border-[#E4E4E7] bg-white py-[20px] px-[12px] flex flex-col items-center"
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
              <span className="font-semibold text-[14px] mt-[8px] text-center">
                Creating a new DM with {selectedUser}
              </span>
            </div>
          ) : filteredAccounts.length > 0 && searchText !== "" ? (
            <div
              className="absolute top-full left-0 right-0 mt-[8px] z-[20] max-h-[320px] overflow-y-auto flex flex-col gap-[2px] rounded-[12px] border border-[#E4E4E7] bg-white py-[8px]"
              onClick={e => e.stopPropagation()}
            >
              {filteredAccounts.slice(0, 7).map((acc, index) => {
                const profile = getLensAccountData(acc);
                return (
                  <div
                    className="text-[14px] hover:bg-[#F4F4F5] w-full gap-[10px] flex items-center cursor-pointer px-[10px] py-[9px] transition-colors"
                    key={index}
                    onClick={() => handleCreate(acc)}
                  >
                    <div className="w-[30px] h-[30px] rounded-full relative bg-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                      <Image
                        src={profile.picture || "https://static.hey.xyz/images/default.png"}
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            "https://static.hey.xyz/images/default.png";
                        }}
                        fill
                        className="object-cover"
                        alt="user icon"
                      />
                    </div>
                    <div className="flex min-w-0 items-center gap-[8px]">
                      <span className="text-[14px] text-black mt-[1px] font-medium truncate">
                        {profile.displayName !== "" ? profile.displayName : `Display Name`}
                      </span>
                      <span className="text-[13px] text-[#A0A0A6] mt-[1px] truncate">
                        {profile.handle !== "" ? profile.handle : "@lenshandle"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchText !== "" && !accountsLoading ? (
            <div
              className="absolute top-full left-0 right-0 mt-[8px] z-[20] rounded-[12px] border border-[#E4E4E7] bg-white py-[16px] px-[12px] text-center"
              onClick={e => e.stopPropagation()}
            >
              <span className="text-[13px] leading-[18px] text-[#7C7C82]">
                No users found
              </span>
            </div>
          ) : accountsLoading && searchText !== "" ? (
            <div
              className="absolute top-full left-0 right-0 mt-[8px] z-[20] rounded-[12px] border border-[#E4E4E7] bg-white py-[20px] px-[12px] flex flex-col items-center"
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
              <span className="font-semibold text-[14px] mt-[8px]">Searching users</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NewConversation;
