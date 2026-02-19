"use client";

import Image from "next/image";
import { type Dm, type GroupMember } from "@xmtp/browser-sdk";
import { useCallback, useEffect, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import ConversationSkeleton from "@/components/reusable/ConversationSkeleton";
import type { AccountData } from "@/utils/getLensProfile";
import type { ContentTypes } from "@/app/XMTPContext";
import { useAccount } from "wagmi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
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
  const { address: walletAddress } = useAccount();
  const lensProfile = useSelector((state: RootState) => state.app.user);
  const activeIdentityAddress = lensProfile?.address ?? walletAddress;
  const { addAddressToUser } = useDatabase();
  const { activeConversation, selectConversation } = useConversations();
  const [loading, setLoading] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [user, setUser] = useState<AccountData | null>(null);
  const [lastMessage, setLastMessage] = useState<string>("Enter your message description here...");
  const [lastMessageTime, setLastMessageTime] = useState<string>("");
  const [hasUnread] = useState(false);

  const getOtherUser = useCallback(
    async (members: GroupMember[]) => {
      const otherUser = members.find(
        member =>
          member.accountIdentifiers[0].identifier.toLowerCase() !==
          activeIdentityAddress?.toLowerCase()
      );

      if (otherUser) {
        const mapped = usersDic[otherUser.accountIdentifiers[0].identifier.toLowerCase()];
        if (mapped) {
          return mapped;
        }

        const acc = await fetchAccount(otherUser.accountIdentifiers[0].identifier);
        if (acc) {
          const accountData = getLensAccountData(acc);
          addAddressToUser(accountData.address.toLowerCase(), accountData);
          return accountData;
        }

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
      return null;
    },
    [activeIdentityAddress, addAddressToUser, usersDic]
  );

  useEffect(() => {
    const getData = async () => {
      const members = await conversation.members();
      const participant = await getOtherUser(members);
      if (participant) {
        setUser(participant);

        try {
          const messages = await conversation.messages({ limit: 1 });
          if (messages && messages.length > 0) {
            const lastMsg = messages[0];
            const content = lastMsg.content;
            if (typeof content === "string") {
              setLastMessage(content);
            } else if (content && typeof content === "object" && "text" in content) {
              const typedContent = content as { text?: string };
              setLastMessage(typedContent.text || "Enter your message description here...");
            } else {
              setLastMessage("Attachment");
            }
            setLastMessageTime(moment(new Date(Number(lastMsg.sentAtNs / 1_000_000n))).format("h:mmA"));
          }
        } catch {
          setLastMessage("Enter your message description here...");
        }

        setLoading(false);
      }
    };
    getData();
  }, [conversation, getOtherUser]);

  useEffect(() => {
    if (activeConversation && activeConversation.id === conversation.id) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  }, [activeConversation, conversation.id]);

  if (searchQuery.trim() && user) {
    const query = searchQuery.toLowerCase();
    const matches =
      user.displayName.toLowerCase().includes(query) ||
      user.handle.toLowerCase().includes(query);

    if (!matches) {
      return null;
    }
  }

  if (loading || user === null) {
    return <ConversationSkeleton key={conversation.id} />;
  }

  const displayName = user.displayName?.trim() || user.address;
  const displayHandle = user.handle?.trim() || "";

  return (
    <div
      className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? "bg-gray-50" : ""
      }`}
      onClick={() => selectConversation(conversation)}
    >
      <div className="relative">
        <Image
          src={user.picture || "https://static.hey.xyz/images/default.png"}
          onError={e => {
            (e.target as HTMLImageElement).src = "https://static.hey.xyz/images/default.png";
          }}
          className="rounded-full object-cover"
          alt="user pic"
          width={44}
          height={44}
        />
        {hasUnread && (
          <div className="absolute -bottom-0.5 -right-0.5 min-w-[20px] h-5 bg-gray-900 rounded-full flex items-center justify-center px-1.5 text-white text-xs font-medium">
            1
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] leading-[20px] font-semibold text-gray-900 truncate">{displayName}</h3>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{lastMessageTime}</span>
        </div>
        {displayHandle && (
          <p className="text-xs leading-[16px] text-[#8C8C8C] truncate mt-0.5">{displayHandle}</p>
        )}
        <div className="mt-0.5">
          <p className="text-sm leading-[18px] text-gray-500 truncate">{lastMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;
