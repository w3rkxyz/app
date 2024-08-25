"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import DownloadIcon from "@/icons/DownloadIcon";
import CreateContractModal from "../create-contract-modal/create-contract-modal";
import OpenMessage from "./OpenMessage";
import NewConversation from "./newConversation";
import getCurrentTime from "@/utils/currentTime";
import { Client, Conversation, DecodedMessage } from "@xmtp/xmtp-js";
import {
  Profile,
  ProfileId,
  useSession,
  SessionType,
  useProfiles,
  profileId,
} from "@lens-protocol/react-web";
import toast from "react-hot-toast"; // Get the keys using a valid Signer. Save them somewhere secure.
import { useEthersSigner } from "@/utils/getSigner";
import moment from "moment";
import getLensProfileData from "@/utils/getLensProfile";
import Link from "next/link";

// interface Message {
//   id: number;
//   sender: string;
//   text: string;
//   time: string;
// }

const PREFIX = "lens.dev/dm";

const buildConversationId = (profileIdA: string, profileIdB: string) => {
  const profileIdAParsed = parseInt(profileIdA, 16);
  const profileIdBParsed = parseInt(profileIdB, 16);

  return profileIdAParsed < profileIdBParsed
    ? `${PREFIX}/${profileIdA}-${profileIdB}`
    : `${PREFIX}/${profileIdB}-${profileIdA}`;
};

// const placeholderMessages: Message[][] = [
//   [
//     {
//       id: 1,
//       sender: "me",
//       time: "11:20am",
//       text: "Hey! You’re really cool would like to connect asap!",
//     },
//     {
//       id: 2,
//       sender: "tom",
//       time: "11:25am",
//       text: `Hey! Really cool to see your service listing.
// Would be great to connect and better understand your skill-sets...
// When would you be available for a call?`,
//     },
//   ],
//   [
//     {
//       id: 3,
//       sender: "me",
//       time: "12:20am",
//       text: "How are you man!",
//     },
//     {
//       id: 4,
//       sender: "dan",
//       time: "1:25am",
//       text: `Doing great! What's up?`,
//     },
//   ],
//   [
//     {
//       id: 5,
//       sender: "me",
//       time: "6:20am",
//       text: "Good morning, we need to talk.",
//     },
//     {
//       id: 6,
//       sender: "emmanuel",
//       time: "11:25am",
//       text: `Hey...`,
//     },
//     {
//       id: 7,
//       sender: "emmanuel",
//       time: "11:25am",
//       text: `about what?`,
//     },
//   ],
// ];

function getOtherId(id: string, url: string): string {
  const ids = url.split("/").pop()?.split("-") || [];
  return ids.find((item) => item !== id) || "";
}

function isConversationParticipant(id: string, url: string): boolean {
  const ids = url.split("/").pop()?.split("-") || [];
  return ids.includes(id);
}

const MyMessageOpenChat = () => {
  const { data: session, loading: sessionLoading } = useSession();
  const signer = useEthersSigner();
  const [chatUserIds, setChatUserIds] = useState<ProfileId[]>([]);
  const { data: profiles } = useProfiles({
    where: {
      profileIds: chatUserIds,
    },
  });
  const [profilesData, setProfilesData] = useState<
    {
      picture: string;
      coverPicture: string;
      displayName: string;
      handle: string;
      bio: string;
      attributes: any;
      id: any;
      userLink: any;
    }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Conversation<string | undefined>[]>(
    []
  );
  const [inputMessage, setInputMessage] = useState("");
  const [messagesEnabled, setMessagesEnabled] = useState(false);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [connectingXMTP, setConnectingXMTP] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [showMessagesMobile, setShowMessagesMobile] = useState(false);
  const [xmtp, setXmtp] = useState<Client>();
  const [activeMessages, setActiveMessages] = useState<DecodedMessage[]>([]);
  const [conversationDates, setConversationDates] = useState<(Date | string)[]>(
    []
  );
  const [latestMessage, setLatestMessage] = useState<string[]>([]);
  const [unactivatedUserProfile, setUnactivatedUserProfile] = useState<any>();

  const handleIncomingMessages = async (client: Client) => {
    for await (const message of await client.conversations.streamAllMessages()) {
      const conversations = await client.conversations.list();
      var conversationsFilteredById: Conversation<string | undefined>[] = [];
      var ids: ProfileId[] = [];
      var dates: (Date | string)[] = [];
      var recentMessage: string[] = [];
      for (let i = 0; i < conversations.length; i++) {
        const conversation = conversations[i];
        if (
          session?.type === SessionType.WithProfile &&
          conversation.context?.conversationId
        ) {
          if (
            isConversationParticipant(
              session.profile.id,
              conversation.context?.conversationId as string
            )
          ) {
            conversationsFilteredById.push(conversation);
            const otherUserID = getOtherId(
              session.profile.id,
              conversation.context?.conversationId as string
            );
            ids.push(profileId(otherUserID));
            const lastMessage = await conversation.messages();
            dates.push(
              lastMessage && lastMessage.length > 0
                ? lastMessage[lastMessage.length - 1].sent
                : ""
            );
            recentMessage.push(
              lastMessage && lastMessage.length > 0
                ? (lastMessage[lastMessage.length - 1].content as string)
                : ""
            );
          }
        }
      }
      setLatestMessage(recentMessage);
      setChatUserIds(ids);
      setConversationDates(dates);
      setMessages(conversationsFilteredById);

      const scrollableDiv = document.getElementById("scrollableDiv");
      const bottomMarker = document.getElementById("bottomMarker");

      bottomMarker?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const createXMTPClient = async () => {
    if (signer) {
      setConnectingXMTP(true);
      const client = await Client.create(signer, { env: "production" });

      console.log("reached here 1");
      handleIncomingMessages(client);
      console.log("reached here 2");

      setXmtp(client);
      const conversations = await client.conversations.list();
      var conversationsFilteredById: Conversation<string | undefined>[] = [];
      var ids: ProfileId[] = [];
      var dates: (Date | string)[] = [];
      var recentMessage: string[] = [];
      for (let i = 0; i < conversations.length; i++) {
        const conversation = conversations[i];
        if (
          session?.type === SessionType.WithProfile &&
          conversation.context?.conversationId
        ) {
          if (
            isConversationParticipant(
              session.profile.id,
              conversation.context?.conversationId as string
            )
          ) {
            conversationsFilteredById.push(conversation);
            const otherUserID = getOtherId(
              session.profile.id,
              conversation.context?.conversationId as string
            );
            ids.push(profileId(otherUserID));
            const lastMessage = await conversation.messages();
            dates.push(
              lastMessage && lastMessage.length > 0
                ? lastMessage[lastMessage.length - 1].sent
                : ""
            );
            recentMessage.push(
              lastMessage && lastMessage.length > 0
                ? (lastMessage[lastMessage.length - 1].content as string)
                : ""
            );
            console.log(`Last Message ${i}: `, lastMessage);
          }
        }
      }
      setMessages(conversationsFilteredById);
      setChatUserIds(ids);
      setConversationDates(dates);
      setLatestMessage(recentMessage);
      setMessagesEnabled(true);
      setConnectingXMTP(false);

      const stream = await client.conversations.stream();
      for await (const conversation of stream) {
        console.log("This ran!");
        const conversations = await client.conversations.list();
        var conversationsFilteredById: Conversation<string | undefined>[] = [];
        var ids: ProfileId[] = [];
        var dates: (Date | string)[] = [];
        var recentMessage: string[] = [];
        for (let i = 0; i < conversations.length; i++) {
          const conversation = conversations[i];
          if (
            session?.type === SessionType.WithProfile &&
            conversation.context?.conversationId
          ) {
            if (
              isConversationParticipant(
                session.profile.id,
                conversation.context?.conversationId as string
              )
            ) {
              conversationsFilteredById.push(conversation);
              const otherUserID = getOtherId(
                session.profile.id,
                conversation.context?.conversationId as string
              );
              ids.push(profileId(otherUserID));
              const lastMessage = await conversation.messages();
              dates.push(
                lastMessage && lastMessage.length > 0
                  ? lastMessage[lastMessage.length - 1].sent
                  : ""
              );
              recentMessage.push(
                lastMessage && lastMessage.length > 0
                  ? (lastMessage[lastMessage.length - 1].content as string)
                  : ""
              );
            }
          }
        }
        setLatestMessage(recentMessage);
        setChatUserIds(ids);
        setConversationDates(dates);
        setMessages(conversationsFilteredById);
        setSelectedConversation(conversations.length - 1);
      }
    }
  };

  const openConversation = async (index: number) => {
    const conversationMessages = await messages[index].messages();
    setActiveMessages(conversationMessages);
    setSelectedConversation(index);

    for await (const message of await messages[index].streamMessages()) {
      setActiveMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];
        return updatedMessages;
      });
    }
  };

  const handleCloseModal = () => {
    setIsContractModalOpen(false);
  };

  const handleCloseNewConversationModal = () => {
    setIsNewConversationModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      if (
        isContractModalOpen &&
        (event.target as HTMLElement).closest(".modal-content") === null
      ) {
        handleCloseModal();
      }
    };

    document.addEventListener("click", handleClickOutsideModal);

    return () => {
      document.removeEventListener("click", handleClickOutsideModal);
    };
  }, [isContractModalOpen]);

  const handleSendMessage = () => {
    console.log("Sending a message");
    if (inputMessage.trim() !== "" && selectedConversation !== null) {
      console.log("got here");
      messages[selectedConversation].send(inputMessage, {
        timestamp: new Date(),
      });
      setInputMessage("");
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleNewConversation = async (profile: Profile) => {
    if (xmtp && profile.handle && session?.type === SessionType.WithProfile) {
      console.log("Opened conversation: ", profile);
      const isOnNetwork = await xmtp.canMessage(profile.handle?.ownedBy);
      console.log("on Network: ", isOnNetwork);
      if (isOnNetwork) {
        const conversationId = buildConversationId(
          session.profile.id,
          profile.id
        );
        const conversation = await xmtp.conversations.newConversation(
          profile.handle.ownedBy,
          {
            conversationId: conversationId,
            metadata: {},
          }
        );
        messages.map((message, index) => {
          if (
            conversation.context?.conversationId ===
            message.context?.conversationId
          ) {
            setSelectedConversation(index);
          }
        });
        console.log("Created conversation: ", conversation);
      } else {
        setUnactivatedUserProfile(getLensProfileData(profile));
        setSelectedConversation(10000);
      }
    }
    setIsNewConversationModalOpen(false);
  };

  useEffect(() => {
    console.log("Started running");
    if (profiles) {
      var temp: {
        picture: string;
        coverPicture: string;
        displayName: string;
        handle: string;
        bio: string;
        attributes: any;
        id: any;
        userLink: any;
      }[] = [];
      profiles.map((profile) => {
        console.log("Profile: ", profile);
        var data = getLensProfileData(profile);
        console.log("Data: ", data);
        temp.push(data);
      });
      console.log("Temo: ", temp);
      setProfilesData(temp);
    }
  }, [profiles]);

  useEffect(() => {
    const scrollableDiv = document.getElementById("scrollableDiv");
    const bottomMarker = document.getElementById("bottomMarker");

    bottomMarker?.scrollIntoView({ behavior: "instant" });
  }, [selectedConversation]);

  return (
    <div className="h-screen w-screen overflow-hidden pt-[107px] sm:pt-[75px] px-[156px] sm:px-[16px] flex gap-[5px] mb-[0px] absolute top-0 left-0 z-[998]">
      <div
        className={`horizontal-box px-[12px] w-[367px] sm:w-full flex ${
          selectedConversation !== null ? "sm:hidden" : "sm:flex"
        } flex-col`}
      >
        <div className="flex justify-between items-center py-[19px] px-[9px]">
          <span className="leading-[16.94px] font-medium text-[16px]">
            Messages
          </span>
          {messagesEnabled && (
            <Image
              onClick={() => setIsNewConversationModalOpen(true)}
              src="/images/new-message.svg"
              className="cursor-pointer"
              alt="new message"
              width={26}
              height={26}
            />
          )}
        </div>
        <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
        {messagesEnabled ? (
          <>
            <div
              className={`flex ${
                showMessagesMobile ? "sm:flex" : "sm:hidden"
              } flex-col gap-[5px] mt-[8px]`}
            >
              {profilesData.map((message, index) => {
                return (
                  <div
                    key={index}
                    className={`p-[8px] w-full ${
                      selectedConversation === index
                        ? "bg-[#E4E4E7]"
                        : "bg-[#FAFAFA]"
                    } rounded-[8px] cursor-pointer`}
                    onClick={() => openConversation(index)}
                  >
                    <div className="flex justify-between align-top mb-[6px]">
                      <div className="flex gap-[10px]">
                        <img
                          src={
                            profiles &&
                            profilesData[index] &&
                            profilesData[index].picture !== ""
                              ? profilesData[index].picture
                              : "/images/paco.svg"
                          }
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/images/paco.svg";
                          }}
                          className="rounded-[8px]"
                          alt="paco pic"
                          width={40}
                          height={40}
                        />
                        <div className="flex flex-col gap-[5px] sm:gap-[1px] pt-[5px]">
                          <span className="text-[14px] leading-[16.94px] font-medium">
                            {profiles &&
                            profilesData[index] &&
                            profilesData[index].displayName !== ""
                              ? profilesData[index].displayName
                              : "Display Name"}
                          </span>
                          <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
                            {profiles &&
                            profilesData[index] &&
                            profilesData[index].handle !== ""
                              ? profilesData[index].handle
                              : "@lenshandle"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[#707070] leading-[12.1px] text-[12px] font-semibold">
                        {conversationDates[index] !== ""
                          ? moment(conversationDates[index]).format("h:mmA")
                          : ""}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-[11px] sm:text-[10px] text-[#000000] leading-[12px] font-medium">
                      {latestMessage[index]}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center h-full">
              <div className="hidden sm:flex flex-col gap-[11px] justify-center items-center">
                <Image
                  src="/images/discuss.svg"
                  className="cursor-pointer"
                  alt="new message"
                  width={24}
                  height={21}
                />
                <span className="leading-[16.94px] max-w-[174px] text-center font-medium text-[14px] text-black">
                  Select a conversation to start messaging
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col gap-[11px] justify-center items-center">
              <Image
                src="/images/discuss.svg"
                className="cursor-pointer"
                alt="new message"
                width={24}
                height={21}
              />
              <span className="leading-[16.94px] font-medium text-[14px] text-black">
                Enable Messages
              </span>
              <button
                className="rounded-[8px] bg-[#C6AAFF] hover:bg-[#351A6B] px-[17px] py-[8px] text-white leading-[16.94px] font-medium text-[14px]"
                onClick={createXMTPClient}
              >
                {connectingXMTP ? "Connecting..." : "Enable"}
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        className={`horizontal-box ${
          selectedConversation !== null ? "" : "sm:hidden"
        } flex-1 px-[12px]`}
      >
        {!messagesEnabled ? (
          <div className="flex flex-col gap-[5px] mt-[8px]"></div>
        ) : selectedConversation === 10000 && unactivatedUserProfile ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-start sm:gap-[18px] items-center py-[10px] px-[0px]">
              <Image
                src={"/images/arrow-left.svg"}
                className="hidden sm:block cursor-pointer"
                alt="paco pic"
                width={24}
                height={24}
                onClick={() => setSelectedConversation(null)}
              />
              <div className="flex gap-[10px]">
                <Image
                  src={unactivatedUserProfile.picture}
                  alt="paco pic"
                  width={43}
                  height={43}
                />
                <div className="flex flex-col gap-[2px] pt-[5px]">
                  <span className="text-[14px] leading-[16.94px] font-medium">
                    {unactivatedUserProfile.displayName}
                  </span>
                  <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
                    {unactivatedUserProfile.handle}
                  </span>
                </div>
              </div>
            </div>
            <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
            <div className="flex-1 flex flex-col justify-center items-center align-middle">
              <Image
                src="/images/mail.svg"
                className="cursor-pointer"
                alt="new message"
                width={28}
                height={28}
              />
              <span className="leading-[16.94px] text-center font-bold text-[14px] text-black mt-[6px]">
                User is not on XMTP
              </span>
            </div>
            <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
            <div className="flex py-[12px] gap-[5px] w-full items-center">
              <input
                className="form-input rounded-[8px] p-[10px] border-[1px] border-[#E4E4E7] w-full"
                placeholder="Type your message here.."
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                value={inputMessage}
                disabled
              />
              <button
                className="rounded-[8px] bg-[#F4F4F5] p-[9px] h-fit"
                disabled
              >
                <Image
                  src={"/images/share.svg"}
                  alt="paco pic"
                  width={24}
                  height={24}
                />
              </button>
              <button
                className="px-[18px] sm:px-[10px] py-[10px] bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] flex w-fit gap-[7px] h-fit items-center"
                onClick={handleSendMessage}
                disabled
              >
                <span className="text-[15px] text-white leading-none sm:hidden">
                  Send
                </span>
                <Image
                  src={"/images/arrow-right.svg"}
                  alt="paco pic"
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </div>
        ) : selectedConversation !== null ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-start sm:gap-[18px] items-center py-[10px] px-[0px]">
              <Image
                src={"/images/arrow-left.svg"}
                className="hidden sm:block cursor-pointer"
                alt="paco pic"
                width={24}
                height={24}
                onClick={() => setSelectedConversation(null)}
              />
              <div className="flex gap-[10px]">
                <Link
                  href={`/other-user-follow/?handle=${profilesData[selectedConversation].userLink}`}
                >
                  <Image
                    src={profilesData[selectedConversation].picture}
                    alt="paco pic"
                    width={43}
                    height={43}
                    className="rounded-[8px]"
                  />
                </Link>
                <div className="flex flex-col gap-[2px] pt-[5px]">
                  <span className="text-[14px] leading-[16.94px] font-medium">
                    {profiles &&
                    profilesData[selectedConversation].displayName !== ""
                      ? profilesData[selectedConversation].displayName
                      : "Display Name"}
                  </span>
                  <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
                    {profiles &&
                    profilesData[selectedConversation].handle !== ""
                      ? profilesData[selectedConversation].handle
                      : "@lenshandle"}
                  </span>
                </div>
              </div>
            </div>
            <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
            <div
              className="flex-1 flex flex-col justify-end sm:justify-start scrollbar-hide pt-[10px]"
              id="scrollableDiv"
            >
              <span className="text-[12px] leading-[12.1px] font-medium self-center mb-[15px] sm:mt-[15px]">
                Today
              </span>
              {activeMessages.map((message: DecodedMessage, index) => {
                return (
                  <div
                    key={index}
                    className={`rounded-[8px] whitespace-pre-wrap min-w-[200px] sm:min-w-[150px] max-w-[450px] text-[12px] laptop-x:max-w-[350px] sm:max-w-[262px] laptop-x:text-[14px] mb-[12px] relative font-normal leading-[20px] p-[11px] py-[9px] 
                      pr-[48px] sm:px-[8px] sm:pr-[9px] sm:pb-[23px] ${
                        session?.type === SessionType.WithProfile &&
                        message.senderAddress === session.address
                          ? "self-end bg-[#C6AAFF] text-white"
                          : "self-start bg-[#F4F4F5]"
                      } `}
                  >
                    {message.content}
                    <span className="absolute right-[6px] bottom-[0px] text-[10px]">
                      {moment(message.sent).format("h:mmA")}
                    </span>
                  </div>
                );
              })}
              <div id="bottomMarker"></div>
            </div>
            <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
            <div className="flex py-[12px] gap-[5px] w-full items-center">
              <input
                className="form-input rounded-[8px] p-[10px] border-[1px] border-[#E4E4E7] w-full"
                placeholder="Type your message here.."
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                value={inputMessage}
              />
              <button className="rounded-[8px] bg-[#F4F4F5] p-[9px] h-fit">
                <Image
                  src={"/images/share.svg"}
                  alt="paco pic"
                  width={24}
                  height={24}
                />
              </button>
              <button
                className="px-[18px] sm:px-[10px] py-[10px] bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] flex w-fit gap-[7px] h-fit items-center"
                onClick={handleSendMessage}
              >
                <span className="text-[15px] text-white leading-none sm:hidden">
                  Send
                </span>
                <Image
                  src={"/images/arrow-right.svg"}
                  alt="paco pic"
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col gap-[11px] justify-center items-center">
              <Image
                src="/images/discuss.svg"
                className="cursor-pointer"
                alt="new message"
                width={24}
                height={21}
              />
              <span className="leading-[16.94px] font-medium text-[14px] text-black">
                Select a conversation to start messaging
              </span>
            </div>
          </div>
        )}
      </div>
      {isNewConversationModalOpen && (
        <div className="fixed h-screen w-screen top-0 left-0 inset-0 z-[10000] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="w-full flex justify-center align-middle">
            <NewConversation
              handleCloseModal={handleCloseNewConversationModal}
              handleStartConversation={handleNewConversation}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMessageOpenChat;
