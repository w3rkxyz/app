'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import DownloadIcon from '@/icons/DownloadIcon';

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

		<div className="pt-[205px] sm:pb-5 mb-[200px]">
			<div className="custom-container">
				<div className="flex sm:flex-col items-center gap-[25px] h-[675px]">
					<div className="left-panel-message-section w-[250px] flex-shrink-0 sm:w-full h-full sm:h-[428px] overflow-y-auto bg-[#FFFFFF]/50 rounded-[20px] px-[23px] pt-[26px] pb-[28px] shadow-2xl shadow-[#000000]/50 ">

						<h2 className="text-[20px] text-center font-semibold leading-5 tracking-[-1%] font-secondary pb-[15px]">

							Messages
						</h2>
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src="/images/head.svg"
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
									width={40}
									height={40}
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src="/images/head.svg"
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
									width={40}
									height={40}
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src="/images/head.svg"
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
									width={40}
									height={40}
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src="/images/head.svg"
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
									width={40}
									height={40}
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src="/images/head.svg"
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
									width={40}
									height={40}
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src="/images/head.svg"
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
									width={40}
									height={40}
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-[10px] bg-white rounded-[20px]">
							<div className="-mt-1">
								<Image
									src="/images/head.svg"
									alt="message model image"
									className="w-[40px] h-[40px] mr-3"
									width={40}
									height={40}
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

					<div className="right-panel-input-section flex-1 sm:w-ful bg-[#FFFFFF]/50 h-full sm:h-[428px] relative rounded-[20px] p-[27px] sm:p-4 shadow-2xl shadow-[#000000]/25 flex flex-col justify-between">
						<div className="">
							<input
								type="text"
								className="rounded-[10px] pl-3 text py-4 sm:py-2 w-full text-[#000000] font-semibold text-[14px] font-secondary leading-[20px] tracking-[-1%]"
							/>
							<button className="text-[14px] font-secondary font-semibold leading-[20px] tracking-[-1%] absolute right-[3.6%] md:right-[6.5%] sm:right-[5%] top-[4.6%] sm:top-[10%] bg-[#A274FF]/50 text-white  py-3 sm:py-[6px] px-7 sm:px-3 rounded-[10px]">
								Enter Contract
							</button>
						</div>

						<div className="overflow-y-auto overflow-x-hidden">
							<div>
								{messages.map((message) => (
									<div
										key={message.id}
										className="flex justify-end"
									>
										<div
											className="mb-[10px] h-auto bg-[#A274FF1A] rounded-[10px]"
											style={{
												width: 'fit-content',
												maxWidth: '315px',
											}}
										>
											<div>
												<div className="py-[15px]">
													<p className="text-[14px] px-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%]">
														{message.text}
													</p>
												</div>
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
									className="rounded-[10px] py-4  sm:py-2 pl-3 pr-[200px] w-full text-black font-semibold text-[14px]"
								/>
								<button className="absolute right-[12%] md:right-[22%] sm:right-[20%] top-[9.2%] sm:top-[10.5%]  w-[43px] sm:w-[30px] h-[43px] sm:h-[30px] sm:p-1 border-[2px] rounded-[10px] border-[#000000]/50 flex justify-center items-center">
									<DownloadIcon />
								</button>
								<button
									className="text-[14px] font-secondary font-semibold leading-[20px] tracking-[-1%] absolute right-[.5%] md:right-[1.5%] sm:right-[1%] top-[8.5%] sm:top-[10.5%] bg-[#A274FF]/50 text-white  py-3 sm:py-[6px] px-7 sm:px-3 rounded-[10px]"
									onClick={handleSendMessage}
								>
									Send
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyMessageOpenChat;
