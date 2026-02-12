"use client";

import { type Dm } from "@xmtp/browser-sdk";
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

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery.trim()) return true;
    // The filtering will be done in ConversationCard since we have access to user data there
    return true;
  });

  return (
<<<<<<< HEAD
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
=======
    <div className="flex sm:flex flex-col gap-[5px] mt-[8px] overflow-y-auto">
      {loading &&
        [0, 1, 2, 3, 4, 5].map(item => {
          return <ConversationSkeleton key={item} />;
        })}

      {!loading &&
        conversations.map(conversation => {
          return (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              usersDic={addressToUser}
              searchQuery={searchQuery}
            />
          );
        })}
>>>>>>> 967b3a64439f167c2c088d857016e6387d7d8372
    </div>
  );
};

export default ConversationsList;
