"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
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
    streamMessages,
  } = useConversation();
  const { client } = useXMTP();

  const stopStreamRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadMessages = async () => {
      if (!client || !activeConversation) {
        return;
      }

      stopStreamRef.current?.();
      stopStreamRef.current = null;

      await getMessages(undefined, true);
      if (!mounted) {
        return;
      }
      stopStreamRef.current = await streamMessages();
    };

    void loadMessages();

    return () => {
      mounted = false;
      stopStreamRef.current?.();
      stopStreamRef.current = null;
    };
    // Hook functions are recreated per render; only resubscribe on conversation/client changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id, client]);

  return (
    <div
      className={`${client ? "" : "horizontal-box bg-[#FCFCFC] px-[12px]"} ${
        activeConversation !== undefined || (notOnNetwork && invalidUser) ? "" : "sm:hidden"
      } flex-1`}
    >
      {!client ? (
        <div className="flex-1" />
      ) : notOnNetwork && invalidUser ? (
        <div className="flex flex-col h-full w-full bg-white border border-[#E4E4E7] rounded-[16px] overflow-hidden">
          <div className="px-[16px] py-[14px] flex items-center gap-[10px]">
            <button
              type="button"
              className="sm:block hidden"
              onClick={() => setActiveConversation(undefined)}
              aria-label="Back"
            >
              <Image src="/images/arrow-left.svg" alt="Back" width={24} height={24} />
            </button>
            <Image
              src={invalidUser.picture || "https://static.hey.xyz/images/default.png"}
              alt={invalidUser.displayName}
              width={43}
              height={43}
              className="rounded-[8px]"
            />
            <div className="flex flex-col gap-[2px]">
              <span className="text-[14px] leading-[18px] font-semibold text-[#111111]">
                {invalidUser.displayName}
              </span>
              <span className="text-[13px] leading-[16px] font-medium text-[#707070]">
                {invalidUser.handle}
              </span>
            </div>
          </div>
          <hr className="bg-[#E4E4E7] h-[1px]" />
          <div className="flex-1 flex flex-col justify-center items-center align-middle">
            <Image src="/images/mail.svg" alt="Mail" width={28} height={28} className="opacity-90" />
            <span className="leading-[18px] text-center font-semibold text-[14px] text-black mt-[8px]">
              User is not on XMTP
            </span>
          </div>
          <hr className="bg-[#E4E4E7] h-[1px]" />
          <div className="px-[16px]">
            <div className="flex py-[12px] gap-[8px] w-full items-center">
              <input
                className="rounded-[12px] px-[12px] py-[10px] border border-[#E4E4E7] bg-[#FCFCFC] w-full text-[14px] leading-[18px] text-[#6F6F74]"
                placeholder="Type your message here.."
                disabled
              />
              <button
                className="rounded-[12px] bg-[#F4F4F5] border border-[#E4E4E7] p-[9px] h-fit"
                disabled
                aria-label="Share"
              >
                <Image src="/images/share.svg" alt="Share" width={24} height={24} />
              </button>
              <button
                className="px-[18px] sm:px-[10px] py-[10px] bg-[#C6AAFF] rounded-[12px] flex w-fit gap-[7px] h-fit items-center"
                disabled
              >
                <span className="text-[15px] text-white leading-none sm:hidden">Send</span>
                <Image src="/images/arrow-right.svg" alt="Send" width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      ) : activeConversation !== undefined ? (
        <div className="flex flex-col h-full w-full bg-white border border-[#E4E4E7] rounded-[16px] overflow-hidden">
          <div className="px-[16px]">
            <ConversationHeader />
          </div>
          <hr className="bg-[#E4E4E7] h-[1px]" />
          <div className="px-[16px] flex-1 overflow-hidden">
            <ConversationMessages messages={messages} />
          </div>
          <hr className="bg-[#E4E4E7] h-[1px]" />
          <div className="px-[16px]">
            <ConversationInput />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-white border border-[#E4E4E7] rounded-[16px]">
          <div className="flex flex-col gap-[11px] justify-center items-center">
            <Image src="/images/discuss.svg" alt="Discuss" width={24} height={21} />
            <span className="leading-[18px] font-medium text-[14px] text-black">
              Select a conversation to start messaging
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationBox;
