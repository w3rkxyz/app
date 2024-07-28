"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  handleCloseModal?: () => void;
  closeJobCardModal?: () => void;
  handleSend: any;
};

const NewConversation = ({
  handleCloseModal,
  closeJobCardModal,
  handleSend,
}: Props) => {
  const myDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        myDivRef.current &&
        !myDivRef.current.contains(event.target as Node)
      ) {
        if (handleCloseModal) {
          handleCloseModal();
        } else if (closeJobCardModal) {
          closeJobCardModal();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="w-[400px] sm:w-[94%] rounded-[12px] bg-white nav-space absolute px-[16px] sm:h-fit"
      ref={myDivRef}
    >
      <div className="w-full flex justify-between items-center py-[12px] border-b-[1px] border-b-[#E4E4E7]">
        <span className="leading-[14.52px] text-[14px] font-medium text-[black]">
          New Conversation
        </span>
        <Image
          onClick={handleCloseModal}
          src="/images/Close.svg"
          alt="close icon"
          className="cursor-pointer"
          width={20}
          height={20}
        />
      </div>
      <input
        className="form-input rounded-[8px] p-[9px] border-[1px] border-[#E4E4E7] w-full my-[16px]"
        placeholder="Search..."
        onKeyDown={(e) => handleSend(e)}
      />
    </div>
  );
};

export default NewConversation;
