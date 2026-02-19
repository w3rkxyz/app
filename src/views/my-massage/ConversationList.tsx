"use client";

import { type Conversation, type Dm, type Group } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import ConversationSkeleton from "@/components/reusable/ConversationSkeleton";
import useDatabase from "@/hooks/useDatabase";
import ConversationCard from "./ConversationCard";
import DummyConversationCard from "./DummyConversationCard";
import { dummyConversations } from "./dummyConversations";
import type { ContentTypes } from "@/app/XMTPContext";

type ConversationListProps = {
  conversations: Dm<ContentTypes>[];
  searchQuery?: string;
};

const ConversationsList = ({ conversations, searchQuery = "" }: ConversationListProps) => {
  const { addressToUser } = useDatabase();
  const { loading } = useConversations();
  const [name, setName] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [showMessagesMobile, setShowMessagesMobile] = useState(true);

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery.trim()) return true;
    // The filtering will be done in ConversationCard since we have access to user data there
    return true;
  });

  return (
    <div
      className={`flex ${showMessagesMobile ? "sm:flex" : "sm:hidden"} flex-col gap-[5px] mt-[8px]`}
    >
      {loading
        ? [0, 1, 2, 3, 4, 5].map(item => {
            return <ConversationSkeleton key={item} />;
          })
        : conversations.length > 0
          ? conversations.map((conversation, index) => {
              return (
                <ConversationCard 
                  key={index} 
                  conversation={conversation} 
                  usersDic={addressToUser}
                  searchQuery={searchQuery}
                />
              );
            })
          : dummyConversations.map((dummyConv) => {
              return (
                <DummyConversationCard 
                  key={dummyConv.id} 
                  conversation={dummyConv}
                />
              );
            })}
    </div>
  );
};

export default ConversationsList;
