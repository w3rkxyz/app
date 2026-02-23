// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import { useState, useEffect, useCallback, useRef } from "react";
// import { useConversation } from "@/hooks/useConversation";
// import { useXMTP } from "@/app/XMTPContext";
// import ConversationInput from "./ConversationInput";
// import ConversationMessages from "./ConversationMessages";
// import ConversationHeader from "./ConversationHeader";

// const ConversationBox = () => {
//   const {
//     activeConversation,
//     setActiveConversation,
//     notOnNetwork,
//     invalidUser,
//     messages,
//     getMessages,
//     loading: conversationLoading,
//     syncing: conversationSyncing,
//     streamMessages,
//   } = useConversation();
//   const { client } = useXMTP();
//   const [inputMessage, setInputMessage] = useState("");

//   const stopStreamRef = useRef<(() => void) | null>(null);

//   const startStream = useCallback(async () => {
//     stopStreamRef.current = await streamMessages();
//   }, [streamMessages]);

//   const stopStream = useCallback(() => {
//     stopStreamRef.current?.();
//     stopStreamRef.current = null;
//   }, []);

//   useEffect(() => {
//     const loadMessages = async () => {
//       stopStream();
//       await getMessages(undefined, true);
//       await startStream();
//     };
//     void loadMessages();
//     return () => {
//       stopStream();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeConversation?.id]);

//   const handleSync = useCallback(async () => {
//     stopStream();
//     await getMessages(undefined, true);
//     await startStream();
//   }, [getMessages, startStream, stopStream]);

//   useEffect(() => {}, [messages]);

//   return (
//     <div
//       className={`horizontal-box bg-[#FCFCFC] ${
//         activeConversation !== undefined ? "" : "sm:hidden"
//       } flex-1 px-[12px]`}
//     >
//       {!client ? (
//         <div className="flex flex-col gap-[5px] mt-[8px]"></div>
//       ) : notOnNetwork && invalidUser ? (
//         <div className="flex flex-col h-full">
//           <div className="flex justify-start sm:gap-[18px] items-center py-[10px] px-[0px]">
//             <Image
//               src={"/images/arrow-left.svg"}
//               className="hidden sm:block cursor-pointer"
//               alt="paco pic"
//               width={24}
//               height={24}
//               onClick={() => setActiveConversation(undefined)}
//             />
//             <div className="flex gap-[10px]">
//               <Image src={invalidUser.picture} alt="paco pic" width={43} height={43} />
//               <div className="flex flex-col gap-[2px] pt-[5px]">
//                 <span className="text-[14px] leading-[16.94px] font-medium">
//                   {invalidUser.displayName}
//                 </span>
//                 <span className="text-[14px] leading-[16.94px] font-medium text-[#707070]">
//                   {invalidUser.handle}
//                 </span>
//               </div>
//             </div>
//           </div>
//           <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
//           <div className="flex-1 flex flex-col justify-center items-center align-middle">
//             <Image
//               src="/images/mail.svg"
//               className="cursor-pointer"
//               alt="new message"
//               width={28}
//               height={28}
//             />
//             <span className="leading-[16.94px] text-center font-bold text-[14px] text-black mt-[6px]">
//               User is not on XMTP
//             </span>
//           </div>
//           <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
//           <div className="flex py-[12px] gap-[5px] w-full items-center">
//             <input
//               className="form-input rounded-[8px] p-[10px] border-[1px] border-[#E4E4E7] w-full"
//               placeholder="Type your message here.."
//               disabled
//             />
//             <button 
//               className="rounded-[8px] bg-[#F4F4F5] p-[9px] h-fit" 
//               disabled
//               aria-label="Share message"
//             >
//               <Image src={"/images/share.svg"} alt="Share" width={24} height={24} />
//             </button>
//             <button
//               className="px-[18px] sm:px-[10px] py-[10px] bg-[#C6AAFF] hover:bg-[#351A6B] rounded-[8px] flex w-fit gap-[7px] h-fit items-center"
//               disabled
//             >
//               <span className="text-[15px] text-white leading-none sm:hidden">Send</span>
//               <Image src={"/images/arrow-right.svg"} alt="paco pic" width={16} height={16} />
//             </button>
//           </div>
//         </div>
//       ) : activeConversation !== undefined ? (
//         <div className="flex flex-col h-full">
//           <ConversationHeader />
//           <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
//           <ConversationMessages messages={messages} />
//           <hr className="bg-[#E4E4E7] h-[1px] mb-[0px]" />
//           <ConversationInput />
//         </div>
//       ) : (
//         <div className="flex items-center justify-center h-full">
//           <div className="flex flex-col gap-[11px] justify-center items-center">
//             <Image
//               src="/images/discuss.svg"
//               className="cursor-pointer"
//               alt="new message"
//               width={24}
//               height={21}
//             />
//             <span className="leading-[16.94px] font-medium text-[14px] text-black">
//               Select a conversation to start messaging
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ConversationBox;


'use client';

import React, { useState } from 'react';
import { Search, Edit, MoreVertical, Send, Smile, Paperclip, Check, ArrowLeft, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { SVGArrowLeft, SVGEmojis, SVGLink, SVGSend } from '@/assets/list-svg-icon';

const ConversationBox = ({ currentContact, currentMessages, selectedChat, setSelectedChat, isMessagesEnabled }) => {
  // App states
  // const [isMessagesEnabled, setIsMessagesEnabled] = useState(false);
  // const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

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

  // Detect mobile view
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // const currentContact = contacts.find(c => c.id === selectedChat);
  // const currentMessages = messagesData[selectedChat] || [];

  // STATE 1: Messages not enabled (Image 5)
  if (!isMessagesEnabled) {
    return (
      <div className="h-screen flex items-center sm:hidden md:block lg:block justify-center w-full bg-[#FCFCFC]">
      </div>
    );
  }

  // STATE 2: No conversation selected (Image 4)
  if (!selectedChat && isMessagesEnabled) {
    return (
      <div className=" h-screen flex sm:hidden w-full bg-[#FCFCFC]">
        {/* Sidebar */}
        {/* <div className={`${isMobile ? 'w-full' : 'w-80'} bg-white border-r border-gray-200 flex flex-col`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
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
          </div>

          <div className="flex-1 overflow-y-auto">
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
                    <h3 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500 ml-2">{contact.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{contact.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Empty state - Desktop only */}
        {!isMobile && (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center flex flex-col items-center justify-center">
              <Image src={'/images/ChatsCircle.svg'} alt="" width={64} height={64} />
              <p className="text-gray-500 text-sm">Select a conversation to</p>
              <p className="text-gray-500 text-sm">start messaging</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STATE 3 & 4: Conversation selected - Mobile (Images 2 & 3) or Desktop (Image 1)
  if (isMobile) {
    // MOBILE VIEW
    return (
      <div className="h-screen bg-[#FCFCFC] flex flex-col w-full">
        {/* Mobile Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center sm:px-0 md:px-4 lg:px-4 gap-3">
          <button 
            onClick={() => setSelectedChat(null)}
            className=" hover:bg-gray-100 rounded-lg transition-colors"
          >
          <SVGArrowLeft />
          </button>
          <img 
            src={currentContact?.avatar} 
            alt={currentContact?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">{currentContact?.name}</h2>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-[12px] text-gray-500">@azusanakano_1997</p>
          </div>
          <button className="px-3 py-1.5 bg-gray-900 text-white text-[12px] flex items-center gap-1 rounded-full hover:bg-gray-800 transition-colors">
            <Image src={'/images/add.svg'} height={16} width={16} alt='' /> 
            Create Contract
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4">
          <div className="text-center">
            <span className="text-sm text-gray-500">19 August</span>
          </div>

          {currentMessages.map((message) => (
            <div key={message.id}>
              {message.sender === 'them' ? (
                <div className="flex w-[260px] max-w-xl">
                  <img 
                    src={currentContact?.avatar} 
                    alt={currentContact?.name}
                    className="w-8 h-8 rounded-full sm:hidden md:block lg:block object-cover flex-shrink-0"
                  />
                  <div className="flex-1 relative">
                    {message.file ? (
                      <div className="bg-white border border-gray-200 rounded-2xl px-1 pt-1 pb-8 w-full inline-block">
                        <div className="flex items-start gap-3 border-[0.5px] bg-[#F8F8F8] border-[#C3C7CE] p-3 rounded-2xl">
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{message.file}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{message.fileSize}</p>
                          </div>
                        </div>
                      </div>
                    ) : message.video ? (
                      <div className="relative rounded-2xl w-full overflow-hidden h-56 bg-white border-[0.5px] border-[#C3C7CE]  px-1 py-1 pb-8">
                        <img 
                          src={message.videoThumbnail}
                          alt="Video thumbnail" 
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <button className="absolute inset-0 flex items-center justify-center  hover:bg-opacity-30 transition-all">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white border-[0.5px] border-[#C3C7CE] rounded-2xl  px-4 py-3 pb-6">
                        <p className="text-sm text-[#6C6C6C]">{message.text}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1 px-1 absolute bottom-2 right-2">
                      <span className="text-[12px] text-gray-500">{message.time}</span>
                      {message.read && (
                        <div className="flex items-center">
                          <Check size={12} className="text-blue-600" />
                          <Check size={12} className="text-blue-600 -ml-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-xl w-[260px] relative">
                    <div className="bg-[#212121] rounded-2xl rounded-tr-md px-4 py-3">
                      <p className="text-sm text-white">{message.text}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1 px-1 absolute bottom-2 right-2">
                      <span className="text-[12px] text-[#C4C4C4]">{message.time}</span>
                      {message.read && (
                        <div className="flex items-center">
                          <Check size={12} className="text-[#C4C4C4]" />
                          <Check size={12} className="text-[#C4C4C4] -ml-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="text-center">
            <span className="text-sm text-gray-500">Today</span>
          </div>

          <div className="flex gap-3 w-[260px] max-w-xl">
            <img 
              src={currentContact?.avatar} 
              alt={currentContact?.name}
              className="w-8 h-8 rounded-full sm:hidden md:block lg:block object-cover flex-shrink-0"
            />
            <div className="flex-1 relative">
              <div className="bg-white border border-gray-200 rounded-2xl  px-4 py-3">
                <p className="text-sm text-gray-900">Do androids truly dream of electric sheeps?</p>
              </div>
              <div className="flex items-center gap-2 mt-1 px-1 absolute bottom-2 right-2">
                <span className="text-[12px] text-gray-500">12:25</span>
                <div className="flex items-center">
                  <Check size={12} className="text-gray-400" />
                  <Check size={12} className="text-gray-400 -ml-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* <div className="flex gap-3 max-w-xl">
            <img 
              src={currentContact?.avatar} 
              alt={currentContact?.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden w-96 h-56 bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=400&fit=crop"
                  alt="Video thumbnail" 
                  className="w-full h-full object-cover"
                />
                <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-xs text-gray-500">04:25</span>
                <div className="flex items-center">
                  <Check size={12} className="text-gray-400" />
                  <Check size={12} className="text-gray-400 -ml-1.5" />
                </div>
              </div>
              <button className="mt-2 p-1 hover:bg-gray-100 rounded transition-colors">
                <MoreVertical size={16} className="text-gray-500" />
              </button>
            </div>
          </div> */}
        </div>

        {/* Message Input */}
        {/* <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip size={18} className="text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Smile size={18} className="text-gray-500" />
            </button>
            <input
              type="text"
              placeholder="Send a message..."
              className="flex-1 px-3 py-2 bg-transparent text-sm focus:outline-none text-gray-900 placeholder-gray-400"
            />
            <button className="p-2.5 bg-gray-900 hover:bg-gray-800 rounded-full transition-colors">
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div> */}
        <div style={{ boxShadow: '0px 12px 16px -4px #10182814' }} className="bg-[#FCFCFC] mb-12 mt-5 pb-10">
          <div className="w-full">
            <form onSubmit={handleSubmit}>
              {/* Input Container */}
              <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 p-6 flex flex-col gap-6">
                {/* Text Input */}
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send a message..."
                  className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent text-[15px] leading-relaxed"
                />

                {/* Bottom Row: Icons and Send Button */}
                <div className="flex items-center justify-between">
                  {/* Left Icons */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label="Attach file"
                    >
                      <SVGLink />
                    </button>

                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label="Add emoji"
                    >
                      <SVGEmojis />
                    </button>
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-black text-white rounded-full px-6 py-2.5 flex items-center gap-2.5 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium text-[15px]">Send</span>
                    <SVGSend />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP VIEW
  return (
    <div className="flex w-full bg-[#FCFCFC]">
      <div className="flex-1 flex flex-col">
        <div style={{ boxShadow: '0px 2px 9px 0px #0000000D' }} className="h-16 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img 
              src={currentContact?.avatar} 
              alt={currentContact?.name}
              className="w-10 h-10 rounded-full sm:hidden md:block lg:block object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">{currentContact?.name}</h2>
                <span className="px-2 py-0.5 bg-[#F0FDF4] border border-[#38B764] text-[#38B764] text-[12px] rounded-full font-medium flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#109A43] rounded-full"></div>
                  Online
                </span>
              </div>
              <p className="text-sm text-gray-500">@azusanakano_1997</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Image src={'/images/add.svg'} height={20} width={20} alt='' /> 
            Create Contract
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-center">
            <span className="text-sm text-[#94A3B8]">19 August</span>
          </div>

          {currentMessages.map((message) => (
            <div key={message.id}>
              {message.sender === 'them' ? (
                <div className="flex gap-3 max-w-xl">
                  <img 
                    src={currentContact?.avatar} 
                    alt={currentContact?.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 relative">
                    {message.file ? (
                      <div className="bg-white border border-gray-200 rounded-2xl px-1 pt-1 pb-8 w-full inline-block">
                        <div className="flex items-start gap-3 border-[0.5px] bg-[#F8F8F8] border-[#C3C7CE] p-3 rounded-2xl">
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          <div>
                            <p className="text-base font-semibold text-gray-900">{message.file}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{message.fileSize}</p>
                          </div>
                        </div>
                      </div>
                    ) : message.video ? (
                      <div className="relative rounded-2xl w-full overflow-hidden h-56 bg-white border-[0.5px] border-[#C3C7CE]  px-1 py-1 pb-8">
                        <img 
                          src={message.videoThumbnail}
                          alt="Video thumbnail" 
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <button className="absolute inset-0 flex items-center justify-center  hover:bg-opacity-30 transition-all">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white border-[0.5px] border-[#C3C7CE] rounded-2xl  px-4 py-3 pb-6">
                        <p className="text-sm text-[#6C6C6C]">{message.text}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1 px-1 absolute bottom-2 right-2">
                      <span className="text-[12px] text-gray-500">{message.time}</span>
                      {message.read && (
                        <div className="flex items-center">
                          <Check size={12} className="text-blue-600" />
                          <Check size={12} className="text-blue-600 -ml-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-xl relative">
                    <div className="bg-[#212121] rounded-2xl rounded-tr-md px-4 py-3">
                      <p className="text-sm text-white">{message.text}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1 px-1 absolute bottom-2 right-2">
                      <span className="text-[12px] text-[#C4C4C4]">{message.time}</span>
                      {message.read && (
                        <div className="flex items-center">
                          <Check size={12} className="text-[#C4C4C4]" />
                          <Check size={12} className="text-[#C4C4C4] -ml-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="text-center">
            <span className="text-xs text-gray-500">Today</span>
          </div>

          <div className="flex gap-3 max-w-xl">
            <img 
              src={currentContact?.avatar} 
              alt={currentContact?.name}
              className="w-8 h-8 rounded-full object-cover sm:hidden md:block lg:block flex-shrink-0"
            />
            <div className="flex-1 relative">
              <div className="bg-white border border-gray-200 rounded-2xl  px-4 py-3">
                <p className="text-sm text-gray-900">Do androids truly dream of electric sheeps?</p>
              </div>
              <div className="flex items-center gap-2 mt-1 px-1 absolute bottom-2 right-2">
                <span className="text-[12px] text-gray-500">12:25</span>
                <div className="flex items-center">
                  <Check size={12} className="text-gray-400" />
                  <Check size={12} className="text-gray-400 -ml-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* <div className="flex gap-3 max-w-xl">
            <img 
              src={currentContact?.avatar} 
              alt={currentContact?.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden w-96 h-56 bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=400&fit=crop"
                  alt="Video thumbnail" 
                  className="w-full h-full object-cover"
                />
                <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-xs text-gray-500">04:25</span>
                <div className="flex items-center">
                  <Check size={12} className="text-gray-400" />
                  <Check size={12} className="text-gray-400 -ml-1.5" />
                </div>
              </div>
              <button className="mt-2 p-1 hover:bg-gray-100 rounded transition-colors">
                <MoreVertical size={16} className="text-gray-500" />
              </button>
            </div>
          </div> */}
        </div>

        <div style={{ boxShadow: '0px 12px 16px -4px #10182814' }} className="bg-[#FCFCFC] p-4 pb-10">
          {/* <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip size={20} className="text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Smile size={20} className="text-gray-500" />
            </button>
            <input
              type="text"
              placeholder="Send a message..."
              className="flex-1 px-4 py-2 bg-transparent text-sm focus:outline-none text-gray-900 placeholder-gray-400"
            />
            <button className="p-3 bg-gray-900 hover:bg-gray-800 rounded-full transition-colors">
              <Send size={18} className="text-white" />
            </button>
          </div> */}
          <div className="w-full max-w-[980px] mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Input Container */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 p-6 flex flex-col gap-6">
          {/* Text Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent text-[15px] leading-relaxed"
          />

          {/* Bottom Row: Icons and Send Button */}
          <div className="flex items-center justify-between">
            {/* Left Icons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Attach file"
              >
                <SVGLink />
              </button>

              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Add emoji"
              >
                <SVGEmojis />
              </button>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-black text-white rounded-full px-6 py-2.5 flex items-center gap-2.5 hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-medium text-[15px]">Send</span>
              <SVGSend />
            </button>
          </div>
        </div>
      </form>
    </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
