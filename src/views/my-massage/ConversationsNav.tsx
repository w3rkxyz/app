"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useXMTPClient } from "@/hooks/useXMTPClient";
import { useConversations } from "@/hooks/useConversations";
import { useAccount, useSignMessage } from "wagmi";
import NewConversation from "./newConversation";
import { AccountData } from "@/utils/getLensProfile";
import { getLensClient } from "@/client";
import ConversationsList from "./ConversationList";
import getCurrentTime from "@/utils/currentTime";
import toast from "react-hot-toast"; // Get the keys using a valid Signer. Save them somewhere secure.
import { useEthersSigner } from "@/utils/getSigner";
import moment from "moment";
import Link from "next/link";
import { loadKeys, storeKeys } from "@/utils/xmtpHelpers";
import { useSearchParams } from "next/navigation";
import ConversationSkeleton from "@/components/reusable/ConversationSkeleton";
import {
  ContentTypeAttachment,
  AttachmentCodec,
  RemoteAttachmentCodec,
  ContentTypeRemoteAttachment,
} from "@xmtp/content-type-remote-attachment";
import { fileToDataURI, jsonToDataURI } from "@/utils/dataUriHelpers";
import axios from "axios";
import { ContentTypeReadReceipt, ReadReceiptCodec } from "@xmtp/content-type-read-receipt";
import { SessionClient, useAccount as useLensAccount } from "@lens-protocol/react";
import { useSelector } from "react-redux";
import { type Signer, type Identifier, type DecodedMessage, Client, Dm } from "@xmtp/browser-sdk";
import type { ContentCodec } from "@xmtp/content-type-primitives";
import { hexToBytes } from "viem";
import { RootState } from "@/redux/store";
import { useXMTP } from "@/app/XMTPContext";

const ConversationsNav = ({ setIsMessagesEnabled, isMessagesEnabled, selectedChat, setSelectedChat, contacts }) => {
  const { list, loading, syncing, conversations, stream, syncAll, activeConversation } =
    useConversations();
  const { client } = useXMTP();
  const { address } = useAccount();
  const { createXMTPClient, connectingXMTP } = useXMTPClient(address as string);
  const stopStreamRef = useRef<(() => void) | null>(null);
  const [showMessagesMobile, setShowMessagesMobile] = useState(true);
  const [showSkeleleton, setShowSkeleton] = useState(true);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const startStream = useCallback(async () => {
    stopStreamRef.current = await stream();
  }, [stream]);

  const stopStream = useCallback(() => {
    stopStreamRef.current?.();
    stopStreamRef.current = null;
  }, []);

  const handleSync = useCallback(async () => {
    stopStream();
    await list(undefined, true);
    await startStream();
  }, [list, startStream, stopStream]);

  const handleSyncAll = useCallback(async () => {
    stopStream();
    await syncAll();
    await startStream();
  }, [syncAll, startStream, stopStream]);

  // loading conversations on mount, and start streaming
  useEffect(() => {
    const loadConversations = async () => {
      if (client) {
        await list(undefined, true);
        await startStream();
      }
    };
    void loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  // stop streaming on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI MEthods

  const handleCloseNewConversationModal = () => {
    setIsNewConversationModalOpen(false);
  };

  const createClient = async () => {
    try {
      if (address) {
        const client = await createXMTPClient();
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  return (
    <div
      className={`horizontal-box px-[12px] w-[417px] sm:w-full flex bg-white h-screen ${selectedChat && isMessagesEnabled && 'sm:hidden'} ${
        activeConversation !== undefined ? "sm:hidden" : "sm:flex"
      } flex-col pb-[10px]`}
    >
      <div className="flex justify-between items-center py-[19px] px-[9px]">
        <div className="flex items-center gap-[8px]">
          <span className="leading-[16.94px] font-semibold text-[24px]">Messages</span>
          {conversations.length > 0 && (
            <span className="bg-[#351A6B] text-white text-[12px] font-semibold px-[6px] py-[2px] rounded-full">
              {conversations.length}
            </span>
          )}
        </div>
        {/* {client && ( */}
          <Image
            onClick={() => setIsNewConversationModalOpen(true)}
            src="/images/NotePencil.svg"
            className="cursor-pointer"
            alt="new message"
            width={26}
            height={26}
          />
        {/* )} */}
      </div>
      <div className="px-[9px] pb-[10px]">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#999]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-[8px] border border-[#E4E4E7] rounded-[8px] text-[14px] placeholder-[#999] focus:outline-none focus:border-[#C6AAFF]"
          />
        </div>
      </div>
      {client ? (
        <>
          {/* <ConversationsList conversations={conversations} searchQuery={searchQuery} />
          {!showMessagesMobile && (
            <div className="flex items-center justify-center h-full">
              <div className="hidden sm:flex flex-col gap-[11px] justify-center items-center">
                <Image
                  src="/images/discuss.svg"
                  className="cursor-pointer"
                  alt="new message"
                  width={24}
                  height={21}
                />
                <span className="leading-[16.94px] max-w-[174px] text-center font-medium text-[14px] text-black">
                  Select a conversation to start messaging
                </span>
              </div>
            </div>
          )} */}
        </>
      ) : (
        // <div className="flex items-center justify-center h-full">
        //   <div className="flex flex-col gap-[11px] justify-center items-center">
        //     <Image
        //       src="/images/discuss.svg"
        //       className="cursor-pointer"
        //       alt="new message"
        //       width={24}
        //       height={21}
        //     />
        //     <span className="leading-[16.94px] font-medium text-[14px] text-black">
        //       Enable Messages
        //     </span>
        //     <button
        //       className="rounded-[8px] bg-[#C6AAFF] hover:bg-[#351A6B] px-[17px] py-[8px] text-white leading-[16.94px] font-medium text-[14px]"
        //       onClick={createClient}
        //     >
        //       {connectingXMTP ? "Connecting..." : "Enable"}
        //     </button>
        //   </div>
        // </div>

      !selectedChat && isMessagesEnabled ? <div className={`w-full bg-white flex flex-col`}>

          <div className="flex-1 w-full overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedChat(contact.id)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="relative">
                  <img 
                    src={contact.avatar} 
                    alt={contact.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  {contact.unread > 0 && (
                    <div className={`absolute -bottom-0.5 -right-0.5 min-w-[20px] h-5 ${contact.badgeColor || 'bg-gray-900'} rounded-full flex items-center justify-center px-1.5 text-white text-xs font-medium`}>
                      {contact.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-base font-medium text-gray-900 truncate">{contact.name}</h3>
                    <span className="text-sm text-gray-500 ml-2">{contact.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{contact.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div> : !isMessagesEnabled ? <div className="h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
          <Image src={'/images/ChatsCircle.svg'} alt="" width={64} height={64} />
          <p className="text-gray-500 text-lg mb-4">Enable Messages</p>
          <button
            onClick={() => setIsMessagesEnabled(true)}
            className="px-6 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
          >
            Enable
          </button>
        </div>
        <button className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          {/* <Edit size={18} className="text-gray-700" /> */}
        </button>
      </div> : <div className="w-full bg-white flex flex-col sm:hidden">
        {/* <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <span className="text-sm text-gray-500">39</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Edit size={18} className="text-gray-700" />
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div> */}

        <div className="flex-1 w-full overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedChat(contact.id)}
              className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedChat === contact.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="relative">
                <img 
                  src={contact.avatar} 
                  alt={contact.name}
                  className="w-11 h-11 rounded-full object-cover"
                />
                {contact.unread > 0 && (
                  <div className={`absolute -bottom-0.5 -right-0.5 min-w-[20px] h-5 ${contact.badgeColor || 'bg-gray-900'} rounded-full flex items-center justify-center px-1.5 text-white text-xs font-medium`}>
                    {contact.unread}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-base font-semibold text-[#212121] truncate">{contact.name}</h3>
                  <span className="text-sm text-gray-500 ml-2">{contact.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{contact.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
      {isNewConversationModalOpen && (
        <div className="fixed h-screen w-screen top-0 left-0 inset-0 z-[999] overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="w-full flex justify-center align-middle">
            <NewConversation handleCloseModal={handleCloseNewConversationModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsNav;
