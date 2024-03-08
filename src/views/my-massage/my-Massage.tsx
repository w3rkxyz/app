'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { downloadIcon, head } from '@/icons/Icons';

interface Message {
	id: number;
	sender: string;
	text: string;
}

const MyMessageOpenChat = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState('');

	const handleSendMessage = () => {
		if (inputMessage.trim() !== '') {
			// Create a new message object
			const newMessage = {
				id: messages.length + 1,
				sender: 'User', // You can replace with the actual sender's name or ID
				text: inputMessage,
			};

			// Update the messages state with the new message
			setMessages([...messages, newMessage]);

			// Clear the input field after sending the message
			setInputMessage('');
		}
	};

	return (
		<div className="pt-[180px] sm:pb-5">
			<div className="custom-container">

				<div className="flex items-center gap-[25px] h-[675px]">
					<div className="left-panel-message-section !w-[250px] h-full bg-[#FFFFFF]/50 rounded-[20px] px-[23px] pt-[26px] pb-[28px] shadow-2xl shadow-[#000000]/50 ">
						<h2 className="text-[20px] text-center font-semibold leading-5 tracking-[-1%] font-secondary pb-[15px]">

							Messages
						</h2>
						<div className="w-[204px] h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src={head}
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
								/>
							</div>
							<div>
								<div className="pt-2 sm:pt-1">
									<p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
										adam.lens
									</p>
									<p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
										[message content goes here]
									</p>
								</div>
							</div>
						</div>
						<div className="w-[204px] h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src={head}
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
								/>
							</div>
							<div>
								<div className="pt-2 sm:pt-1">
									<p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
										adam.lens
									</p>
									<p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
										[message content goes here]
									</p>
								</div>
							</div>
						</div>
						<div className="w-[204px] h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src={head}
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
								/>
							</div>
							<div>
								<div className="pt-2 sm:pt-1">
									<p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
										adam.lens
									</p>
									<p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
										[message content goes here]
									</p>
								</div>
							</div>
						</div>
						<div className="w-[204px] h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src={head}
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
								/>
							</div>
							<div>
								<div className="pt-2 sm:pt-1">
									<p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
										adam.lens
									</p>
									<p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
										[message content goes here]
									</p>
								</div>
							</div>
						</div>
						<div className="w-[204px] h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src={head}
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
								/>
							</div>
							<div>
								<div className="pt-2 sm:pt-1">
									<p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
										adam.lens
									</p>
									<p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
										[message content goes here]
									</p>
								</div>
							</div>
						</div>
						<div className="w-[204px] h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src={head}
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
								/>
							</div>
							<div>
								<div className="pt-2 sm:pt-1">
									<p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
										adam.lens
									</p>
									<p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
										[message content goes here]
									</p>
								</div>
							</div>
						</div>
						<div className="w-[204px] h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src={head}
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
								/>
							</div>
							<div>
								<div className="pt-2 sm:pt-1">
									<p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
										adam.lens
									</p>
									<p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%] text-ellipsis">
										[message content goes here]
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="right-panel-input-section w-[1005px] bg-[#FFFFFF]/50 h-full overflow-y-auto relative rounded-[20px] p-[27px] sm:p-4 shadow-2xl shadow-[#000000]/25 flex flex-col justify-between">
						{/* Contract entry input */}
						<div className="sm:mb-20">
							<input
								type="text"
								className="rounded-[10px] pl-3 text py-4 sm:py-2 w-full text-[#000000] font-semibold text-[14px] font-secondary leading-[20px] tracking-[-1%]"
							/>
							<button className="text-[14px] font-secondary font-semibold leading-[20px] tracking-[-1%] absolute right-[4%] md:right-[6.5%] sm:right-[5%] top-[4.6%] sm:top-[10%] bg-[#A274FF]/50 text-white  py-3 sm:py-[6px] px-7 sm:px-3 rounded-[10px]">
								Enter Contract
							</button>
						</div>


						<div className="justify-end">
							{messages.map((message) => (
								<div
									key={message.id}
									className="w-[204px] h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]"
								>
									<div className="-mt-1">
										<Image
											src={head}
											alt="message model image"
											className="w-[40px] h-[40px] mr-3"
										/>
									</div>
									<div>
										<div className="pt-2 sm:pt-1">
											<p className="text-[12px] font-semibold font-secondary leading-[10px] tracking-[-1%]">
												{message.sender}
											</p>
											<p className="text-[8px] font-medium font-secondary leading[0px] tracking-[-1%]">
												{message.text}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="relative">
							<input
								type="text"
								placeholder="[type message here]"
								value={inputMessage}
								onChange={(e) =>
									setInputMessage(e.target.value)
								}
								className="rounded-[10px] py-4 sm:py-2 pl-3 w-full text-black font-semibold text-[14px]"
							/>
							<button
								className="text-[14px] font-secondary font-semibold leading-[20px] tracking-[-1%] absolute right-[1%] md:right-[1.5%] sm:right-[1%] top-[8.5%] sm:top-[10.5%] bg-[#A274FF]/50 text-white  py-3 sm:py-[6px] px-7 sm:px-3 rounded-[10px]"
								onClick={handleSendMessage}
							>
								Send
							</button>
							<button className="absolute right-[13%] md:right-[22%] sm:right-[22%] top-[9.2%] sm:top-[10.5%]  w-[43px] sm:w-[30px] h-[43px] sm:h-[30px] sm:p-1 border-[2px] rounded-[10px] border-[#000000]/50 flex justify-center items-center">
								<Image
									src={downloadIcon}
									alt="download icon"
									className="w-[24px] h-[24px]"
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyMessageOpenChat;
