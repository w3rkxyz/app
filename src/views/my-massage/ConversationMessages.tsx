"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useXMTP } from "@/app/XMTPContext";
import { DecodedMessage } from "@xmtp/browser-sdk";
import moment from "moment";
import axios from "axios";

export type ConversationProps = {
  messages: DecodedMessage[];
};
const ConversationMessages = ({ messages }: ConversationProps) => {
  const [loading, setLoading] = useState(true);
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const [activeAttachments, setActiveAttachments] = useState<any>({});
  const { client } = useXMTP();

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
    <div className="flex-1 flex flex-col sm:justify-start overflow-y-auto pt-[14px] pb-[8px]" id="scrollableDiv">
      {loading ? (
        <div className="flex flex-col gap-[8px]">
          <div className="self-center h-[24px] w-[62px] bg-[#F4F4F5] rounded-full" />
          <div className="self-start h-[44px] w-[220px] bg-[#F4F4F5] rounded-[14px]" />
          <div className="self-end h-[44px] w-[190px] bg-[#E8D8FF] rounded-[14px]" />
          <div className="self-start h-[44px] w-[250px] bg-[#F4F4F5] rounded-[14px]" />
        </div>
      ) : (
        activeMessages.map((messages, index: number) => {
          return (
            <div
              key={index}
              className={`${index === 0 ? "mt-auto" : ""} w-full flex flex-col h-fit`}
            >
              <span className="text-[11px] leading-[13px] font-semibold text-[#7A7A7F] self-center mb-[14px] sm:mt-[12px] bg-[#F4F4F5] px-[10px] py-[5px] rounded-full">
                {messages.date}
              </span>
              {messages.messages.map((message: DecodedMessage, index: number) => {
                return typeof message.content !== "string" ? null : !isLink(message.content) ? (
                  <div
                    key={index}
                    className={`rounded-[14px] whitespace-pre-wrap w-fit min-w-[120px] max-w-[450px] text-[13px] laptop-x:max-w-[350px] sm:max-w-[262px] mb-[12px] relative font-medium leading-[19px] px-[12px] py-[9px] pr-[52px] sm:pr-[44px] sm:pb-[22px] ${
                        client?.inboxId === message.senderInboxId
                          ? "self-end bg-[#C6AAFF] text-white"
                          : "self-start bg-[#F4F4F5] text-[#1A1A1A]"
                      } `}
                  >
                    {message.content}
                    <span className="absolute right-[8px] bottom-[3px] text-[10px] leading-[12px] font-medium text-current/70">
                      {moment(new Date(Number(message.sentAtNs / 1_000_000n))).format("h:mmA")}
                    </span>
                  </div>
                ) : activeAttachments[message.content] ? (
                  <Link
                    target="_blank"
                    href={activeAttachments[message.content].link}
                    download={activeAttachments[message.content].name}
                    className={`rounded-[14px] whitespace-pre-wrap w-fit min-w-[140px] max-w-[450px] text-[13px] laptop-x:max-w-[350px] sm:max-w-[262px] mb-[12px] relative font-medium leading-[19px] px-[12px] py-[10px] pr-[52px] sm:pr-[44px] sm:pb-[22px] flex items-center gap-[8px] bg-[#E4E4E7] text-[#1A1A1A] ${
                        client?.inboxId === message.senderInboxId ? "self-end" : "self-start"
                      } `}
                  >
                    <Image
                      src="/images/add-photo.svg"
                      className={`sm:w-[20px] sm:h-[20px]`}
                      alt="user icon"
                      width={24}
                      height={24}
                    />
                    <span>{activeAttachments[message.content].name}</span>
                    <span className="absolute right-[8px] bottom-[3px] text-[10px] leading-[12px] font-medium text-current/70">
                      {moment(new Date(Number(message.sentAtNs / 1_000_000n))).format("h:mmA")}
                    </span>
                  </Link>
                ) : (
                  <div
                    key={index}
                    className={`rounded-[14px] whitespace-pre-wrap w-fit min-w-[140px] max-w-[450px] text-[13px] laptop-x:max-w-[350px] sm:max-w-[262px] mb-[12px] relative font-medium leading-[19px] px-[12px] py-[10px] pr-[52px] sm:pr-[44px] sm:pb-[22px] flex items-center gap-[8px] bg-[#E4E4E7] text-[#1A1A1A] ${
                        client?.inboxId === message.senderInboxId ? "self-end" : "self-start"
                      } `}
                  >
                    <span>Loading...</span>
                    <span className="absolute right-[8px] bottom-[3px] text-[10px] leading-[12px] font-medium text-current/70">
                      {moment(new Date(Number(message.sentAtNs / 1_000_000n))).format("h:mmA")}
                    </span>
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
