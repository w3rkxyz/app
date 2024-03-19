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
			const newMessage = {
				id: messages.length + 1,
				sender: 'User',
				text: inputMessage,
			};

			setMessages([...messages, newMessage]);

			setInputMessage('');
		}
	};

	return (
		<div className="pt-[181px] sm:pt-[90px] sm:pb-5 mb-[112px] sm:mb-[230px]">
			<div className="custom-container">
				<div className="flex sm:flex-col items-center gap-[25px] h-[675px]">
					<div className="left-panel-message-section w-[250px] flex-shrink-0 sm:w-full sm:h-[428px] overflow-auto bg-[#FFFFFF]/50 rounded-[20px] px-[23px] pt-[26px] pb-[28px] shadow-2xl shadow-[#000000]/50 ">
						<h2 className="text-[20px] text-center font-semibold leading-5 tracking-[-1%] font-secondary pb-[15px]">
							Messages
						</h2>
						<div className="mb-[10px]">
							<input
								type="text"
								placeholder="[search]"
								className="h-[31px] sm:w-full rounded-[8px] pl-2 font-secondary font-medium text-[14px] leading-[20px] tracking-[-1%] text-[#00000080] "
							/>
						</div>
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]">
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]">
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]">
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]">
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]">
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]">
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
						<div className="w-[204px] sm:w-full h-[71px] flex items-center gap-3 p-[13px] mb-2 bg-white rounded-[20px]">
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

					<div className="right-panel-input-section flex-1 sm:w-ful bg-[#FFFFFF]/50 h-full sm:min-h-[428px] sm:max-h-[428px] relative rounded-[20px] p-[27px] sm:p-4 shadow-2xl shadow-[#000000]/25 flex flex-col justify-between">
						<div className="">
							<input
								type="text"
								className="h-[50px] sm:h-[46px] rounded-[10px] pl-3 text py-4 sm:py-2 w-full text-[#000000] font-semibold text-[14px] font-secondary leading-[20px] tracking-[-1%]"
							/>
							<button className="text-[14px] sm:text-[10px] h-[38px] sm:h-[26px] font-secondary font-semibold leading-[20px] sm:leading-[14px] tracking-[-1%] sm:tracking-[-3%] absolute right-[3.6%] md:right-[7.5%] sm:right-[7%] top-[4.9%] sm:top-[6.2%] bg-[#A274FF]/50 text-white  py-[9px] sm:py-[6px] px-[14px] sm:px-[10px] rounded-[6px]">
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
									className="rounded-[10px] py-4 h-[50px] sm:h-[48px] sm:py-2 pl-3 pr-[200px] w-full text-black font-semibold text-[14px]"
								/>
								<button className="w-[38px] sm:w-[24px] h-[38px] sm:h-[24px] absolute right-[9.3%] md:right-[23%] sm:right-[17%] top-[12%] sm:top-[20%] sm:p-1 border-[2px] sm:border-none rounded-[6px] border-[#000000]/50 flex justify-center items-center">
									<DownloadIcon />
								</button>
								<button
									className="text-[14px] h-[38px]  sm:w-[40px] sm:h-[40px] absolute right-[.8%] md:right-[1.5%] sm:right-[3%] top-[12%] sm:top-[9%] font-secondary font-semibold leading-[20px] tracking-[-1%] bg-[#A274FF]/50 text-white  py-[9px] sm:py-[10px] px-[12px] sm:px-3 rounded-[6px] flex items-center gap-2"
									onClick={handleSendMessage}
								>
									<span className="inline sm:hidden">
										Send
									</span>
									<Image
										src="/images/arrow-right.svg"
										alt="right arrow"
										className=""
										width={14}
										height={20}
									/>
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
