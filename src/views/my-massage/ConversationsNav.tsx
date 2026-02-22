"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useAccount } from "wagmi";
import NewConversation from "./newConversation";
import ConversationsList from "./ConversationList";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useXMTP } from "@/app/XMTPContext";
import { useXMTPClient } from "@/hooks/useXMTPClient";
import toast from "react-hot-toast";

const stageLabel: Record<string, string> = {
  idle: "Preparing XMTP...",
  prompt_signature: "Check your wallet to sign",
  restore_session: "Restoring XMTP session...",
  build_failed_fallback_create: "Session restore failed, creating client...",
  create_client: "Creating XMTP client...",
  check_registration: "Checking XMTP registration...",
  register_account: "Registering XMTP account...",
  connected: "XMTP connected",
  failed: "XMTP connection failed",
};

const ConversationsNav = () => {
  const { list, conversations, stream, activeConversation, loading } = useConversations();
  const { client } = useXMTP();
  const { address: walletAddress } = useAccount();
  const lensProfile = useSelector((state: RootState) => state.app.user);
  const { createXMTPClient, initXMTPClient, connectingXMTP, connectStage, wasXMTPEnabled } = useXMTPClient({
    walletAddress,
    lensAccountAddress: lensProfile?.address,
    lensProfileId: lensProfile?.id,
    lensHandle: lensProfile?.handle,
  });

  const stopStreamRef = useRef<(() => void) | null>(null);
  const attemptedAutoReconnectRef = useRef(false);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadConversations = async () => {
      if (!client) {
        return;
      }

      stopStreamRef.current?.();
      stopStreamRef.current = null;

      await list(undefined, true);
      if (!mounted) {
        return;
      }
      stopStreamRef.current = await stream();
    };

    void loadConversations();

    return () => {
      mounted = false;
      stopStreamRef.current?.();
      stopStreamRef.current = null;
    };
    // `list` and `stream` are recreated by the hook each render; key off `client` to avoid loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  useEffect(() => {
    let cancelled = false;

    const restoreClient = async () => {
      if (client || connectingXMTP) {
        return;
      }

      if (!walletAddress && !lensProfile?.address) {
        return;
      }

      try {
        const restoredClient = await initXMTPClient();
        if (restoredClient) {
          attemptedAutoReconnectRef.current = false;
          return;
        }

        if (attemptedAutoReconnectRef.current) {
          return;
        }

        if (!wasXMTPEnabled()) {
          return;
        }

        attemptedAutoReconnectRef.current = true;
        await createXMTPClient();
      } catch (error) {
        if (!cancelled) {
          console.warn("XMTP auto-restore failed:", error);
        }
      }
    };

    void restoreClient();

    return () => {
      cancelled = true;
    };
  }, [
    client,
    connectingXMTP,
    createXMTPClient,
    initXMTPClient,
    lensProfile?.address,
    walletAddress,
    wasXMTPEnabled,
  ]);

  const handleEnable = async () => {
    const toastId = toast.loading(stageLabel.idle);
    try {
      await createXMTPClient({
        onStage: stage => {
          const message = stageLabel[stage] ?? "Connecting XMTP...";
          if (stage === "connected") {
            toast.success(message, { id: toastId });
            return;
          }
          if (stage === "failed") {
            toast.error(message, { id: toastId });
            return;
          }
          toast.loading(message, { id: toastId });
        },
      });
      toast.success("XMTP enabled", { id: toastId });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to connect XMTP. Please retry.";
      toast.error(message, { id: toastId });
      console.error("Failed to connect XMTP:", error);
    }
  };

  return (
    <div
      className={`horizontal-box px-[12px] w-[417px] sm:w-full flex bg-white h-screen ${
        activeConversation !== undefined ? "sm:hidden" : "sm:flex"
      } flex-col pb-[10px]`}
    >
      <div className="flex justify-between items-center py-[19px] px-[9px]">
        <div className="flex items-center gap-[8px]">
          <span className="leading-[16.94px] font-semibold text-[24px] text-black">Messages</span>
          {conversations.length > 0 && (
            <span className="bg-[#351A6B] text-white text-[12px] font-semibold px-[6px] py-[2px] rounded-full">
              {conversations.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsNewConversationModalOpen(true)}
          disabled={!client}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Start new conversation"
        >
          <Image src="/images/NotePencil.svg" alt="new message" width={26} height={26} />
        </button>
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
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-[8px] border border-[#E4E4E7] rounded-[8px] text-[14px] placeholder-[#999] focus:outline-none focus:border-[#C6AAFF]"
          />
        </div>
      </div>

      {client ? (
        <>
          <ConversationsList conversations={conversations} searchQuery={searchQuery} />
          {!loading && conversations.length === 0 && (
            <div className="flex items-center justify-center h-full px-6 text-center text-[#6C6C6C] text-[14px]">
              No conversations yet
            </div>
          )}
        </>
      ) : (
        <div className="h-screen w-full bg-white flex items-center justify-center">
          <div className="text-center flex flex-col items-center justify-center">
            <Image src="/images/ChatsCircle.svg" alt="Enable messages" width={64} height={64} />
            <p className="text-gray-500 text-lg mb-4">Enable Messages</p>
            <button
              onClick={handleEnable}
              disabled={connectingXMTP}
              className="px-6 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {connectingXMTP ? "Connecting..." : "Enable"}
            </button>
            {connectingXMTP && (
              <p className="text-xs text-gray-500 mt-2">{stageLabel[connectStage] ?? "Connecting..."}</p>
            )}
          </div>
        </div>
      )}

      {isNewConversationModalOpen && (
        <div className="fixed h-screen w-screen top-0 left-0 inset-0 z-[999] overflow-y-auto bg-black/45 backdrop-blur-[1px] flex justify-center items-center">
          <div className="w-full flex justify-center align-middle">
            <NewConversation handleCloseModal={() => setIsNewConversationModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsNav;
