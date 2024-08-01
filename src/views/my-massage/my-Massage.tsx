"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import DownloadIcon from "@/icons/DownloadIcon";
import CreateContractModal from "../create-contract-modal/create-contract-modal";
import OpenMessage from "./OpenMessage";
import NewConversation from "./newConversation";
import getCurrentTime from "@/utils/currentTime";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
}

const placeholderMessages: Message[][] = [
  [
    {
      id: 1,
      sender: "me",
      time: "11:20am",
      text: "Hey! You’re really cool would like to connect asap!",
    },
    {
      id: 2,
      sender: "tom",
      time: "11:25am",
      text: `Hey! Really cool to see your service listing. 
Would be great to connect and better understand your skill-sets... 
When would you be available for a call?`,
    },
  ],
  [
    {
      id: 3,
      sender: "me",
      time: "12:20am",
      text: "How are you man!",
    },
    {
      id: 4,
      sender: "dan",
      time: "1:25am",
      text: `Doing great! What's up?`,
    },
  ],
  [
    {
      id: 5,
      sender: "me",
      time: "6:20am",
      text: "Good morning, we need to talk.",
    },
    {
      id: 6,
      sender: "emmanuel",
      time: "11:25am",
      text: `Hey...`,
    },
    {
      id: 7,
      sender: "emmanuel",
      time: "11:25am",
      text: `about what?`,
    },
  ],
];

const MyMessageOpenChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[][]>(placeholderMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [messagesEnabled, setMessagesEnabled] = useState(false);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [showMessagesMobile, setShowMessagesMobile] = useState(false);

  // const handleEnterContractClick = () => {
  //   setIsContractModalOpen(true);
  // };

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
    if (inputMessage.trim() !== "") {
      const newMessage = {
        id: messages[selectedConversation as number].length + 1,
        sender: "me",
        text: inputMessage,
        time: getCurrentTime(),
      };

      var allmessages = messages;
      allmessages[selectedConversation as number].push(newMessage);

      setMessages(allmessages);

      setInputMessage("");
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleNewConversation = (event: any) => {
    if (event.key === "Enter") {
      handleCloseNewConversationModal();
      setShowMessagesMobile(true);
    }
  };

  // const handleMessageOpen = () => {
  //   setIsOpen(true);
  // };

  return (
    <div className="pt-[107px] sm:pt-[75px] px-[156px] sm:px-[16px] flex gap-[5px] mb-[55px]">
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
              {[0, 1, 2].map((id, index) => {
                return (
                  <div
                    key={index}
                    className={`p-[8px] w-full ${
                      selectedConversation === id
                        ? "bg-[#E4E4E7]"
                        : "bg-[#FAFAFA]"
                    } rounded-[8px] cursor-pointer`}
                    onClick={() => setSelectedConversation(id)}
                  >
                    <div className="flex justify-between align-top mb-[6px]">
                      <div className="flex gap-[10px]">
                        <Image
                          src={"/images/paco.svg"}
                          alt="paco pic"
                          width={40}
                          height={40}
                        />
                        <div className="flex flex-col gap-[5px] sm:gap-[1px] pt-[5px]">
                          <span className="text-[14px] leading-[16.94px] font-medium">
                            Display Name
                          </span>
                          <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
                            lens.handle
                          </span>
                        </div>
                      </div>
                      <span className="text-[#707070] leading-[12.1px] text-[12px] font-semibold">
                        4m ago
                      </span>
                    </div>
                    <p className="line-clamp-1 text-[11px] sm:text-[10px] text-[#000000] leading-[12px] font-medium">
                      {messages[id][messages[id].length - 1].text}
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
                onClick={() => setMessagesEnabled(true)}
              >
                Enable
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
                <Image
                  src={"/images/paco.svg"}
                  alt="paco pic"
                  width={43}
                  height={43}
                />
                <div className="flex flex-col gap-[2px] pt-[5px]">
                  <span className="text-[14px] leading-[16.94px] font-medium">
                    Display Name
                  </span>
                  <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
                    lens.handle
                  </span>
                </div>
              </div>
            </div>
            <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
            <div className="flex-1 flex flex-col justify-end sm:justify-start">
              <span className="text-[12px] leading-[12.1px] font-medium self-center mb-[15px] sm:mt-[15px]">
                Today
              </span>
              {messages[selectedConversation as number].map(
                (message: Message, index) => {
                  return (
                    <div
                      key={index}
                      className={`rounded-[8px] whitespace-pre-wrap min-w-[200px] sm:min-w-[150px] max-w-[450px] text-[12px] laptop-x:max-w-[350px] sm:max-w-[262px] laptop-x:text-[14px] mb-[12px] relative font-normal leading-[20px] p-[11px] py-[9px] 
                      pr-[48px] sm:px-[8px] sm:pr-[9px] sm:pb-[23px] ${
                        message.sender === "me"
                          ? "self-end bg-[#C6AAFF] text-white"
                          : "self-start bg-[#F4F4F5]"
                      } `}
                    >
                      {message.text}
                      <span className="absolute right-[6px] bottom-[0px] text-[10px]">
                        {message.time}
                      </span>
                    </div>
                  );
                }
              )}
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
        <div className="fixed inset-0 z-[99991] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="w-full flex justify-center align-middle">
            <NewConversation
              handleCloseModal={handleCloseNewConversationModal}
              handleSend={handleNewConversation}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMessageOpenChat;
