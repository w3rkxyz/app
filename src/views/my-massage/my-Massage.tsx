"use client";

import ConversationsNav from "./ConversationsNav";
import ConversationBox from "./ConversationBox";
import { useState } from "react";

const MyMessageOpenChat = () => {
<<<<<<< HEAD
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

    const [isMessagesEnabled, setIsMessagesEnabled] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
  
    // Dummy data from images
    const contacts = [
      { 
        id: 1, 
        name: 'X-AE-A-13b', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=1',
        unread: 0 
      },
      { 
        id: 2, 
        name: 'Jerome White', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=2',
        unread: 0 
      },
      { 
        id: 3, 
        name: 'Madagascar Silver', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=3',
        unread: 239,
        badgeColor: 'bg-gray-900'
      },
      { 
        id: 4, 
        name: 'Pippins McGray', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=4',
        unread: 0 
      },
      { 
        id: 5, 
        name: 'McKinsey Vermillion', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=5',
        unread: 4,
        badgeColor: 'bg-gray-900'
      },
      { 
        id: 6, 
        name: 'Dorian F. Gray', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=6',
        unread: 0 
      },
      { 
        id: 7, 
        name: 'Benedict Combersmacks', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=7',
        unread: 0 
      },
      { 
        id: 8, 
        name: 'Kaori D. Miyazono', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=8',
        unread: 0 
      },
      { 
        id: 9, 
        name: 'Saylor Twift', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=9',
        unread: 0 
      },
      { 
        id: 10, 
        name: 'Miranda Blue', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=10',
        unread: 0 
      },
      { 
        id: 11, 
        name: 'Esmeralda Gray', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=11',
        unread: 0 
      },
      { 
        id: 12, 
        name: 'Oarack Babama', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=12',
        unread: 1,
        badgeColor: 'bg-gray-900'
      },
      { 
        id: 13, 
        name: 'Oarack Babama', 
        message: 'Enter your message description here...', 
        time: '12:25', 
        avatar: 'https://i.pravatar.cc/150?img=13',
        unread: 1,
        badgeColor: 'bg-gray-900'
      },
    ];
  
    const messagesData = {
      1: [
        {
          id: 1,
          sender: 'them',
          text: 'Hello my dear sir, Im here do deliver the design requirement document for our next projects.',
          time: '10:25',
          read: true
        },
        {
          id: 2,
          sender: 'them',
          file: 'Design_project_2025.docx',
          fileSize: '2.6gb • docx',
          time: '10:26',
          read: true
        },
        {
          id: 3,
          sender: 'me',
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laborl',
          time: '11:39',
          read: true
        },
        {
          id: 4,
          sender: 'them',
          text: 'Do androids truly dream of electric sheeps?',
          time: '12:25',
          read: true
        },
        {
          id: 5,
          sender: 'them',
          video: true,
          videoThumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=400&fit=crop',
          time: '04:25',
          read: true
        }
      ]
    };

    const currentContact = contacts.find(c => c.id === selectedChat);
    const currentMessages = messagesData[selectedChat] || [];

  return (
    <div className="h-screen w-screen overflow-hidden pt-[60px] sm:pt-[75px] px-[156px] banner-tablet:px-[80px] settings-xs:px-[30px] sm:px-[16px] flex gap-[5px] mb-[0px]">
      <ConversationsNav setIsMessagesEnabled={setIsMessagesEnabled} setSelectedChat={setSelectedChat} isMessagesEnabled={isMessagesEnabled} selectedChat={selectedChat} contacts={contacts} currentMessages={currentMessages}/>
      <ConversationBox currentContact={currentContact} currentMessages={currentMessages} isMessagesEnabled={isMessagesEnabled} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
=======
  return (
    <div className="h-screen w-screen overflow-hidden pt-[60px] sm:pt-[75px] px-[156px] banner-tablet:px-[80px] settings-xs:px-[30px] sm:px-[16px] flex gap-[5px] mb-[0px]">
      <ConversationsNav />
      <ConversationBox />
>>>>>>> 967b3a64439f167c2c088d857016e6387d7d8372
    </div>
  );
};

export default MyMessageOpenChat;
