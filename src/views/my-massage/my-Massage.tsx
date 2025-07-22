"use client";

import ConversationsNav from "./ConversationsNav";
import ConversationBox from "./ConversationBox";

// const sortMessages = (messages: ConversationProp[]): ConversationProp[] => {
//   return messages.sort((a, b) => {
//     if (a.lastMessageTime === "") return 1; // Move empty to the end
//     if (b.lastMessageTime === "") return -1; // Move empty to the end
//     return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(); // Sort by most recent
//   });
// };

const MyMessageOpenChat = () => {
  // const processConversations = async (client: Client, session: SessionClient) => {
  //   const conversations = await client.conversations.list();
  //   var conversationsFilteredById: Dm<string | undefined>[] = [];
  //   var ids: any[] = [];
  //   var dates: (Date | string)[] = [];
  //   var recentMessage: string[] = [];
  //   var dataById: StringIndexedObject = {};

  //   for (let i = 0; i < conversations.length; i++) {
  //     const conversation = conversations[i];
  //     if (session.isSessionClient() && conversation.id) {
  //       const members = await conversation.members();
  //       // if (
  //       //   isConversationParticipant(
  //       //     userProfile.id,
  //       //     conversation.context?.conversationId as string
  //       //   )
  //       // ) {
  //       //   conversationsFilteredById.push(conversation);
  //       //   const otherUserID = getOtherId(
  //       //     userProfile.id,
  //       //     conversation.context?.conversationId as string
  //       //   );
  //       //   ids.push((otherUserID));
  //       //   const lastMessage = await conversation.messages();
  //       //   dates.push(
  //       //     lastMessage && lastMessage.length > 0 ? lastMessage[lastMessage.length - 1].sent : ""
  //       //   );
  //       //   recentMessage.push(
  //       //     lastMessage && lastMessage.length > 0
  //       //       ? (lastMessage[lastMessage.length - 1].content as string)
  //       //       : ""
  //       //   );
  //       //   var unreadMessage = false;
  //       //   // if (
  //       //   //   lastMessage &&
  //       //   //   lastMessage.length > 0 &&
  //       //   //   !lastMessage[lastMessage.length - 1].contentType.sameAs(
  //       //   //     ContentTypeReadReceipt
  //       //   //   ) &&
  //       //   //   lastMessage[lastMessage.length - 1].senderAddress !==
  //       //   //     session.address
  //       //   // ) {
  //       //   //   unreadMessage = true;
  //       //   // }

  //       //   dataById[otherUserID] = {
  //       //     lastMessageTime:
  //       //       lastMessage && lastMessage.length > 0 ? lastMessage[lastMessage.length - 1].sent : "",
  //       //     lastMessage:
  //       //       lastMessage && lastMessage.length > 0
  //       //         ? (lastMessage[lastMessage.length - 1].content as string)
  //       //         : "",
  //       //     conversation: conversation,
  //       //     unreadMessages: unreadMessage,
  //       //   };
  //       // }
  //     }
  //   }
  //   setMessages(conversationsFilteredById);
  //   setChatUserIds(ids);
  //   setConversationDates(dates);
  //   setLatestMessage(recentMessage);
  //   setConversationData(dataById);
  //   setShowSkeleton(false);
  //   setMessagesEnabled(true);
  //   if (messagesEnabled) setConversationUpdateState(!conversationUpdateState);
  // };

  return (
    <div className="h-screen w-screen overflow-hidden pt-[107px] sm:pt-[75px] px-[156px] banner-tablet:px-[80px] settings-xs:px-[30px] sm:px-[16px] flex gap-[5px] mb-[0px] absolute top-0 left-0">
      <ConversationsNav />
      <ConversationBox />
    </div>
  );
};

export default MyMessageOpenChat;
