"use client";

import type { DecodedMessage, ListMessagesOptions } from "@xmtp/browser-sdk";
import { useEffect, useMemo, useState } from "react";
import { useXMTPClient } from "./useXMTPClient";
import { ContentTypes } from "@/app/XMTPContext";
import { useXMTP } from "@/app/XMTPContext";
import type { AccountData } from "@/utils/getLensProfile";
import useDatabase from "./useDatabase";
import { useAccount } from "wagmi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchAccount } from "./useSearchAccounts";
import getLensAccountData from "@/utils/getLensProfile";

export const useConversation = () => {
  const { client } = useXMTPClient();
  const { activeConversation, setActiveConversation, notOnNetwork, invalidUser } = useXMTP();
  const { address: walletAddress } = useAccount();
  const lensProfile = useSelector((state: RootState) => state.app.user);
  const activeIdentityAddress = lensProfile?.address ?? walletAddress;
  const selfIdentityAddresses = useMemo(
    () =>
      [lensProfile?.address, walletAddress]
        .filter((value): value is string => Boolean(value))
        .map(value => value.toLowerCase()),
    [lensProfile?.address, walletAddress]
  );
  const { addressToUser, addAddressToUser } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<DecodedMessage<ContentTypes>[]>([]);
  const [otherUser, setOtherUser] = useState<AccountData | null>(null);
  const [loadingOtherUser, setLoadingOtherUser] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const normalizeIdentifier = (identifier: string) => {
      const normalized = identifier.toLowerCase();
      const parts = normalized.split(":");
      const tail = parts[parts.length - 1];
      if (tail.startsWith("0x") && tail.length === 42) {
        return tail;
      }
      return normalized;
    };

    const hasResolvedIdentity = (candidate: AccountData, identifier: string) => {
      const displayName = candidate.displayName?.trim().toLowerCase() ?? "";
      const handle = candidate.handle?.trim().toLowerCase() ?? "";
      const hasDisplayName = displayName !== "" && displayName !== identifier && displayName !== "unknown user";
      const hasHandle = handle !== "" && handle !== "@eth";
      return (
        hasDisplayName || hasHandle
      );
    };

    const fetchOtherUser = async () => {
      try {
        if (activeIdentityAddress && addressToUser && activeConversation) {
          const members = await activeConversation.members();
          const otherUser = members.find(
            member => {
              const memberIdentifiers = member.accountIdentifiers.map(accountIdentifier =>
                normalizeIdentifier(accountIdentifier.identifier)
              );
              if (selfIdentityAddresses.length > 0 && memberIdentifiers.length > 0) {
                const normalizedSelfIdentifiers = selfIdentityAddresses.map(normalizeIdentifier);
                return !memberIdentifiers.some(identifier => normalizedSelfIdentifiers.includes(identifier));
              }
              return !memberIdentifiers.includes(normalizeIdentifier(activeIdentityAddress));
            }
          );

          if (otherUser) {
            const otherIdentifiers = Array.from(
              new Set(
                otherUser.accountIdentifiers.map(identifier =>
                  normalizeIdentifier(identifier.identifier)
                )
              )
            );
            const mappedUser =
              otherIdentifiers
                .map(identifier => addressToUser[identifier])
                .find(
                  (candidate, index) =>
                    candidate &&
                    hasResolvedIdentity(candidate, otherIdentifiers[index])
                ) ||
              otherIdentifiers.map(identifier => addressToUser[identifier]).find(Boolean);
            const primaryIdentifier = otherIdentifiers[0] ?? "";
            const shouldResolveFromLens =
              !mappedUser ||
              !otherIdentifiers.some(identifier => hasResolvedIdentity(mappedUser, identifier));

            if (mappedUser && !cancelled) {
              setOtherUser(mappedUser);
            }

            if (shouldResolveFromLens) {
              let acc = null;
              for (const identifier of otherIdentifiers) {
                acc = await fetchAccount(identifier);
                if (acc) {
                  break;
                }
              }
              if (acc) {
                const accountData = getLensAccountData(acc);
                if (!cancelled) {
                  setOtherUser(accountData);
                }
                for (const identifier of otherIdentifiers) {
                  addAddressToUser(identifier, accountData);
                }
                addAddressToUser(accountData.address.toLowerCase(), accountData);
              } else if (!mappedUser && !cancelled) {
                setOtherUser({
                  address: primaryIdentifier,
                  displayName: "Unknown user",
                  picture: "",
                  coverPicture: "",
                  attributes: {},
                  bio: "",
                  handle: "",
                  id: "",
                  userLink: "",
                });
              }
            }
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingOtherUser(false);
        }
      }
    };
    setLoadingOtherUser(true);
    void fetchOtherUser();
    return () => {
      cancelled = true;
    };
  }, [
    activeConversation?.id,
    activeConversation,
    activeIdentityAddress,
    addAddressToUser,
    addressToUser,
    selfIdentityAddresses,
  ]);

  const getMessages = async (
    options?: ListMessagesOptions,
    syncFromNetwork: boolean = false
  ) => {
    if (!client) {
      return;
    }

    setMessages([]);
    setLoading(true);

    if (syncFromNetwork) {
      await client.conversations.syncAll();
      await sync();
    }

    try {
      const resolvedOptions = options ?? { limit: 200n };
      const msgs = (await activeConversation?.messages(resolvedOptions)) ?? [];
      const sortedMessages = [...msgs].sort((a, b) => {
        if (a.sentAtNs < b.sentAtNs) return -1;
        if (a.sentAtNs > b.sentAtNs) return 1;
        return 0;
      });
      setMessages(sortedMessages);
      return sortedMessages;
    } finally {
      setLoading(false);
    }
  };

  const sync = async () => {
    if (!client) {
      return;
    }

    setSyncing(true);

    try {
      await activeConversation?.sync();
    } finally {
      setSyncing(false);
    }
  };

  const send = async (message: string) => {
    if (!client) {
      return;
    }

    setSending(true);

    try {
      await activeConversation?.sendText(message);
    } finally {
      setSending(false);
    }
  };

  const streamMessages = async () => {
    const noop = () => {};
    if (!client) {
      return noop;
    }

    const stream = await activeConversation?.stream({
      onValue: message => {
        setMessages(prev => {
          if (prev.some(existing => existing.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      },
    });

    return stream
      ? () => {
          void stream.return();
        }
      : noop;
  };

  return {
    getMessages,
    loading,
    messages,
    send,
    sending,
    streamMessages,
    sync,
    syncing,
    activeConversation,
    setActiveConversation,
    notOnNetwork,
    invalidUser,
    otherUser,
    loadingOtherUser,
  };
};
