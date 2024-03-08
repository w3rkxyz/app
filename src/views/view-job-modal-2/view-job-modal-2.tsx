import React from 'react';
import Image from 'next/image';

import MyButton from '@/reusable-components/Sidebar/Button/Button';
import {
	closeIcon,
	head,
	socials1,
	token1,
	token2,
	token3,
} from '@/icons/Icons';

const ViewJobModal2 = () => {
	return (
		<div className="find-work-section pt-[184px] pb-10">
			<div className="custom-container mt-7">
				<div className="flex justify-center items-center">
					<div className="w-[1110px] pl-[63px] pr-[78px] modal-shadow py-[47px] sm:py-5  sm:px-5 rounded-[20px] relative">
						<div>
							<Image
								src={closeIcon}
								alt=""
								className="w-[35px] h-[35px] absolute right-[23px] sm:right-7 top-[23px] sm:top-7"
							/>
						</div>
						<div className="view-job-modal2-section flex justify-between">
							<div>
								<div className="w-[250px] flex-shrink-0 sm:h-auto bg-[#FFFFFF]/50 modal-shadow rounded-[20px] py-[26px] px-[25px]">
									<div className="flex justify-center items-center">
										<div className="w-[120px] h-[110px] bg-[#FFFFFF]/70 flex justify-center items-center rounded-[16px] left-avatar-shadow">
											<div>
												<Image
													src={head}
													alt="head image"
													className="w-[65px] h-[65px] mb-2 "
												/>
												<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] ">
													adam.lens
												</p>
											</div>
										</div>
									</div>

									<div>
										<p className="text-[14px] font-semibold mt-5 mb-3 text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											Job Title
										</p>
										<div className="flex justify-around items-center">
											<div>
												<p className="text-[14px] font-semibold text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
													Following
												</p>
												<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
													100
												</p>
											</div>
											<div>
												<p className="text-[14px] font-semibold text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
													Followers
												</p>
												<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
													735
												</p>
											</div>
										</div>
									</div>

									<div className="mt-[9px]">
										<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											About
										</p>
										<p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
											bla bla bla bla bla bla bla bla bla
											bla bla bla bla bla bla bla bla bla
											bla bla bla bla bla bla bla bla bla
											bla bla bla bla bla
										</p>
									</div>

									<div className="mt-[9px]">
										<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											Skills
										</p>
										<p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
											[skill]
										</p>
										<p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
											[skill]
										</p>
										<p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
											[skill]
										</p>
									</div>

									<div className="mt-[9px]">
										<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											Links
										</p>
										<ul className="socials-widgets gap-[10px] flex mt-1">
											<li className="socials-widgets-items">
												<a href="/">
													<Image
														className="w-[14px]  h-[13.84px]"
														src={socials1}
														alt="socials icons images"
													/>
												</a>
											</li>
										</ul>
									</div>

									<div className="mt-[9px]">
										<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											Accepted Tokens
										</p>
										<ul className="socials-widgets gap-[5px] flex mt-1">
											<li className="socials-widgets-items">
												<a href="/">
													<Image
														className="w-[28px] h-[28px] bg-[#F7931A] p-1 rounded-full"
														src={token1}
														alt="socials icons images"
													/>
												</a>
											</li>
											<li className="socials-widgets-items">
												<a href="/">
													<Image
														className="w-[28px]  h-[28px]"
														src={token2}
														alt="socials icons images"
													/>
												</a>
											</li>
											<li className="socials-widgets-items">
												<a href="/">
													<Image
														className="w-[28px]  h-[28px]"
														src={token3}
														alt="socials icons images"
													/>
												</a>
											</li>
										</ul>
									</div>
								</div>
							</div>
							<div className="flex-1 pl-[79px] sm:px-0">
								<h2 className="text-[36px] font-secondary font-semibold leading-[80px] tracking-[-4%] ">
									Job Name
								</h2>
								<div>
									<div className="flex sm:flex-col justify-between">
										<div className="mb-3">
											<p className="text-[18px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000] ">
												Description
											</p>
											<p className="text-[16px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000]/50 ">
												[service description]
											</p>
										</div>
										<div>
											<div>
												<div className="mb-[13px]">
													<p className="text-[18px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000] ">
														Contract Type
													</p>
													<p className="text-[16px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000]/50 ">
														[amount in USD][fixed /
														hourly]
													</p>
												</div>
												<div className="mb-[13px]">
													<p className="text-[18px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000] ">
														Payment
													</p>
													<p className="text-[16px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000]/50 ">
														[amount in USD]
													</p>
												</div>
												<div className="mb-[13px]">
													<p className="text-[18px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000] ">
														Paid In
													</p>
													<p className="text-[16px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000]/50 ">
														[select cryptocurrency]
													</p>
												</div>
												<div className="mb-[13px]">
													<p className="text-[18px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000] ">
														Tags
													</p>
													<p className="text-[16px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-[#000000]/50 ">
														[select 1-3 tags]
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="">
							<div className="flex justify-end sm:justify-center items-center -mt-10 sm:mt-3 sm:mr-0">
								<MyButton
									buttonText="Edit"
									buttonType="terterry"
									buttonStyles="bg-[#BEC6C6]/50	text-[#000000] mr-[14.14px]"
								/>
								<MyButton
									buttonText="Delete"
									buttonType="terterry"
									buttonStyles="bg-[#FFAEAE]/50 text-[#000000]"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewJobModal2;
