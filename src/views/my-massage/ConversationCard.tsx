"use client";

import Image from "next/image";
import { type Dm, type SafeGroupMember } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import ConversationSkeleton from "@/components/reusable/ConversationSkeleton";
import type { AccountData } from "@/utils/getLensProfile";
import type { ContentTypes } from "@/app/XMTPContext";
import { useAccount } from "wagmi";
import getLensAccountData from "@/utils/getLensProfile";
import { fetchAccount } from "@/hooks/useSearchAccounts";
import useDatabase from "@/hooks/useDatabase";
import moment from "moment";

type ConversationCardProps = {
  conversation: Dm<ContentTypes>;
  usersDic: { [address: string]: AccountData };
  searchQuery?: string;
};

const ConversationCard = ({ conversation, usersDic, searchQuery = "" }: ConversationCardProps) => {
  const { address } = useAccount();
  const { addAddressToUser } = useDatabase();
  const { activeConversation, selectConversation } = useConversations();
  const [loading, setLoading] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [user, setUser] = useState<AccountData | null>(null);
  const [lastMessage, setLastMessage] = useState<string>("Enter your message description here...");
  const [lastMessageTime, setLastMessageTime] = useState<string>("");
  const [hasUnread, setHasUnread] = useState(false);

  const getOtherUser = async (members: SafeGroupMember[]) => {
    console.log("Members: ", members);
    const otherUser = members.find(
      member => member.accountIdentifiers[0].identifier.toLowerCase() !== address?.toLowerCase()
    );
    console.log("Other user: ", otherUser);
    if (otherUser) {
      const user = usersDic[otherUser.accountIdentifiers[0].identifier.toLowerCase()];
      console.log("user: ", user);
      if (user) {
        return user;
      } else {
        const acc = await fetchAccount(otherUser.accountIdentifiers[0].identifier);
        console.log("Account: ", acc);
        if (acc) {
          const accountData = getLensAccountData(acc);
          console.log("Account data: ", accountData);
          addAddressToUser(accountData.address.toLowerCase(), accountData);
          return accountData;
        } else {
          const tempUser: AccountData = {
            address: otherUser.accountIdentifiers[0].identifier,
            displayName: otherUser.accountIdentifiers[0].identifier,
            picture: "",
            coverPicture: "",
            attributes: {},
            bio: "",
            handle: "@ETH",
            id: "",
            userLink: "",
          };
          return tempUser;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const getData = async () => {
      const members = await conversation.members();
      const participant = await getOtherUser(members);
      if (participant) {
        setUser(participant);
        
        // Get last message
        try {
          const messages = await conversation.messages({ limit: 1 });
          if (messages && messages.length > 0) {
            const lastMsg = messages[0];
            const msgContent = lastMsg.content as any;
            setLastMessage(msgContent?.text || "Enter your message description here...");
            setLastMessageTime(moment(lastMsg.sentAt).format("h:mmA"));
          }
        } catch (error) {
          console.log("Error fetching messages:", error);
          setLastMessage("Enter your message description here...");
        }
        
        setLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (activeConversation && activeConversation.id === conversation.id) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  }, [activeConversation, conversation.id]);

  // Filter based on search query
  if (searchQuery.trim() && user) {
    const query = searchQuery.toLowerCase();
    const matches = 
      user.displayName.toLowerCase().includes(query) ||
      user.handle.toLowerCase().includes(query) ||
      lastMessage.toLowerCase().includes(query);
    
    if (!matches) {
      return null;
    }
  }

  if (loading || user === null) {
    return <ConversationSkeleton key={conversation.id} />;
  }

  return (
    <div
      key={conversation.id}
      className={`p-[8px] w-full ${
        isSelected ? "bg-[#E4E4E7]" : "hover:bg-[#F3F3F3]"
      } rounded-[8px] cursor-pointer transition-colors`}
      onClick={() => selectConversation(conversation)}
    >
      <div className="flex justify-between align-start gap-[10px]">
        <div className="flex gap-[12px] flex-1 min-w-0">
          <Image
            src={user.picture}
            onError={e => {
              (e.target as HTMLImageElement).src = "https://static.hey.xyz/images/default.png";
            }}
            className="rounded-[8px] flex-shrink-0"
            alt="user pic"
            width={40}
            height={40}
          />
          <div className="flex flex-col gap-[4px] flex-1 min-w-0">
            <div className="flex justify-between items-baseline gap-[8px]">
              <span className="text-[14px] leading-[16.94px] font-medium text-black">
                {user.displayName}
              </span>
              <span className="text-[12px] leading-[14px] font-medium text-[#999] flex-shrink-0">
                {lastMessageTime}
              </span>
            </div>
            <p className="line-clamp-1 text-[13px] leading-[15px] text-[#707070]">
              {lastMessage}
            </p>
          </div>
        </div>
        {hasUnread && (
          <div className="w-[8px] h-[8px] bg-black rounded-full mt-[6px] flex-shrink-0"></div>
        )}
      </div>
    </div>
  );
};

export default ConversationCard;
