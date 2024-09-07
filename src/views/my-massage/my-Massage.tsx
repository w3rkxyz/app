"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import NewConversation from "./newConversation";
import getCurrentTime from "@/utils/currentTime";
import { Client, Conversation, DecodedMessage } from "@xmtp/xmtp-js";
import {
  Profile,
  ProfileId,
  useSession,
  SessionType,
  useProfiles,
  useProfile,
  profileId,
  Session,
} from "@lens-protocol/react-web";
import toast from "react-hot-toast"; // Get the keys using a valid Signer. Save them somewhere secure.
import { useEthersSigner } from "@/utils/getSigner";
import moment from "moment";
import getLensProfileData, { UserProfile } from "@/utils/getLensProfile";
import Link from "next/link";
import { loadKeys, storeKeys } from "@/utils/xmtpHelpers";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import ConversationSkeleton from "@/components/reusable/ConversationSkeleton";
import {
  ContentTypeAttachment,
  AttachmentCodec,
  RemoteAttachmentCodec,
  ContentTypeRemoteAttachment,
} from "@xmtp/content-type-remote-attachment";
import { uploadFileToIPFS, uploadJsonToIPFS } from "@/utils/uploadToIPFS";
import axios from "axios";

const PREFIX = "lens.dev/dm";

const isLink = (text: string): boolean => {
  try {
    new URL(text); // Attempt to create a URL object
    return true; // If no error is thrown, it's a valid URL
  } catch {
    return false; // If an error is thrown, it's not a valid URL
  }
};

interface ConversationProp {
  user: UserProfile;
  conversation: Conversation;
  lastMessage: string;
  lastMessageTime: string | Date;
}

interface TempConversatioData {
  conversation: Conversation;
  lastMessage: string;
  lastMessageTime: string | Date;
}

interface StringIndexedObject {
  [key: string]: TempConversatioData;
}

function groupMessagesByWhatsAppDate(messages: DecodedMessage<any>[]) {
  const groupedMessages: { date: string; messages: DecodedMessage[] }[] = [];

  messages.forEach((message) => {
    const now = moment().startOf("day");
    const inputDate = moment(message.sent).startOf("day");
    let dateKey: string;

    if (now.isSame(inputDate, "day")) {
      dateKey = "Today";
    } else if (now.diff(inputDate, "days") < 7) {
      dateKey = inputDate.format("dddd");
    } else {
      dateKey = inputDate.format("MMM D");
    }

    const existingGroup = groupedMessages.find(
      (group) => group.date === dateKey
    );

    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groupedMessages.push({ date: dateKey, messages: [message] });
    }
  });

  return groupedMessages;
}

const buildConversationId = (profileIdA: string, profileIdB: string) => {
  const profileIdAParsed = parseInt(profileIdA, 16);
  const profileIdBParsed = parseInt(profileIdB, 16);

  return profileIdAParsed < profileIdBParsed
    ? `${PREFIX}/${profileIdA}-${profileIdB}`
    : `${PREFIX}/${profileIdB}-${profileIdA}`;
};

function getOtherId(id: string, url: string): string {
  const ids = url.split("/").pop()?.split("-") || [];
  return ids.find((item) => item !== id) || "";
}

function isConversationParticipant(id: string, url: string): boolean {
  const ids = url.split("/").pop()?.split("-") || [];
  return ids.includes(id);
}

const sortMessages = (messages: ConversationProp[]): ConversationProp[] => {
  return messages.sort((a, b) => {
    if (a.lastMessageTime === "") return 1; // Move empty to the end
    if (b.lastMessageTime === "") return -1; // Move empty to the end
    return (
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime()
    ); // Sort by most recent
  });
};

const MyMessageOpenChat = () => {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle");
  const { address } = useAccount();
  let keys = loadKeys(address as string);
  const [showSkeleleton, setShowSkeleton] = useState(keys !== undefined);
  const [messagesEnabled, setMessagesEnabled] = useState(keys !== undefined);
  const { data: session, loading: sessionLoading } = useSession();
  const signer = useEthersSigner();
  const [chatUserIds, setChatUserIds] = useState<ProfileId[]>([]);
  const { data: profile, loading: profileLoading } = useProfile({
    forHandle: `lens/${handle}`,
  });
  const { data: profiles } = useProfiles({
    where: {
      profileIds: chatUserIds,
    },
  });
  const [loading, setLoading] = useState(false);
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
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [activeConversationUserHandle, setActiveConversationUserHandle] =
    useState<string>("");
  const [connectingXMTP, setConnectingXMTP] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [showMessagesMobile, setShowMessagesMobile] = useState(false);
  const [xmtp, setXmtp] = useState<Client>();
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const [conversationDates, setConversationDates] = useState<(Date | string)[]>(
    []
  );
  const [latestMessage, setLatestMessage] = useState<string[]>([]);
  const [unactivatedUserProfile, setUnactivatedUserProfile] = useState<any>();
  const [conversationData, setConversationData] =
    useState<StringIndexedObject>();
  const [conversations, setConversations] = useState<ConversationProp[] | []>(
    []
  );
  const [contactProfile, setContactProfile] = useState<UserProfile | null>(
    null
  );
  const [isNewConversation, setIsNewConversation] = useState(false);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [activeAttachments, setActiveAttachments] = useState<any>({});
  // const [conversationUpdateState, setConversationUpdateState] = useState(false);
  // const clientOptions = { env: "production" };

  useEffect(() => {
    let keys = loadKeys(address as string);
    const initXMTP = async () => {
      if (address) {
        if (keys) {
          const client = await Client.create(null, {
            env: "production",
            privateKeyOverride: keys,
          });
          client.registerCodec(new AttachmentCodec());
          client.registerCodec(new RemoteAttachmentCodec());
          setXmtp(client);
          handleIncomingMessages(client);

          if (session?.type === SessionType.WithProfile) {
            processConversations(client, session);
          }

          const stream = await client.conversations.stream();
          for await (const conversation of stream) {
            console.log("This ran!");
            const conversations = await client.conversations.list();
            if (session?.type === SessionType.WithProfile) {
              await processConversations(client, session);
              console.log("Finished running");
              // setSelectedConversation(conversations.length - 1);
              setIsNewConversation(true);
            }
          }
        }
      }
    };
    initXMTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    console.log("Session updated");
    if (profile) {
      const profileData = getLensProfileData(profile);
      setContactProfile(profileData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const processConversations = async (client: Client, session: Session) => {
    const conversations = await client.conversations.list();
    var conversationsFilteredById: Conversation<string | undefined>[] = [];
    var ids: ProfileId[] = [];
    var dates: (Date | string)[] = [];
    var recentMessage: string[] = [];
    var dataById: StringIndexedObject = {};

    console.log("Started running");

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
          dataById[otherUserID] = {
            lastMessageTime:
              lastMessage && lastMessage.length > 0
                ? lastMessage[lastMessage.length - 1].sent
                : "",
            lastMessage:
              lastMessage && lastMessage.length > 0
                ? (lastMessage[lastMessage.length - 1].content as string)
                : "",
            conversation: conversation,
          };
        }
      }
    }
    setMessages(conversationsFilteredById);
    setChatUserIds(ids);
    setConversationDates(dates);
    setLatestMessage(recentMessage);
    setConversationData(dataById);
    setShowSkeleton(false);
    setMessagesEnabled(true);
    // if (messagesEnabled) setConversationUpdateState(!conversationUpdateState);
  };

  const handleIncomingMessages = async (client: Client) => {
    for await (const message of await client.conversations.streamAllMessages()) {
      if (session?.type === SessionType.WithProfile) {
        processConversations(client, session);
      }

      const scrollableDiv = document.getElementById("scrollableDiv");
      const bottomMarker = document.getElementById("bottomMarker");

      bottomMarker?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const createXMTPClient = async () => {
    if (signer) {
      setConnectingXMTP(true);
      let keys = loadKeys(address as string);
      if (!keys) {
        keys = await Client.getKeys(signer, {
          env: "production",
          skipContactPublishing: true,
          persistConversations: false,
        });
        storeKeys(address as string, keys);
      }
      const client = await Client.create(null, {
        env: "production",
        privateKeyOverride: keys,
      });
      client.registerCodec(new AttachmentCodec());
      client.registerCodec(new RemoteAttachmentCodec());

      console.log("reached here 1");
      handleIncomingMessages(client);
      console.log("reached here 2");

      setXmtp(client);
      if (session?.type === SessionType.WithProfile) {
        processConversations(client, session);
      }

      const stream = await client.conversations.stream();
      for await (const conversation of stream) {
        console.log("This ran cause i started a new conversation!");
        const conversations = await client.conversations.list();
        if (session?.type === SessionType.WithProfile) {
          await processConversations(client, session);
          // setSelectedConversation(conversations.length - 1);
          setIsNewConversation(true);
        }
      }
    }
  };

  const updateMessages = async () => {
    if (xmtp) {
      if (session?.type === SessionType.WithProfile) {
        processConversations(xmtp, session);
      }
    }
  };

  // const openConversation = async (index: number) => {
  //   const conversationMessages = await messages[index].messages();
  //   setActiveMessages(conversationMessages);
  //   setSelectedConversation(index);

  //   for await (const message of await messages[index].streamMessages()) {
  //     setActiveMessages((prevMessages) => {
  //       const updatedMessages = [...prevMessages, message];
  //       return updatedMessages;
  //     });
  //   }
  // };

  const openConversation = async (
    conversation: ConversationProp,
    index: number
  ) => {
    const conversationMessages = await conversation.conversation.messages();
    setActiveMessages(groupMessagesByWhatsAppDate(conversationMessages));
    var attachments: {
      [key: string]: any;
    } = {};
    const allPromises = groupMessagesByWhatsAppDate(conversationMessages).map(
      (messageGroup, groupIndex) => {
        return Promise.all(
          messageGroup.messages.map(async (message, messageIndex) => {
            console.log(message.content);
            if (isLink(message.content)) {
              try {
                const response = await axios.get(message.content);
                const data = response.data;
                attachments[message.content] = data;
              } catch (error) {
                console.error(
                  "Error fetching data for:",
                  message.content,
                  error
                );
              }
            } else {
              return message;
            }
          })
        );
      }
    );

    // Wait for all groups and all messages to finish
    await Promise.all(allPromises);
    setActiveAttachments(attachments);

    setSelectedConversation(index);
    setActiveConversationUserHandle(conversation.user.handle);

    for await (const message of await conversation.conversation.streamMessages()) {
      const conversationMessages = await conversation.conversation.messages();
      setAttachmentsLoading(true);
      setActiveMessages(groupMessagesByWhatsAppDate(conversationMessages));
      var attachments: {
        [key: string]: any;
      } = {};
      const allPromises = groupMessagesByWhatsAppDate(conversationMessages).map(
        (messageGroup, groupIndex) => {
          return Promise.all(
            messageGroup.messages.map(async (message, messageIndex) => {
              console.log(message.content);
              if (isLink(message.content)) {
                try {
                  const response = await axios.get(message.content);
                  const data = response.data;
                  attachments[message.content] = data;
                } catch (error) {
                  console.error(
                    "Error fetching data for:",
                    message.content,
                    error
                  );
                }
              } else {
                return message;
              }
            })
          );
        }
      );

      // Wait for all groups and all messages to finish
      await Promise.all(allPromises);
      setActiveAttachments(attachments);
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
    if (inputMessage.trim() !== "" && selectedConversation !== null) {
      conversations[selectedConversation].conversation.send(inputMessage, {
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
        conversations.map((message, index) => {
          if (
            conversation.context?.conversationId ===
            message.conversation.context?.conversationId
          ) {
            openConversation(message, index);
          }
        });
      } else {
        setUnactivatedUserProfile(getLensProfileData(profile));
        setSelectedConversation(10000);
      }
    }
    setIsNewConversationModalOpen(false);
  };

  useEffect(() => {
    console.log("Profiles useEffect ran");
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
      var allConversations: ConversationProp[] = [];
      profiles.map((profile) => {
        var data = getLensProfileData(profile);
        temp.push(data);
        if (conversationData) {
          var conversation: ConversationProp = {
            user: data,
            conversation: conversationData[profile.id].conversation,
            lastMessage: isLink(conversationData[profile.id].lastMessage)
              ? "attachement"
              : conversationData[profile.id].lastMessage,
            lastMessageTime: conversationData[profile.id].lastMessageTime,
          };
          allConversations.push(conversation);
        }
      });
      const sortedConversations = sortMessages(allConversations);
      setProfilesData(temp);
      if (isNewConversation) {
        const lastConvo = sortedConversations.pop();
        sortedConversations.unshift(lastConvo as ConversationProp);
        setConversations(sortedConversations);
        if (sortedConversations[0]) openConversation(sortedConversations[0], 0);
        setIsNewConversation(false);
      } else {
        setConversations(sortedConversations);
        sortedConversations.map((conversation, index) => {
          if (conversation.user.handle === activeConversationUserHandle) {
            openConversation(conversation, index);
          }
        });
      }
      if (!messagesEnabled) {
        setMessagesEnabled(true);
        setConnectingXMTP(false);
      }
      if (contactProfile !== null) {
        for (let index = 0; index < sortedConversations.length; index++) {
          const conversation = sortedConversations[index];
          if (conversation.user.userLink === contactProfile.userLink) {
            openConversation(conversation, index);
            return;
          }
        }

        if (profile) {
          handleNewConversation(profile);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles, conversationDates]);

  useEffect(() => {
    const scrollableDiv = document.getElementById("scrollableDiv");
    const bottomMarker = document.getElementById("bottomMarker");

    bottomMarker?.scrollIntoView({ behavior: "instant" });
  }, [selectedConversation]);

  const getFileCategory = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) {
      return "img"; // Images
    } else if (mimeType.startsWith("video/")) {
      return "vid"; // Videos
    } else {
      return "doc"; // Everything else
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0]; // Get the uploaded file
    const attachment = event.target.files;

    if (!file) {
      console.error("No file selected.");
      return;
    }

    const attachmentLink = await uploadFileToIPFS(attachment);

    const attachmentData = {
      name: file?.name,
      type: getFileCategory(file?.type),
      link: attachmentLink,
    };

    const attachmentUrl = await uploadJsonToIPFS(attachmentData);

    if (selectedConversation !== null) {
      conversations[selectedConversation].conversation.send(attachmentUrl, {
        timestamp: new Date(),
      });
    }
  };

  useEffect(() => {
    console.log("there was an update");
    console.log("Active Attachments: ", activeAttachments);
  }, [activeAttachments]);

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
              {showSkeleleton
                ? [0, 1, 2, 3, 4, 5].map((item) => {
                    return <ConversationSkeleton key={item} />;
                  })
                : conversations.length > 0 &&
                  conversations.map((conversation, index) => {
                    return (
                      <div
                        key={index}
                        className={`p-[8px] w-full ${
                          selectedConversation === index
                            ? "bg-[#E4E4E7]"
                            : "bg-[#FAFAFA]"
                        } rounded-[8px] cursor-pointer`}
                        onClick={() => openConversation(conversation, index)}
                      >
                        <div className="flex justify-between align-top mb-[6px]">
                          <div className="flex gap-[10px]">
                            <Image
                              src={conversation.user.picture}
                              onError={(e) => {
                                (
                                  e.target as HTMLImageElement
                                ).src = `https://api.hey.xyz/avatar?id=${conversation.user.id}`;
                              }}
                              className="rounded-[8px]"
                              alt="paco pic"
                              width={40}
                              height={40}
                            />
                            <div className="flex flex-col gap-[5px] sm:gap-[1px] pt-[5px]">
                              <span className="text-[14px] leading-[16.94px] font-medium">
                                {conversation.user.displayName}
                              </span>
                              <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
                                {conversation.user.handle}
                              </span>
                            </div>
                          </div>
                          <span className="text-[#707070] leading-[12.1px] text-[12px] font-semibold">
                            {conversation.lastMessageTime !== ""
                              ? moment(conversation.lastMessageTime).format(
                                  "h:mmA"
                                )
                              : ""}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-[11px] sm:text-[10px] text-[#000000] leading-[12px] font-medium">
                          {conversation.lastMessage}
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
                  href={`/other-user-follow/?handle=${conversations[selectedConversation].user.userLink}`}
                >
                  <Image
                    src={conversations[selectedConversation].user.picture}
                    onError={(e) => {
                      (
                        e.target as HTMLImageElement
                      ).src = `https://api.hey.xyz/avatar?id=${conversations[selectedConversation].user.id}`;
                    }}
                    alt="paco pic"
                    width={43}
                    height={43}
                    className="rounded-[8px]"
                  />
                </Link>
                <div className="flex flex-col gap-[2px] pt-[5px]">
                  <span className="text-[14px] leading-[16.94px] font-medium">
                    {conversations[selectedConversation].user.displayName}
                  </span>
                  <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
                    {conversations[selectedConversation].user.handle}
                  </span>
                </div>
              </div>
            </div>
            <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
            <div
              className="flex-1 flex flex-col justify-end sm:justify-start scrollbar-hide pt-[10px]"
              id="scrollableDiv"
            >
              {activeMessages.map((messages, index: number) => {
                return (
                  <>
                    <span className="text-[12px] leading-[12.1px] font-medium self-center mb-[15px] sm:mt-[15px]">
                      {messages.date}
                    </span>
                    {messages.messages.map(
                      (message: DecodedMessage, index: number) => {
                        return !isLink(message.content) ? (
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
                        ) : activeAttachments[message.content] ? (
                          <a
                            target="_blank"
                            href={activeAttachments[message.content].link}
                            download={activeAttachments[message.content].name}
                            className={`rounded-[8px] whitespace-pre-wrap min-w-[200px] sm:min-w-[150px] max-w-[450px] text-[12px] laptop-x:max-w-[350px] sm:max-w-[262px] laptop-x:text-[14px] mb-[12px] relative font-normal leading-[20px] p-[11px] py-[9px] 
                      pr-[48px] sm:px-[8px] sm:pr-[9px] sm:pb-[23px] flex items-center bg-[#E4E4E7] ${
                        session?.type === SessionType.WithProfile &&
                        message.senderAddress === session.address
                          ? "self-end"
                          : "self-start"
                      } `}
                          >
                            <Image
                              src="/images/add-photo.svg"
                              className={`sm:w-[20px] sm:h-[20px] mr-[10px]`}
                              alt="user icon"
                              width={24}
                              height={24}
                            />
                            <span>
                              {activeAttachments[message.content].name}
                            </span>
                            <span className="absolute right-[6px] bottom-[0px] text-[10px]">
                              {moment(message.sent).format("h:mmA")}
                            </span>
                          </a>
                        ) : (
                          <div
                            key={index}
                            className={`rounded-[8px] whitespace-pre-wrap min-w-[200px] sm:min-w-[150px] max-w-[450px] text-[12px] laptop-x:max-w-[350px] sm:max-w-[262px] laptop-x:text-[14px] mb-[12px] relative font-normal leading-[20px] p-[11px] py-[9px] 
                      pr-[48px] sm:px-[8px] sm:pr-[9px] sm:pb-[23px] flex items-center bg-[#E4E4E7] ${
                        session?.type === SessionType.WithProfile &&
                        message.senderAddress === session.address
                          ? "self-end"
                          : "self-start"
                      } `}
                          >
                            <span>Loading...</span>
                            <span className="absolute right-[6px] bottom-[0px] text-[10px]">
                              {moment(message.sent).format("h:mmA")}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </>
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
              <label
                htmlFor="file_upload"
                className="rounded-[8px] bg-[#F4F4F5] p-[9px] h-fit inline-flex items-center cursor-pointer"
              >
                <Image
                  src={"/images/share.svg"}
                  alt="paco pic"
                  width={24}
                  height={24}
                />
                <input
                  id="file_upload"
                  type="file"
                  name="file_upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
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
