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
      className={`${
        client ? "" : "horizontal-box bg-[#FCFCFC] px-[12px]"
      } ${
        activeConversation !== undefined || (notOnNetwork && invalidUser) ? "" : "sm:hidden"
      } flex-1 min-w-0`}
    >
      {!client ? (
        <div className="flex-1" />
      ) : notOnNetwork && invalidUser ? (
        <div className="flex flex-col h-full w-full bg-white border border-[#E4E4E7] rounded-[16px] overflow-hidden">
          <div className="h-[64px] px-[24px] sm:px-[14px] border-b border-[#ECECF0] flex items-center gap-[10px]">
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
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div className="flex flex-col gap-[2px]">
              <span className="text-[14px] leading-[18px] font-semibold text-[#111111]">
                {invalidUser.displayName?.trim() || invalidUser.handle || "Unknown user"}
              </span>
              {invalidUser.handle && (
                <span className="text-[13px] leading-[16px] font-medium text-[#707070]">
                  {invalidUser.handle}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center px-[24px]">
            <div className="w-[56px] h-[56px] rounded-full bg-[#F6F6F8] border border-[#ECECF0] flex items-center justify-center">
              <Image src="/images/ChatsCircle.svg" alt="Message state" width={28} height={28} />
            </div>
            <span className="leading-[20px] text-center font-semibold text-[16px] text-black mt-[14px]">
              User is not on XMTP
            </span>
            <span className="leading-[20px] text-center font-medium text-[14px] text-[#6C6C6C] mt-[6px]">
              They need to enable Messages before you can chat.
            </span>
          </div>
        </div>
      ) : activeConversation !== undefined ? (
        <div className="flex flex-col h-full w-full bg-[#FCFCFC] sm:bg-white overflow-hidden">
          <div className="h-[64px] bg-white flex items-center justify-between px-[24px] sm:px-[14px] shadow-[0px_2px_9px_0px_#0000000D]">
            <ConversationHeader />
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationMessages messages={messages} />
          </div>
          <div className="bg-white border-t border-[#E4E4E7] shadow-[0px_4px_6px_-2px_#10182808] px-[16px] sm:px-[12px]">
            <ConversationInput />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-white rounded-[16px] border border-[#E4E4E7]">
          <div className="flex flex-col gap-[6px] justify-center items-center px-[24px] text-center">
            <div className="w-[56px] h-[56px] rounded-full bg-[#F6F6F8] border border-[#ECECF0] flex items-center justify-center mb-[4px]">
              <Image src="/images/ChatsCircle.svg" alt="Discuss" width={28} height={28} />
            </div>
            <span className="leading-[20px] font-semibold text-[16px] text-black">
              No conversation selected
            </span>
            <span className="leading-[20px] font-medium text-[14px] text-[#6C6C6C]">
              Choose a chat from the left sidebar to start messaging
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationBox;
