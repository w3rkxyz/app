"use client";

import ConversationsNav from "./ConversationsNav";
import ConversationBox from "./ConversationBox";

const MyMessageOpenChat = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white pt-[60px] sm:pt-[75px] px-[156px] banner-tablet:px-[80px] settings-xs:px-[30px] sm:px-[16px] flex gap-0 mb-[0px]">
      <ConversationsNav />
      <ConversationBox />
    </div>
  );
};

export default MyMessageOpenChat;
