"use client";

import ConversationsNav from "./ConversationsNav";
import ConversationBox from "./ConversationBox";
import { useState } from "react";

const MyMessageOpenChat = () => {
  return (
    <div className="h-screen w-screen overflow-hidden pt-[60px] sm:pt-[75px] px-[156px] banner-tablet:px-[80px] settings-xs:px-[30px] sm:px-[16px] flex gap-[5px] mb-[0px]">
      <ConversationsNav />
      <ConversationBox />
    </div>
  );
};

export default MyMessageOpenChat;
