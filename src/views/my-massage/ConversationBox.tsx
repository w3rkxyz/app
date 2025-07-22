"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useConversation } from "@/hooks/useConversation";
import { useXMTP } from "@/app/XMTPContext";
import ConversationInput from "./ConversationInput";
import ConversationMessages from "./ConversationMessages";
import ConversationHeader from "./ConversationHeader";

const ConversationBox = () => {
  const {
    activeConversation,
    setActiveConversation,
    notOnNetwork,
    invalidUser,
    messages,
    getMessages,
    loading: conversationLoading,
    syncing: conversationSyncing,
    streamMessages,
  } = useConversation();
  const { client } = useXMTP();
  const [inputMessage, setInputMessage] = useState("");

  const stopStreamRef = useRef<(() => void) | null>(null);

  const startStream = useCallback(async () => {
    stopStreamRef.current = await streamMessages();
  }, [streamMessages]);

  const stopStream = useCallback(() => {
    stopStreamRef.current?.();
    stopStreamRef.current = null;
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      stopStream();
      await getMessages(undefined, true);
      await startStream();
    };
    void loadMessages();
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id]);

  const handleSync = useCallback(async () => {
    stopStream();
    await getMessages(undefined, true);
    await startStream();
  }, [getMessages, startStream, stopStream]);

  useEffect(() => {}, [messages]);

  return (
    <div
      className={`horizontal-box ${
        activeConversation !== undefined ? "" : "sm:hidden"
      } flex-1 px-[12px]`}
    >
      {!client ? (
        <div className="flex flex-col gap-[5px] mt-[8px]"></div>
      ) : notOnNetwork && invalidUser ? (
        <div className="flex flex-col h-full">
          <div className="flex justify-start sm:gap-[18px] items-center py-[10px] px-[0px]">
            <Image
              src={"/images/arrow-left.svg"}
              className="hidden sm:block cursor-pointer"
              alt="paco pic"
              width={24}
              height={24}
              onClick={() => setActiveConversation(undefined)}
            />
            <div className="flex gap-[10px]">
              <Image src={invalidUser.picture} alt="paco pic" width={43} height={43} />
              <div className="flex flex-col gap-[2px] pt-[5px]">
                <span className="text-[14px] leading-[16.94px] font-medium">
                  {invalidUser.displayName}
                </span>
                <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
                  {invalidUser.handle}
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
              disabled
            />
            <button className="rounded-[8px] bg-[#F4F4F5] p-[9px] h-fit" disabled>
              <Image src={"/images/share.svg"} alt="paco pic" width={24} height={24} />
            </button>
            <button
              className="px-[18px] sm:px-[10px] py-[10px] bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] flex w-fit gap-[7px] h-fit items-center"
              disabled
            >
              <span className="text-[15px] text-white leading-none sm:hidden">Send</span>
              <Image src={"/images/arrow-right.svg"} alt="paco pic" width={16} height={16} />
            </button>
          </div>
        </div>
      ) : activeConversation !== undefined ? (
        <div className="flex flex-col h-full">
          <ConversationHeader />
          <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
          <ConversationMessages messages={messages} />
          <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
          <ConversationInput />
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
  );
};

export default ConversationBox;
