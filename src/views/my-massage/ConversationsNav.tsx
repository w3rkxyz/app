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

const ConversationsNav = () => {
  const { list, loading, syncing, conversations, stream, syncAll, activeConversation } =
    useConversations();
  const { client } = useXMTP();
  const { address } = useAccount();
  const { createXMTPClient, connectingXMTP } = useXMTPClient(address as string);
  const stopStreamRef = useRef<(() => void) | null>(null);
  const [showMessagesMobile, setShowMessagesMobile] = useState(true);
  const [showSkeleleton, setShowSkeleton] = useState(true);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);

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
      className={`horizontal-box px-[12px] w-[367px] sm:w-full flex ${
        activeConversation !== undefined ? "sm:hidden" : "sm:flex"
      } flex-col pb-[10px]`}
    >
      <div className="flex justify-between items-center py-[19px] px-[9px]">
        <span className="leading-[16.94px] font-medium text-[16px]">Messages</span>
        {client && (
          <Image
            onClick={() => setIsNewConversationModalOpen(true)}
            src="/images/new-message.svg"
            className="cursor-pointer"
            alt="new message"
            width={26}
            height={26}
          />
        )}
      </div>
      <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
      {client ? (
        <>
          <ConversationsList conversations={conversations} />
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
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col gap-[11px] justify-center items-center">
            <Image
              src="/images/discuss.svg"
              className="cursor-pointer"
              alt="new message"
              width={24}
              height={21}
            />
            <span className="leading-[16.94px] font-medium text-[14px] text-black">
              Enable Messages
            </span>
            <button
              className="rounded-[8px] bg-[#C6AAFF] hover:bg-[#351A6B] px-[17px] py-[8px] text-white leading-[16.94px] font-medium text-[14px]"
              onClick={createClient}
            >
              {connectingXMTP ? "Connecting..." : "Enable"}
            </button>
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
