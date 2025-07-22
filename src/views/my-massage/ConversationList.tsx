"use client";

import { type Conversation, type Dm, type Group } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import ConversationSkeleton from "@/components/reusable/ConversationSkeleton";
import useDatabase from "@/hooks/useDatabase";
import ConversationCard from "./ConversationCard";
import type { ContentTypes } from "@/app/XMTPContext";

type ConversationListProps = {
  conversations: Dm<ContentTypes>[];
};

const ConversationsList = ({ conversations }: ConversationListProps) => {
  const { addressToUser } = useDatabase();
  const { loading } = useConversations();
  const [name, setName] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [showMessagesMobile, setShowMessagesMobile] = useState(true);

  return (
    <div
      className={`flex ${showMessagesMobile ? "sm:flex" : "sm:hidden"} flex-col gap-[5px] mt-[8px]`}
    >
      {loading
        ? [0, 1, 2, 3, 4, 5].map(item => {
            return <ConversationSkeleton key={item} />;
          })
        : conversations.length > 0 &&
          conversations.map((conversation, index) => {
            return (
              <ConversationCard key={index} conversation={conversation} usersDic={addressToUser} />
            );
          })}
    </div>
  );
};

export default ConversationsList;
