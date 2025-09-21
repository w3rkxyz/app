"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { useConversation } from "@/hooks/useConversation";
import { uploadFileToIPFS, uploadJsonToIPFS } from "@/utils/uploadToIPFS";

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

    const attachmentLink = await uploadFileToIPFS(attachment);

    const attachmentData = {
      name: file?.name,
      type: getFileCategory(file?.type),
      link: attachmentLink,
    };

    const attachmentUrl = await uploadJsonToIPFS(attachmentData);

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
    <div className="flex py-[12px] gap-[5px] w-full items-center">
      <input
        className="form-input rounded-[8px] p-[10px] border-[1px] border-[#E4E4E7] w-full"
        placeholder="Type your message here.."
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        value={message}
      />
      <label
        htmlFor="file_upload"
        className="rounded-[8px] bg-[#F4F4F5] p-[9px] h-fit inline-flex items-center cursor-pointer"
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
        className="px-[18px] sm:px-[10px] py-[10px] bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] flex w-fit gap-[7px] h-fit items-center"
        onClick={handleSend}
      >
        <span className="text-[15px] text-white leading-none sm:hidden">Send</span>
        <Image src={"/images/arrow-right.svg"} alt="paco pic" width={16} height={16} />
      </button>
    </div>
  );
};

export default ConversationInput;
