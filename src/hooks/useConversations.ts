"use client";

import {
  Identifier,
  ListConversationsOptions,
  CreateGroupOptions,
  Dm,
  Group,
  ConversationType,
} from "@xmtp/browser-sdk";
import { useState } from "react";
import { useXMTPClient } from "./useXMTPClient";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import type { AccountData } from "@/utils/getLensProfile";
import useDatabase from "./useDatabase";
import type { ContentTypes } from "@/app/XMTPContext";
import { useXMTP } from "@/app/XMTPContext";

export const useConversations = () => {
  const { client } = useXMTPClient();
  const { activeConversation, setActiveConversation, setNotOnNetwork, setInvalidUser } = useXMTP();
  const { addAddressToUser } = useDatabase();
  const xmtpState = useSelector((state: RootState) => state.xmtp);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [conversations, setConversations] = useState<Dm<ContentTypes>[]>([]);
  const isDm = (conversation: Group<ContentTypes> | Dm<ContentTypes>): conversation is Dm<ContentTypes> =>
    conversation instanceof Dm;

  const list = async (options?: ListConversationsOptions, syncFromNetwork: boolean = false) => {
    if (!client) throw new Error("XMTP client not initialized");
    if (syncFromNetwork) {
      await syncAll();
    }

    setLoading(true);
    try {
      const convos = await client.conversations.list(options);
      const addedConvos = convos.filter(isDm);
      setConversations(addedConvos);
    } finally {
      setLoading(false);
    }
  };

  const sync = async () => {
    if (!client) throw new Error("XMTP client not initialized");
    setSyncing(true);
    try {
      await client.conversations.sync();
    } finally {
      setSyncing(false);
    }
  };

  const syncAll = async () => {
    if (!client) throw new Error("XMTP client not initialized");
    setSyncing(true);
    try {
      await client.conversations.syncAll();
    } finally {
      setSyncing(false);
    }
  };

  const getConversationById = async (conversationId: string) => {
    if (!client) throw new Error("XMTP client not initialized");
    setLoading(true);
    try {
      const conversation = await client.conversations.getConversationById(conversationId);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const getMessageById = async (messageId: string) => {
    if (!client) throw new Error("XMTP client not initialized");
    setLoading(true);
    try {
      const message = await client.conversations.getMessageById(messageId);
      return message;
    } finally {
      setLoading(false);
    }
  };

  const newGroup = async (inboxIds: string[], options?: CreateGroupOptions) => {
    if (!client) throw new Error("XMTP client not initialized");
    setLoading(true);
    try {
      const conversation = await client.conversations.createGroup(inboxIds, options);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const newGroupWithIdentifiers = async (
    identifiers: Identifier[],
    options?: CreateGroupOptions
  ) => {
    if (!client) throw new Error("XMTP client not initialized");
    setLoading(true);
    try {
      const conversation = await client.conversations.createGroupWithIdentifiers(identifiers, options);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const userNotOnNetwork = () => {
    setNotOnNetwork(true);
  };

  const newDm = async (inboxId: string, user: AccountData) => {
    if (!client) throw new Error("XMTP client not initialized");
    setLoading(true);
    try {
      const conversation = await client.conversations.createDm(inboxId);
      addAddressToUser(user.address, user);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const newDmWithIdentifier = async (identifier: Identifier, user: AccountData) => {
    if (!client) throw new Error("XMTP client not initialized");
    setLoading(true);
    try {
      const conversation = await client.conversations.createDmWithIdentifier(identifier);
      addAddressToUser(user.address.toLowerCase(), user);
      return conversation;
    } catch (e) {
      console.error(e);
      console.log(e);
      return "Failed";
    } finally {
      setLoading(false);
    }
  };

  const stream = async () => {
    if (!client) throw new Error("XMTP client not initialized");
    const stream = await client.conversations.stream({
      conversationType: ConversationType.Dm,
      onValue: conversation => {
        if (conversation instanceof Dm) {
          setConversations(prev => {
            const alreadyExists = prev.some(existing => existing.id === conversation.id);
            return alreadyExists ? prev : [conversation, ...prev];
          });
        }
      },
    });

    return () => {
      void stream.return();
    };
  };

  const selectConversation = (conversation: Dm<ContentTypes> | undefined) => {
    if (conversation) {
      setNotOnNetwork(false);
      setInvalidUser(undefined);
      setActiveConversation(conversation);
    } else {
      setActiveConversation(undefined);
    }
  };

  return {
    conversations,
    getConversationById,
    getMessageById,
    list,
    loading,
    newDm,
    newDmWithIdentifier,
    newGroup,
    newGroupWithIdentifiers,
    stream,
    sync,
    syncAll,
    syncing,
    dmUser: xmtpState.activeUser,
    userNotOnNetwork,
    activeConversation,
    selectConversation,
  };
};
