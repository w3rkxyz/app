"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import DownloadIcon from "@/icons/DownloadIcon";
import CreateContractModal from "../create-contract-modal/create-contract-modal";
import OpenMessage from "./OpenMessage";

interface Message {
  id: number;
  sender: string;
  text: string;
}

const MyMessageOpenChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const handleEnterContractClick = () => {
    setIsContractModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsContractModalOpen(false);
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
        id: messages.length + 1,
        sender: "User",
        text: inputMessage,
      };

      setMessages([...messages, newMessage]);

      setInputMessage("");
    }
  };

  const handleMessageOpen = () => {
    setIsOpen(true);
  };

  return (
    <div className="pt-[181px] sm:pt-[90px] mb-[112px] sm:mb-[30px]">
      <div className="custom-container">
        <div className="flex sm:flex-col items-center gap-[25px] h-[675px] sm:h-[428px]">
          <div className="left-panel-message-section sm:hidden w-[250px] flex-shrink-0 sm:w-full sm:h-[428px] overflow-auto bg-[#FFFFFF]/50 rounded-[20px] px-[23px] pt-[26px] pb-[28px]">
            <h2 className="text-[20px] text-center font-semibold leading-5 tracking-[-1%] font-secondary pb-[15px]">
              Messages
            </h2>
            <div className="mb-[10px]">
              <input
                type="text"
                placeholder="[search]"
                className="h-[31px] w-[204px] sm:w-full rounded-[8px] pl-2 font-secondary font-medium text-[14px] leading-[20px] tracking-[-1%] text-[#00000080] "
              />
            </div>

            <div
              className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
              onClick={handleMessageOpen}
            >
              <div className="-mt-1">
                <Image
                  src="/images/head.svg"
                  alt="message model image"
                  className="w-[40px] h-[40px] mr-3"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="pt-2 sm:pt-1">
                  <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                    adam.lens
                  </p>
                  <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                    [message content goes here]
                  </p>
                </div>
              </div>
            </div>

            <div
              className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
              onClick={handleMessageOpen}
            >
              <div className="-mt-1">
                <Image
                  src="/images/head.svg"
                  alt="message model image"
                  className="w-[40px] h-[40px] mr-3"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="pt-2 sm:pt-1">
                  <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                    adam.lens
                  </p>
                  <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                    [message content goes here]
                  </p>
                </div>
              </div>
            </div>
            <div
              className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
              onClick={handleMessageOpen}
            >
              <div className="-mt-1">
                <Image
                  src="/images/head.svg"
                  alt="message model image"
                  className="w-[40px] h-[40px] mr-3"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="pt-2 sm:pt-1">
                  <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                    adam.lens
                  </p>
                  <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                    [message content goes here]
                  </p>
                </div>
              </div>
            </div>
            <div
              className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
              onClick={handleMessageOpen}
            >
              <div className="-mt-1">
                <Image
                  src="/images/head.svg"
                  alt="message model image"
                  className="w-[40px] h-[40px] mr-3"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="pt-2 sm:pt-1">
                  <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                    adam.lens
                  </p>
                  <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                    [message content goes here]
                  </p>
                </div>
              </div>
            </div>
            <div
              className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
              onClick={handleMessageOpen}
            >
              <div className="-mt-1">
                <Image
                  src="/images/head.svg"
                  alt="message model image"
                  className="w-[40px] h-[40px] mr-3"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="pt-2 sm:pt-1">
                  <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                    adam.lens
                  </p>
                  <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                    [message content goes here]
                  </p>
                </div>
              </div>
            </div>
            <div
              className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
              onClick={handleMessageOpen}
            >
              <div className="-mt-1">
                <Image
                  src="/images/head.svg"
                  alt="message model image"
                  className="w-[40px] h-[40px] mr-3"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="pt-2 sm:pt-1">
                  <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                    adam.lens
                  </p>
                  <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                    [message content goes here]
                  </p>
                </div>
              </div>
            </div>
            <div
              className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
              onClick={handleMessageOpen}
            >
              <div className="-mt-1">
                <Image
                  src="/images/head.svg"
                  alt="message model image"
                  className="w-[40px] h-[40px] mr-3"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="pt-2 sm:pt-1">
                  <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                    adam.lens
                  </p>
                  <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                    [message content goes here]
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel-input-section sm:hidden flex-1 sm:w-full bg-[#FFFFFF]/50 h-full sm:min-h-[428px] sm:max-h-[428px] rounded-[20px] p-[27px] sm:p-4 flex flex-col justify-between">
            <div className="bg-white h-[50px] sm:h-[46px] rounded-[10px] pl-3 text py-4 sm:py-2 w-full flex justify-between items-center">
              <p className="text-[#000000] font-semibold text-[14px] font-secondary leading-[20px] tracking-[-1%]">
                adam.lens
              </p>
              <button
                onClick={handleEnterContractClick}
                className="text-[14px] sm:text-[10px] h-[38px] sm:h-[26px] font-secondary font-semibold leading-[20px] sm:leading-[14px] tracking-[-1%] sm:tracking-[-3%] bg-[#A274FF]/50 hover:bg-[#120037] duration-300 text-white mr-2 py-[9px] sm:py-[6px] px-[14px] sm:px-[10px] rounded-[6px]"
              >
                Enter Contract
              </button>

              {isContractModalOpen && (
                <div className="fixed inset-0 sm:w-full z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
                  <div className="w-full">
                    <CreateContractModal
                      closeContractModal={handleCloseModal}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-y-auto overflow-x-hidden">
              <div>
                {messages.map((message) => (
                  <div key={message.id} className="flex justify-end">
                    <div
                      className="mb-[10px] h-auto bg-[#A274FF1A] rounded-[10px]"
                      style={{
                        width: "fit-content",
                        maxWidth: "315px",
                      }}
                    >
                      <div>
                        <div className="py-[15px]">
                          <p className="text-[14px] px-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%]">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="[type message here]"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="rounded-[10px] py-4 !h-[50px] sm:h-[48px] sm:py-2 pl-3 pr-[200px] w-full text-black font-semibold text-[14px]"
                />
                <div className="absolute top-[6px] right-[8px] sm:top-[5px]">
                  <div className="flex justify-end items-center gap-2">
                    <button className="w-[38px] sm:w-[24px] h-[38px] sm:h-[24px]  sm:p-1 border-[2px] sm:border-none rounded-[6px] border-[#000000]/50 flex justify-center items-center">
                      <DownloadIcon />
                    </button>
                    <button
                      className="text-[14px] h-[38px]  sm:w-[40px] sm:h-[40px]  font-secondary font-semibold leading-[20px] tracking-[-1%] bg-[#A274FF]/50 hover:bg-[#120037] duration-300 text-white  py-[9px] sm:py-[10px] px-[12px] sm:px-3 rounded-[6px] flex items-center gap-2"
                      onClick={handleSendMessage}
                    >
                      <span className="inline sm:hidden">Send</span>
                      <Image
                        src="/images/arrow-right.svg"
                        alt="right arrow"
                        className=""
                        width={14}
                        height={20}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!isOpen && (
            <div className="left-panel-message-section hidden sm:block w-[250px] flex-shrink-0 sm:w-full sm:h-[428px] overflow-auto bg-[#FFFFFF]/50 rounded-[20px] px-[23px] pt-[26px] pb-[28px]">
              <h2 className="text-[20px] text-center font-semibold leading-5 tracking-[-1%] font-secondary pb-[15px]">
                Messages
              </h2>
              <div className="mb-[10px]">
                <input
                  type="text"
                  placeholder="[search]"
                  className="h-[31px] sm:w-full rounded-[8px] pl-2 font-secondary font-medium text-[14px] leading-[20px] tracking-[-1%] text-[#00000080] "
                />
              </div>
              <div
                className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
                onClick={handleMessageOpen}
              >
                <div className="-mt-1">
                  <Image
                    src="/images/head.svg"
                    alt="message model image"
                    className="w-[40px] h-[40px] mr-3"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <div className="pt-2 sm:pt-1">
                    <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                      adam.lens
                    </p>
                    <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                      [message content goes here]
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
                onClick={handleMessageOpen}
              >
                <div className="-mt-1">
                  <Image
                    src="/images/head.svg"
                    alt="message model image"
                    className="w-[40px] h-[40px] mr-3"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <div className="pt-2 sm:pt-1">
                    <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                      adam.lens
                    </p>
                    <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                      [message content goes here]
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
                onClick={handleMessageOpen}
              >
                <div className="-mt-1">
                  <Image
                    src="/images/head.svg"
                    alt="message model image"
                    className="w-[40px] h-[40px] mr-3"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <div className="pt-2 sm:pt-1">
                    <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                      adam.lens
                    </p>
                    <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                      [message content goes here]
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
                onClick={handleMessageOpen}
              >
                <div className="-mt-1">
                  <Image
                    src="/images/head.svg"
                    alt="message model image"
                    className="w-[40px] h-[40px] mr-3"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <div className="pt-2 sm:pt-1">
                    <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                      adam.lens
                    </p>
                    <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                      [message content goes here]
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
                onClick={handleMessageOpen}
              >
                <div className="-mt-1">
                  <Image
                    src="/images/head.svg"
                    alt="message model image"
                    className="w-[40px] h-[40px] mr-3"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <div className="pt-2 sm:pt-1">
                    <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                      adam.lens
                    </p>
                    <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                      [message content goes here]
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
                onClick={handleMessageOpen}
              >
                <div className="-mt-1">
                  <Image
                    src="/images/head.svg"
                    alt="message model image"
                    className="w-[40px] h-[40px] mr-3"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <div className="pt-2 sm:pt-1">
                    <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                      adam.lens
                    </p>
                    <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                      [message content goes here]
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]"
                onClick={handleMessageOpen}
              >
                <div className="-mt-1">
                  <Image
                    src="/images/head.svg"
                    alt="message model image"
                    className="w-[40px] h-[40px] mr-3"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <div className="pt-2 sm:pt-1">
                    <p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
                      adam.lens
                    </p>
                    <p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
                      [message content goes here]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isOpen && <OpenMessage />}
        </div>
      </div>
    </div>
  );
};

export default MyMessageOpenChat;
