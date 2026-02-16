"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { useConversation } from "@/hooks/useConversation";
import { fileToDataURI, jsonToDataURI } from "@/utils/dataUriHelpers";

const ConversationInput = () => {
  const { send, sending } = useConversation();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (message.length === 0 || sending) {
      return;
    }

    await send(message);
    setMessage("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const getFileCategory = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) {
      return "img"; // Images
    } else if (mimeType.startsWith("video/")) {
      return "vid"; // Videos
    } else {
      return "doc"; // Everything else
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]; // Get the uploaded file
    const attachment = event.target.files;

    if (!file) {
      console.error("No file selected.");
      return;
    }

    const attachmentLink = await fileToDataURI(attachment);

    const attachmentData = {
      name: file?.name,
      type: getFileCategory(file?.type),
      link: attachmentLink,
    };

    const attachmentUrl = await jsonToDataURI(attachmentData);

    await send(attachmentUrl);
    setMessage("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex py-[12px] gap-[8px] w-full items-center">
      <input
        className="rounded-[12px] h-[42px] px-[12px] border border-[#E4E4E7] bg-[#FCFCFC] w-full text-[14px] leading-[18px] text-[#111111] placeholder-[#9B9BA1] focus:outline-none focus:border-[#C6AAFF] transition-colors"
        placeholder="Type your message here.."
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        value={message}
      />
      <label
        htmlFor="file_upload"
        className="rounded-[12px] bg-[#F4F4F5] border border-[#E4E4E7] p-[9px] h-fit inline-flex items-center cursor-pointer hover:bg-[#ECECEE] transition-colors"
        aria-label="Upload file"
      >
        <Image src={"/images/share.svg"} alt="Upload file" width={24} height={24} />
        <input
          id="file_upload"
          type="file"
          name="file_upload"
          className="hidden"
          onChange={handleFileUpload}
          aria-label="File upload"
        />
      </label>
      <button
        className="px-[18px] sm:px-[10px] py-[10px] bg-[#C6AAFF] hover:bg-[#B996FC] disabled:bg-[#E2D8F8] rounded-[12px] flex w-fit gap-[7px] h-fit items-center transition-colors"
        onClick={handleSend}
        disabled={message.length === 0 || sending}
      >
        <span className="text-[15px] text-white leading-none sm:hidden">Send</span>
        <Image src={"/images/arrow-right.svg"} alt="paco pic" width={16} height={16} />
      </button>
    </div>
  );
};

export default ConversationInput;
