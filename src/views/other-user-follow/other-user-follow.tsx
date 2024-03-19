import React from 'react';

import Sidebar from '@/components/reusable/Sidebar/Sidebar';
import JobCard from '@/components/JobCard/JobCard';
import Image from 'next/image';

const OtherUserFollow = () => {
	return (
		<div className="find-work-section pt-[105px] pb-10">
			<div className="custom-container">
				<div className="tags-section flex sm:flex-col justify-center items-center gap-[25px] mt-7">
					<div>
						<div className="sm:hidden">
							<div className="w-[250px] h-[744px] flex-shrink-0 sm:w-full sm:h-auto bg-[#FFFFFF]/50 modal-shadow rounded-[20px] py-[26px] px-[25px]">
								<div className="flex justify-center items-center">
									<div className="w-[120px] h-[110px] bg-[#FFFFFF]/70 flex justify-center items-center rounded-[16px]">
										<div>
											<Image
												src="/images/head.svg"
												alt="head image"
												className="w-[65px] h-[65px] mb-2 "
												width={65}
												height={65}
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

								<div className="flex items-center justify-center gap-[5px] my-[22px]">
									<button className="w-[93px] h-[34px] rounded-[10px] bg-[#A274FF80] text-white font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] flex justify-center items-center gap-[9px] ">
										<Image
											src="/images/man-icon.svg"
											alt="man icon"
											width={19}
											height={19}
										/>{' '}
										Follow
									</button>
									<button className="w-[93px] h-[34px] rounded-[10px] bg-white text-[#000000] font-semibold font-secondary text-[14px] leading-[20px] tracking-[-1%] ">
										Message
									</button>
								</div>

								<div>
									<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
										About Me
									</p>
									<p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
										bla bla bla bla bla bla bla bla bla bla
										bla bla bla bla bla bla bla bla bla bla
										bla bla bla bla bla bla bla bla bla bla
										bla bla
									</p>
								</div>

								<div className="mt-3">
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

								<div className="mt-3">
									<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
										Links
									</p>
									<ul className="socials-widgets gap-[10px] flex mt-1">
										<li className="socials-widgets-items">
											<a href="/">
												<Image
													className="w-[14.13px]  h-[13.18px]"
													src="/images/twitter-fo.svg"
													alt="socials icons images"
													width={14.13}
													height={13.18}
												/>
											</a>
										</li>
									</ul>
								</div>

								<div className="mt-3">
									<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
										Accepted Tokens
									</p>
									<ul className="socials-widgets gap-[5px] flex mt-1">
										<li className="socials-widgets-items">
											<a href="/">
												<Image
													className="w-[28px] h-[28px] bg-[#F7931A] p-1 rounded-full"
													src="/images/token-1.svg"
													alt="socials icons images"
													width={28}
													height={28}
												/>
											</a>
										</li>
										<li className="socials-widgets-items">
											<a href="/">
												<Image
													className="w-[28px]  h-[28px]"
													src="/images/token2.svg"
													alt="socials icons images"
													width={28}
													height={28}
												/>
											</a>
										</li>
										<li className="socials-widgets-items">
											<a href="/">
												<Image
													className="w-[28px]  h-[28px]"
													src="/images/token3.svg"
													alt="socials icons images"
													width={28}
													height={28}
												/>
											</a>
										</li>
									</ul>
								</div>
							</div>
						</div>

						{/* small screen sidebar */}
						<div className="hidden sm:block">
							<div className="w-full h-auto rounded-[20px] py-[16px]">
								<div className="flex gap-5">
									<div className="flex justify-center items-center">
										<div className="w-[120px] h-[110px] bg-[#FFFFFF]/70 flex justify-center items-center rounded-[16px]  left-avatar-shadow">
											<div>
												<Image
													src="/images/head.svg"
													alt="head image"
													className="w-[65px] h-[65px] mb-2 "
													width={65}
													height={65}
												/>
												<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] ">
													adam.lens
												</p>
											</div>
										</div>
									</div>

									<div>
										<p className="text-[14px] font-semibold mb-2  font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											Job Title
										</p>
										<div className="flex flex-wrap gap-2 items-center">
											<div>
												<p className="text-[10px] font-semibold text-center font-secondary leading-[10px] tracking-[-1%] text-[#000000] mb-1">
													Following
												</p>
												<p className="text-[10px] font-semibold font-secondary leading-[12px] tracking-[-1%] text-[#000000]/50">
													100
												</p>
											</div>
											<div>
												<p className="text-[10px] font-semibold text-center font-secondary leading-[10px] tracking-[-1%] text-[#000000] mb-1">
													Followers
												</p>
												<p className="text-[10px] font-semibold font-secondary leading-[12px] tracking-[-1%] text-[#000000]/50">
													735
												</p>
											</div>
											<div>
												<p className="text-[10px] font-semibold font-secondary leading-[10px] tracking-[-1%] text-[#000000] mb-1">
													Links
												</p>
												<ul className="socials-widgets gap-[10px] flex mt-1">
													<li className="socials-widgets-items">
														<a href="/">
															<Image
																className="w-[14.13px]  h-[13.18px]"
																src="/images/twitter-fo.svg"
																alt="socials icons images"
																width={14.13}
																height={13.18}
															/>
														</a>
													</li>
												</ul>
											</div>
											<div className="">
												<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
													Accepted Tokens
												</p>
												<ul className="socials-widgets gap-[5px] flex mt-1">
													<li className="socials-widgets-items">
														<a href="/">
															<Image
																className="w-[28px] h-[28px] bg-[#F7931A] p-1 rounded-full"
																src="/images/token-1.svg"
																alt="socials icons images"
																width={28}
																height={28}
															/>
														</a>
													</li>
													<li className="socials-widgets-items">
														<a href="/">
															<Image
																className="w-[28px]  h-[28px]"
																src="/images/token2.svg"
																alt="socials icons images"
																width={28}
																height={28}
															/>
														</a>
													</li>
													<li className="socials-widgets-items">
														<a href="/">
															<Image
																className="w-[28px]  h-[28px]"
																src="/images/token3.svg"
																alt="socials icons images"
																width={28}
																height={28}
															/>
														</a>
													</li>
												</ul>
											</div>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="mt-3">
										<p className="text-[12px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											About Me
										</p>
										<p className="text-[10px] font-semibold  font-secondary leading-[16px] tracking-[-1%] text-[#000000]/50">
											bla bla bla bla bla bla bla bla bla
											bla bla bla bla bla bla bla bla bla
											bla bla bla bla bla bla bla bla bla
											bla bla bla bla bla
										</p>
									</div>

									<div className="mt-3">
										<p className="text-[12px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											Skills
										</p>
										<p className="text-[10px] font-semibold  font-secondary leading-[16px] tracking-[-1%] text-[#000000]/50">
											[skill]
										</p>
										<p className="text-[10px] font-semibold  font-secondary leading-[16px] tracking-[-1%] text-[#000000]/50">
											[skill]
										</p>
										<p className="text-[10px] font-semibold  font-secondary leading-[16px] tracking-[-1%] text-[#000000]/50">
											[skill]
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="w-full">
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OtherUserFollow;
