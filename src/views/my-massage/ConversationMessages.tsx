"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useXMTP } from "@/app/XMTPContext";
import { DecodedMessage } from "@xmtp/browser-sdk";
import moment from "moment";
import axios from "axios";
import { useConversation } from "@/hooks/useConversation";

export type ConversationProps = {
  messages: DecodedMessage[];
};
const ConversationMessages = ({ messages }: ConversationProps) => {
  const [loading, setLoading] = useState(true);
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const [activeAttachments, setActiveAttachments] = useState<any>({});
  const { client } = useXMTP();
  const { otherUser } = useConversation();

  const checkMarks = (tone: "light" | "dark") => (
    <div className="flex items-center">
      <svg
        className={`w-[11px] h-[11px] ${tone === "light" ? "text-[#2563EB]" : "text-[#C4C4C4]"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
      </svg>
      <svg
        className={`w-[11px] h-[11px] -ml-[4px] ${tone === "light" ? "text-[#2563EB]" : "text-[#C4C4C4]"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );

  function groupMessagesByWhatsAppDate(messages: DecodedMessage<any>[]) {
    const groupedMessages: { date: string; messages: DecodedMessage[] }[] = [];

    messages.forEach(message => {
      const now = moment().startOf("day");
      const sentDate = new Date(Number(message.sentAtNs / 1_000_000n));
      const inputDate = moment(sentDate).startOf("day");
      let dateKey: string;

      if (now.isSame(inputDate, "day")) {
        dateKey = "Today";
      } else if (now.diff(inputDate, "days") < 7) {
        dateKey = inputDate.format("dddd");
      } else {
        dateKey = inputDate.format("MMM D");
      }

      const existingGroup = groupedMessages.find(group => group.date === dateKey);

      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groupedMessages.push({ date: dateKey, messages: [message] });
      }
    });

    return groupedMessages;
  }

  const isLink = (text: string): boolean => {
    try {
      new URL(text); // Attempt to create a URL object
      return true; // If no error is thrown, it's a valid URL
    } catch {
      return false; // If an error is thrown, it's not a valid URL
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      const conversationMessages = messages;
      setActiveMessages(groupMessagesByWhatsAppDate(conversationMessages));
      var attachments: {
        [key: string]: any;
      } = {};
      const allPromises = groupMessagesByWhatsAppDate(conversationMessages).map(messageGroup => {
          return Promise.all(
            messageGroup.messages.map(async message => {
              if (isLink(message.content as string)) {
                try {
                  const response = await axios.get(message.content as string);
                  const data = response.data;
                  attachments[message.content as string] = data;
                } catch (error) {
                  console.error("Error fetching data for:", message.content, error);
                }
              } else {
                return message;
              }
            })
          );
      });

      // Wait for all groups and all messages to finish
      await Promise.all(allPromises);
      setActiveAttachments(attachments);
      setLoading(false);
    };
    loadMessages();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col sm:justify-start overflow-y-auto p-[24px] sm:px-[12px] sm:py-[16px]" id="scrollableDiv">
      {loading ? (
        <div className="flex flex-col gap-[10px]">
          <div className="self-center h-[14px] w-[78px] bg-[#EEF0F3] rounded-full" />
          <div className="self-start h-[58px] w-[320px] bg-white border border-[#D6D9DF] rounded-[16px]" />
          <div className="self-end h-[52px] w-[280px] bg-[#212121] rounded-[16px]" />
          <div className="self-start h-[60px] w-[360px] bg-white border border-[#D6D9DF] rounded-[16px]" />
        </div>
      ) : (
        activeMessages.map((groupedMessages, index: number) => {
          return (
            <div
              key={index}
              className={`${index === 0 ? "mt-auto" : ""} w-full flex flex-col h-fit gap-[10px]`}
            >
              <span className="text-[12px] leading-[14px] text-[#6C6C6C] self-center mb-[8px]">
                {groupedMessages.date}
              </span>
              {groupedMessages.messages.map((message: DecodedMessage, messageIndex: number) => {
                if (typeof message.content !== "string") {
                  return null;
                }

                const isOwnMessage = client?.inboxId === message.senderInboxId;
                const sentTime = moment(new Date(Number(message.sentAtNs / 1_000_000n))).format("h:mmA");

                if (isLink(message.content)) {
                  const attachment = activeAttachments[message.content];

                  return (
                    <div key={messageIndex} className={`${isOwnMessage ? "flex justify-end" : "flex gap-3 max-w-[720px] sm:max-w-full"}`}>
                      {!isOwnMessage && (
                        <Image
                          src={otherUser?.picture || "https://static.hey.xyz/images/default.png"}
                          alt={otherUser?.displayName || "Profile"}
                          width={32}
                          height={32}
                          className="rounded-full object-cover flex-shrink-0 mt-[2px]"
                        />
                      )}
                      <div className={`relative ${isOwnMessage ? "max-w-[640px] sm:max-w-[85%]" : "max-w-[640px] sm:max-w-[85%] flex-1"}`}>
                        <Link
                          target="_blank"
                          href={attachment ? attachment.link : message.content}
                          download={attachment?.name}
                          className={`rounded-2xl px-[12px] pt-[10px] pb-[28px] inline-flex items-start gap-[10px] w-full border-[0.5px] ${
                            isOwnMessage
                              ? "bg-[#212121] border-[#212121] text-white"
                              : "bg-white border-[#C3C7CE] text-[#212121]"
                          }`}
                        >
                          <Image src="/images/add-photo.svg" alt="Attachment" width={22} height={22} />
                          <div className="min-w-0">
                            <p className="text-[14px] leading-[18px] font-medium truncate">
                              {attachment?.name || "Attachment"}
                            </p>
                          </div>
                        </Link>
                        <div className="absolute bottom-[8px] right-[8px] flex items-center gap-[4px]">
                          <span className={`text-[11px] ${isOwnMessage ? "text-[#C4C4C4]" : "text-[#6C6C6C]"}`}>{sentTime}</span>
                          {checkMarks(isOwnMessage ? "dark" : "light")}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={messageIndex} className={`${isOwnMessage ? "flex justify-end" : "flex gap-3 max-w-[720px] sm:max-w-full"}`}>
                    {!isOwnMessage && (
                      <Image
                        src={otherUser?.picture || "https://static.hey.xyz/images/default.png"}
                        alt={otherUser?.displayName || "Profile"}
                        width={32}
                        height={32}
                        className="rounded-full object-cover flex-shrink-0 mt-[2px]"
                      />
                    )}
                    <div className={`relative ${isOwnMessage ? "max-w-[640px] sm:max-w-[85%]" : "max-w-[640px] sm:max-w-[85%] flex-1"}`}>
                      <div
                        className={`rounded-2xl px-[14px] py-[10px] pb-[28px] whitespace-pre-wrap text-[14px] leading-[20px] ${
                          isOwnMessage
                            ? "bg-[#212121] text-white rounded-tr-[6px]"
                            : "bg-white border-[0.5px] border-[#C3C7CE] text-[#6C6C6C]"
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className="absolute bottom-[8px] right-[8px] flex items-center gap-[4px]">
                        <span className={`text-[11px] ${isOwnMessage ? "text-[#C4C4C4]" : "text-[#6C6C6C]"}`}>{sentTime}</span>
                        {checkMarks(isOwnMessage ? "dark" : "light")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
      )}
      <div id="bottomMarker"></div>
    </div>
  );
};

export default ConversationMessages;
