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
    <div className="flex flex-col mt-[4px] pb-[4px] overflow-y-auto flex-1">
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
    </div>
  );
};

export default ConversationsList;
