"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useAccount, useWalletClient } from "wagmi";
import NewConversation from "./newConversation";
import ConversationsList from "./ConversationList";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useXMTP } from "@/app/XMTPContext";
import { useXMTPClient } from "@/hooks/useXMTPClient";
import toast from "react-hot-toast";

const XMTP_RESTORE_DEBUG_KEY = "w3rk:xmtp:restore-debug:last";
const XMTP_UI_RESTORE_DEBUG_KEY = "w3rk:xmtp:restore-ui:last";
const WALLET_READY_TIMEOUT_MS = 5000;
const RESTORE_TIMEOUT_MS = 15000;

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
  const { address: walletAddress, isConnected, isReconnecting } = useAccount();
  const { data: walletClient } = useWalletClient();
  const walletClientAddress = walletClient?.account?.address?.toLowerCase() ?? null;
  const walletClientChainId =
    typeof walletClient?.chain?.id === "number" ? walletClient.chain.id : null;
  const lensProfile = useSelector((state: RootState) => state.app.user);
  const {
    createXMTPClient,
    initXMTPClient,
    connectingXMTP,
    connectStage,
    hasRestoreDbKeyForWallet,
    wipeXMTPIdentity,
  } = useXMTPClient({
    walletAddress,
    lensAccountAddress: lensProfile?.address,
    lensProfileId: lensProfile?.id,
    lensHandle: lensProfile?.handle,
  });

  const stopStreamRef = useRef<(() => void) | null>(null);
  const restoreInFlightRef = useRef(false);
  const manualEnableInFlightRef = useRef(false);
  const attemptedRestoreKeyRef = useRef("");
  const walletReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restorePhase, setRestorePhase] = useState<
    "idle" | "waiting_wallet" | "running" | "failed" | "timeout"
  >("idle");
  const [restoreCompleted, setRestoreCompleted] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreAttemptId, setRestoreAttemptId] = useState<string | null>(null);
  const [restoreNonce, setRestoreNonce] = useState(0);

  const persistUiRestoreDebug = useCallback((payload: Record<string, unknown>) => {
    if (typeof window === "undefined") {
      return;
    }
    const snapshot = {
      timestamp: new Date().toISOString(),
      ...payload,
    };
    try {
      window.localStorage.setItem(XMTP_UI_RESTORE_DEBUG_KEY, JSON.stringify(snapshot));
    } catch {
      // no-op
    }
  }, []);

  const clearWalletReadyTimeout = useCallback(() => {
    if (walletReadyTimeoutRef.current) {
      clearTimeout(walletReadyTimeoutRef.current);
      walletReadyTimeoutRef.current = null;
    }
  }, []);

  const startWalletReadyTimeout = useCallback(() => {
    if (walletReadyTimeoutRef.current) {
      return;
    }
    walletReadyTimeoutRef.current = setTimeout(() => {
      walletReadyTimeoutRef.current = null;
      persistUiRestoreDebug({
        event: "wallet_ready_timeout",
        timeoutMs: WALLET_READY_TIMEOUT_MS,
        walletAddress: walletAddress?.toLowerCase() ?? null,
        walletClientAddress,
        walletClientChainId,
        isConnected,
        isReconnecting,
      });
      console.warn("[XMTP_UI_RESTORE]", {
        event: "wallet_ready_timeout",
        timeoutMs: WALLET_READY_TIMEOUT_MS,
      });
      setRestorePhase("failed");
      setRestoreCompleted(true);
      setRestoreError("Wallet reconnect is taking too long. Retry or reconnect wallet.");
    }, WALLET_READY_TIMEOUT_MS);
  }, [
    isConnected,
    isReconnecting,
    persistUiRestoreDebug,
    walletAddress,
    walletClientAddress,
    walletClientChainId,
  ]);

  const getRestoreAttemptId = () =>
    `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

  const handleCopyDebug = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const payload = window.localStorage.getItem(XMTP_RESTORE_DEBUG_KEY);
    const uiPayload = window.localStorage.getItem(XMTP_UI_RESTORE_DEBUG_KEY);
    if (!payload && !uiPayload) {
      toast.error("No XMTP debug data found yet.");
      return;
    }

    try {
      const combinedPayload = JSON.stringify(
        {
          uiRestore: uiPayload ? JSON.parse(uiPayload) : null,
          xmtpRestore: payload ? JSON.parse(payload) : null,
        },
        null,
        2
      );
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(combinedPayload);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = combinedPayload;
        textArea.setAttribute("readonly", "true");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Copied XMTP debug data.");
    } catch (error) {
      toast.error("Failed to copy XMTP debug data.");
      console.error("Failed to copy XMTP debug data:", error);
    }
  };

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
    const restoreClient = async () => {
      if (client || connectingXMTP) {
        clearWalletReadyTimeout();
        return;
      }

      if (manualEnableInFlightRef.current) {
        return;
      }

      if (!isConnected) {
        clearWalletReadyTimeout();
        setRestorePhase("idle");
        setRestoreCompleted(false);
        setRestoreError(null);
        setRestoreAttemptId(null);
        persistUiRestoreDebug({
          event: "wallet_disconnected",
          walletAddress: walletAddress?.toLowerCase() ?? null,
          isConnected,
          isReconnecting,
        });
        attemptedRestoreKeyRef.current = "";
        return;
      }

      const walletReady = Boolean(walletAddress);

      if (!walletReady) {
        if (restoreCompleted && (restorePhase === "failed" || restorePhase === "timeout")) {
          return;
        }
        setRestorePhase("waiting_wallet");
        setRestoreCompleted(false);
        setRestoreError(null);
        startWalletReadyTimeout();
        persistUiRestoreDebug({
          event: "wallet_not_ready",
          walletAddress: walletAddress?.toLowerCase() ?? null,
          walletClientAddress,
          walletClientChainId,
          isConnected,
          isReconnecting,
          walletReady,
        });
        console.info("[XMTP_UI_RESTORE]", {
          event: "wallet_not_ready",
          timestamp: new Date().toISOString(),
          walletAddress: walletAddress?.toLowerCase() ?? null,
          walletClientAddress,
          walletClientChainId,
          isConnected,
          isReconnecting,
          walletClientReady: Boolean(walletClientAddress),
        });
        return;
      }
      clearWalletReadyTimeout();

      const hasRestoreDbKey = hasRestoreDbKeyForWallet();
      if (!hasRestoreDbKey) {
        const missingDbKeyAttemptId = getRestoreAttemptId();
        attemptedRestoreKeyRef.current = walletAddress?.toLowerCase() ?? "";
        setRestoreAttemptId(missingDbKeyAttemptId);
        setRestorePhase("failed");
        setRestoreCompleted(true);
        setRestoreError("No local XMTP session found on this browser. Enable messaging.");
        persistUiRestoreDebug({
          event: "restore_prereq_missing_db_key",
          attemptId: missingDbKeyAttemptId,
          walletAddress: walletAddress?.toLowerCase() ?? null,
        });
        return;
      }

      const restoreKey = walletAddress?.toLowerCase() ?? "";

      if (attemptedRestoreKeyRef.current === restoreKey && restoreCompleted) {
        return;
      }

      if (restoreInFlightRef.current) {
        return;
      }

      const attemptId = getRestoreAttemptId();
      const startedAt = Date.now();
      let restoreResolved = false;
      setRestoreAttemptId(attemptId);
      setRestorePhase("running");
      setRestoreCompleted(false);
      setRestoreError(null);

      try {
        attemptedRestoreKeyRef.current = restoreKey;
        restoreInFlightRef.current = true;
        console.info("[XMTP_UI_RESTORE]", {
          event: "restore_start",
          attemptId,
          startedAt: new Date(startedAt).toISOString(),
          walletAddress: walletAddress?.toLowerCase() ?? null,
          walletClientAddress,
          walletClientChainId,
          isConnected,
          isReconnecting,
          walletClientReady: Boolean(walletClientAddress),
        });
        persistUiRestoreDebug({
          event: "restore_start",
          attemptId,
          startedAt: new Date(startedAt).toISOString(),
          walletAddress: walletAddress?.toLowerCase() ?? null,
          walletClientAddress,
          walletClientChainId,
          isConnected,
          isReconnecting,
          walletReady,
        });

        // Silent restore only: never trigger wallet signatures automatically on page load.
        const restoredClient = await Promise.race([
          initXMTPClient(),
          new Promise<undefined>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Restore timed out after ${RESTORE_TIMEOUT_MS}ms.`)),
              RESTORE_TIMEOUT_MS
            )
          ),
        ]);

        if (!restoredClient && isMountedRef.current) {
          setRestorePhase("failed");
          setRestoreCompleted(true);
          setRestoreError("No existing XMTP session found. Enable messaging to continue.");
          restoreResolved = true;
        } else if (isMountedRef.current) {
          setRestorePhase("idle");
          setRestoreCompleted(true);
          setRestoreError(null);
          restoreResolved = true;
        }

        if (isMountedRef.current) {
          console.info("[XMTP_UI_RESTORE]", {
            event: "restore_end",
            attemptId,
            endedAt: new Date().toISOString(),
            durationMs: Date.now() - startedAt,
            result: restoredClient ? "restored" : "not_restored",
          });
          persistUiRestoreDebug({
            event: "restore_end",
            attemptId,
            endedAt: new Date().toISOString(),
            durationMs: Date.now() - startedAt,
            result: restoredClient ? "restored" : "not_restored",
          });
        }
      } catch (error) {
        if (isMountedRef.current) {
          const message =
            error instanceof Error && error.message ? error.message : "Unknown restore error.";
          const isTimeout = message.toLowerCase().includes("timed out");
          setRestorePhase(isTimeout ? "timeout" : "failed");
          setRestoreCompleted(true);
          setRestoreError(
            isTimeout
              ? "Restore is taking too long. Retry restore or reset messaging state."
              : message
          );
          restoreResolved = true;
          console.warn("XMTP auto-restore failed:", error);
          console.error("[XMTP_UI_RESTORE]", {
            event: "restore_failed",
            attemptId,
            endedAt: new Date().toISOString(),
            durationMs: Date.now() - startedAt,
            error: message,
            isTimeout,
          });
          persistUiRestoreDebug({
            event: "restore_failed",
            attemptId,
            endedAt: new Date().toISOString(),
            durationMs: Date.now() - startedAt,
            error: message,
            isTimeout,
          });
        }
      } finally {
        restoreInFlightRef.current = false;
        if (isMountedRef.current && !restoreResolved) {
          persistUiRestoreDebug({
            event: "restore_finalized_without_resolution",
            attemptId,
          });
          setRestorePhase("failed");
          setRestoreError("Restore ended unexpectedly. Retry or reconnect wallet.");
          setRestoreCompleted(true);
        }
      }
    };

    void restoreClient();
  }, [
    client,
    connectingXMTP,
    clearWalletReadyTimeout,
    isConnected,
    isReconnecting,
    initXMTPClient,
    restoreNonce,
    restoreCompleted,
    restorePhase,
    startWalletReadyTimeout,
    hasRestoreDbKeyForWallet,
    persistUiRestoreDebug,
    walletAddress,
    walletClientAddress,
    walletClientChainId,
  ]);

  const handleEnable = async () => {
    const toastId = toast.loading(stageLabel.idle);
    try {
      clearWalletReadyTimeout();
      manualEnableInFlightRef.current = true;
      attemptedRestoreKeyRef.current = "";
      setRestorePhase("idle");
      setRestoreCompleted(false);
      setRestoreError(null);
      setRestoreAttemptId(null);
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
    } finally {
      manualEnableInFlightRef.current = false;
    }
  };

  const handleRetryRestore = () => {
    clearWalletReadyTimeout();
    persistUiRestoreDebug({
      event: "restore_retry_clicked",
      restoreAttemptId,
    });
    attemptedRestoreKeyRef.current = "";
    setRestorePhase("idle");
    setRestoreCompleted(false);
    setRestoreError(null);
    setRestoreAttemptId(null);
    setRestoreNonce(prev => prev + 1);
  };

  const handleReconnectWallet = () => {
    persistUiRestoreDebug({
      event: "reconnect_wallet_clicked",
      restoreAttemptId,
    });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleResetRestore = async () => {
    clearWalletReadyTimeout();
    persistUiRestoreDebug({
      event: "restore_reset_clicked",
      restoreAttemptId,
    });
    await wipeXMTPIdentity();
    handleRetryRestore();
    toast.success("XMTP identity reset. You can retry restore or enable messaging.");
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(
    () => () => {
      clearWalletReadyTimeout();
    },
    [clearWalletReadyTimeout]
  );

  const showConnectWalletState = !client && !isConnected;
  const showEnableActions = restoreCompleted && (restorePhase === "failed" || restorePhase === "timeout");
  const showEnableState =
    !client &&
    isConnected &&
    !connectingXMTP &&
    showEnableActions;
  const showRestoreState =
    !client &&
    isConnected &&
    !showEnableState &&
    !connectingXMTP &&
    (restorePhase === "waiting_wallet" || restorePhase === "running");
  const restorePrimaryLabel =
    restorePhase === "waiting_wallet" ? "Preparing Wallet..." : "Restoring Messages...";
  const restoreSecondaryLabel =
    restorePhase === "waiting_wallet"
      ? "Waiting for wallet provider to finish reconnecting..."
      : "Checking existing XMTP session...";

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
      ) : showConnectWalletState ? (
        <div className="h-screen w-full bg-white flex items-center justify-center">
          <div className="text-center flex flex-col items-center justify-center">
            <Image src="/images/ChatsCircle.svg" alt="Connect wallet" width={64} height={64} />
            <p className="text-gray-500 text-lg mb-2">Connect Wallet</p>
            <p className="text-xs text-gray-500">Connect your wallet to access messages.</p>
          </div>
        </div>
      ) : showRestoreState ? (
        <div className="h-screen w-full bg-white flex items-center justify-center">
          <div className="text-center flex flex-col items-center justify-center">
            <Image src="/images/ChatsCircle.svg" alt="Restoring messages" width={64} height={64} />
            <p className="text-gray-500 text-lg mb-2">{restorePrimaryLabel}</p>
            <p className="text-xs text-gray-500">{restoreSecondaryLabel}</p>
          </div>
        </div>
      ) : (
        <div className="h-screen w-full bg-white flex items-center justify-center">
          <div className="text-center flex flex-col items-center justify-center">
            <Image src="/images/ChatsCircle.svg" alt="Enable messages" width={64} height={64} />
            <p className="text-gray-500 text-lg mb-3">Enable Messages</p>
            {showEnableActions && (
              <>
                <p className="text-xs text-[#7A7A7A] max-w-[260px] mb-3 text-center">
                  {restoreError ?? "Unable to restore XMTP session automatically."}
                </p>
                {restoreAttemptId && (
                  <p className="text-[10px] text-[#9A9A9A] mb-3">Restore attempt: {restoreAttemptId}</p>
                )}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={handleRetryRestore}
                    className="px-4 py-2 border border-[#D3D3D3] text-[#333] text-xs rounded-full hover:bg-[#F8F8F8]"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={handleReconnectWallet}
                    className="px-4 py-2 border border-[#D3D3D3] text-[#333] text-xs rounded-full hover:bg-[#F8F8F8]"
                  >
                    Reconnect wallet
                  </button>
                  <button
                    type="button"
                    onClick={handleResetRestore}
                    className="px-4 py-2 border border-[#D3D3D3] text-[#333] text-xs rounded-full hover:bg-[#F8F8F8]"
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
            <button
              onClick={handleEnable}
              disabled={connectingXMTP}
              className="px-6 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {connectingXMTP ? "Connecting..." : "Enable"}
            </button>
            <button
              type="button"
              onClick={handleCopyDebug}
              className="mt-3 text-xs text-[#6C6C6C] underline hover:text-[#444]"
            >
              Copy XMTP debug
            </button>
            {connectingXMTP && (
              <p className="text-xs text-gray-500 mt-2">
                {stageLabel[connectStage] ?? "Connecting..."}
              </p>
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
