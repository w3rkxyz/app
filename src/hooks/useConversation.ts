import type { DecodedMessage, SafeListMessagesOptions, Dm } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { useXMTPClient } from "./useXMTPClient";
import { ContentTypes } from "@/app/XMTPContext";
import { useXMTP } from "@/app/XMTPContext";
import type { AccountData } from "@/utils/getLensProfile";
import useDatabase from "./useDatabase";
import { useAccount } from "wagmi";
import { fetchAccount } from "./useSearchAccounts";
import getLensAccountData from "@/utils/getLensProfile";

export const useConversation = () => {
  const { client } = useXMTPClient();
  const { activeConversation, setActiveConversation, notOnNetwork, invalidUser } = useXMTP();
  const { address } = useAccount();
  const { addressToUser } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<DecodedMessage<ContentTypes>[]>([]);
  const [otherUser, setOtherUser] = useState<AccountData | null>(null);
  const [loadingOtherUser, setLoadingOtherUser] = useState(true);

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (address && addressToUser && activeConversation) {
        const members = await activeConversation.members();

        const otherUser = members.find(
          member => member.accountIdentifiers[0].identifier !== address
        );

        if (otherUser) {
          const user = addressToUser[otherUser.accountIdentifiers[0].identifier];
          if (user) {
            setOtherUser(user);
          } else {
            const acc = await fetchAccount(otherUser.accountIdentifiers[0].identifier);
            if (acc) {
              const accountData = getLensAccountData(acc);
              setOtherUser(accountData);
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
              setOtherUser(tempUser);
            }
          }
        }
      }
      setLoadingOtherUser(false);
    };
    fetchOtherUser();
  }, [activeConversation?.id, address, addressToUser, activeConversation]);

  const getMessages = async (
    options?: SafeListMessagesOptions,
    syncFromNetwork: boolean = false
  ) => {
    if (!client) {
      return;
    }

    setMessages([]);
    setLoading(true);

    if (syncFromNetwork) {
      await sync();
    }

    try {
      const msgs = (await activeConversation?.messages(options)) ?? [];
      setMessages(msgs);
      return msgs;
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
      await activeConversation?.send(message);
    } finally {
      setSending(false);
    }
  };

  const streamMessages = async () => {
    const noop = () => {};
    if (!client) {
      return noop;
    }

    const onMessage = (error: Error | null, message: DecodedMessage<ContentTypes> | undefined) => {
      if (message) {
        setMessages(prev => [...prev, message]);
      }
    };

    const stream = await activeConversation?.stream(onMessage);

    return stream
      ? () => {
          void stream.return(undefined);
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
