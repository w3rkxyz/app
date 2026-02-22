"use client";
import { useEffect, useRef, useState } from "react";
import { useConversation } from "@/hooks/useConversation";
import { fileToDataURI, jsonToDataURI } from "@/utils/dataUriHelpers";

const QUICK_EMOJIS = ["😀", "😂", "😊", "😍", "🙏", "👍", "🔥", "🎉", "🤝", "❤️"];

const ConversationInput = () => {
  const { send, sending } = useConversation();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        emojiContainerRef.current &&
        !emojiContainerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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
      <label
        htmlFor="file_upload"
        className="h-[40px] w-[40px] rounded-[10px] inline-flex items-center justify-center cursor-pointer hover:bg-[#F3F4F6] transition-colors"
        aria-label="Upload file"
      >
        <svg
          className="w-[20px] h-[20px] text-[#6B7280]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.48l10.6-10.6a4 4 0 115.66 5.66l-10.6 10.6a2 2 0 11-2.83-2.83l9.9-9.9"
          />
        </svg>
        <input
          id="file_upload"
          type="file"
          name="file_upload"
          className="hidden"
          onChange={handleFileUpload}
          aria-label="File upload"
        />
      </label>
      <div className="relative" ref={emojiContainerRef}>
        <button
          type="button"
          className="h-[40px] w-[40px] rounded-[10px] inline-flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
          aria-label="Emoji"
          onClick={() => setShowEmojiPicker(prev => !prev)}
        >
          <svg
            className="w-[20px] h-[20px] text-[#6B7280]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="2" />
            <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
            <path strokeLinecap="round" strokeWidth="2" d="M8 14s1.5 2 4 2 4-2 4-2" />
          </svg>
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-[46px] left-0 z-30 w-[222px] rounded-[12px] border border-[#E4E4E7] bg-white p-[8px] shadow-[0_12px_24px_rgba(0,0,0,0.12)]">
            <div className="grid grid-cols-5 gap-[6px]">
              {QUICK_EMOJIS.map(emoji => (
                <button
                  type="button"
                  key={emoji}
                  className="h-[34px] w-[34px] rounded-[8px] text-[20px] hover:bg-[#F4F4F5] transition-colors"
                  onClick={() => {
                    setMessage(prev => `${prev}${emoji}`);
                    setShowEmojiPicker(false);
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                  }}
                  aria-label={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <input
        className="flex-1 px-[12px] py-[10px] text-[14px] leading-[20px] text-[#111111] placeholder-[#9CA3AF] bg-transparent focus:outline-none"
        placeholder="Send a message..."
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        value={message}
      />
      <button
        className="h-[42px] w-[42px] rounded-full bg-[#212121] hover:bg-[#111111] disabled:bg-[#D1D5DB] inline-flex items-center justify-center transition-colors"
        onClick={handleSend}
        disabled={message.length === 0 || sending}
        aria-label="Send message"
      >
        <svg className="w-[18px] h-[18px] text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.4 20.4L22 12L3.4 3.6L3.3 10.2L16.6 12L3.3 13.8L3.4 20.4Z" />
        </svg>
      </button>
    </div>
  );
};

export default ConversationInput;
