"use client";

import { type Dm } from "@xmtp/browser-sdk";
import { useConversations } from "@/hooks/useConversations";
import ConversationSkeleton from "@/components/reusable/ConversationSkeleton";
import useDatabase from "@/hooks/useDatabase";
import ConversationCard from "./ConversationCard";
import type { ContentTypes } from "@/app/XMTPContext";

type ConversationListProps = {
  conversations: Dm<ContentTypes>[];
  searchQuery?: string;
};

const ConversationsList = ({ conversations, searchQuery = "" }: ConversationListProps) => {
  const { addressToUser } = useDatabase();
  const { loading } = useConversations();

  return (
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
    </div>
  );
};

export default ConversationsList;
