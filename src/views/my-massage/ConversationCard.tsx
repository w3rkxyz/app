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

type ConversationCardProps = {
  conversation: Dm<ContentTypes>;
  usersDic: { [address: string]: AccountData };
};

const ConversationCard = ({ conversation, usersDic }: ConversationCardProps) => {
  const { address } = useAccount();
  const { addAddressToUser } = useDatabase();
  const { activeConversation, selectConversation } = useConversations();
  const [loading, setLoading] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [user, setUser] = useState<AccountData | null>(null);

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

  if (loading || user === null) {
    return <ConversationSkeleton key={conversation.id} />;
  }

  return (
    <div
      key={conversation.id}
      className={`p-[8px] w-full ${
        isSelected ? "bg-[#E4E4E7]" : "bg-[#FAFAFA]"
        //conversation.unreadMessages
      } rounded-[8px] cursor-pointer ${false ? "bg-[#f0f0f3]" : ""}`}
      onClick={() => selectConversation(conversation)}
    >
      <div className="flex justify-between align-top mb-[6px]">
        <div className="flex gap-[10px]">
          <Image
            src={user.picture}
            onError={e => {
              (e.target as HTMLImageElement).src = "https://static.hey.xyz/images/default.png";
            }}
            className="rounded-[8px]"
            alt="paco pic"
            width={40}
            height={40}
          />
          <div className="flex flex-col gap-[5px] sm:gap-[1px] pt-[5px]">
            <span className="text-[14px] leading-[16.94px] font-medium">{user.displayName}</span>
            <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
              {user.handle}
            </span>
          </div>
        </div>
        <span className="text-[#707070] leading-[12.1px] text-[12px] font-semibold">
          {/* {conversation.lastMessageTime !== ""
            ? moment(conversation.lastMessageTime).format("h:mmA")
            : ""} */}
        </span>
      </div>
      <p
        //   conversation.unreadMessages
        className={`line-clamp-1 text-[11px] sm:text-[10px] text-[#000000] leading-[12px] font-medium
                      ${false ? "font-extrabold" : ""}
                    `}
      >
        {/* {conversation.lastMessage} */}
      </p>
    </div>
  );
};

export default ConversationCard;
