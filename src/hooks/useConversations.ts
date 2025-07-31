import {
  Identifier,
  SafeCreateGroupOptions,
  SafeListConversationsOptions,
  Dm,
} from "@xmtp/browser-sdk";
import { Utils } from "@xmtp/browser-sdk";
import { useState, useRef, useEffect } from "react";
import { useXMTPClient } from "./useXMTPClient";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import type { AccountData } from "@/utils/getLensProfile";
import useDatabase from "./useDatabase";
import type { ContentTypes } from "@/app/XMTPContext";
import { useXMTP } from "@/app/XMTPContext";

export const useConversations = () => {
  const { client } = useXMTPClient();
  const { activeConversation, setActiveConversation, setNotOnNetwork, setInvalidUser } = useXMTP();
  const { addAddressToUser } = useDatabase();
  const utilsRef = useRef<Utils | null>(null);
  const xmtpState = useSelector((state: RootState) => state.xmtp);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [conversations, setConversations] = useState<Dm<ContentTypes>[]>([]);

  function isValidDm(convo: any): convo is Dm<ContentTypes> {
    return convo && typeof convo === "object";
  }

  useEffect(() => {
    const utils = new Utils();
    utilsRef.current = utils;
    return () => {
      utils.close();
    };
  }, [client]);

  const list = async (options?: SafeListConversationsOptions, syncFromNetwork: boolean = false) => {
    if (!client) throw new Error("XMTP client not initialized");
    if (syncFromNetwork) {
      await sync();
    }

    setLoading(true);
    try {
      const convos = await client.conversations.list(options);
      const addedConvos = convos.filter(convo => isValidDm(convo));
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

  const newGroup = async (inboxIds: string[], options?: SafeCreateGroupOptions) => {
    if (!client) throw new Error("XMTP client not initialized");
    setLoading(true);
    try {
      const conversation = await client.conversations.newGroup(inboxIds, options);
      return conversation;
    } finally {
      setLoading(false);
    }
  };

  const newGroupWithIdentifiers = async (
    identifiers: Identifier[],
    options?: SafeCreateGroupOptions
  ) => {
    if (!client) throw new Error("XMTP client not initialized");
    setLoading(true);
    try {
      const conversation = await client.conversations.newGroupWithIdentifiers(identifiers, options);
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
      const conversation = await client.conversations.newDm(inboxId);
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
      if (!utilsRef.current) return;
      const inboxId = await utilsRef.current.getInboxIdForIdentifier(identifier, "production");
      console.log("Id: ", inboxId);

      console.log("Got here 4");
      if (!inboxId) {
        console.log("Got here 5");
        setInvalidUser(user);
        userNotOnNetwork();
      } else {
        console.log("Got here 6");
        const conversation = await client.conversations.newDmWithIdentifier(identifier);
        addAddressToUser(user.address, user);
        return conversation;
      }
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
    const onConversation = (error: Error | null, conversation: Dm<ContentTypes> | undefined) => {
      if (conversation) {
        const shouldAdd =
          conversation.metadata?.conversationType === "dm" ||
          conversation.metadata?.conversationType === "group";
        if (shouldAdd) {
          setConversations(prev => [conversation, ...prev]);
        }
      }
    };

    const stream = await client.conversations.stream(onConversation);

    return () => {
      void stream.return(undefined);
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
