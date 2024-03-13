import Image from 'next/image';

interface height {
	height: string;
}

const Sidebar = ({ height }: height) => {
	return (
		<div>
			<div
				style={{ height: height }}
				className="w-[250px] sm:h-[231px] bg-[#FFFFFF] rounded-[20px] py-[26px] sm:py-[16px] px-[30px] sm:px-[16px]"
			>
				<div className="sm:flex items-center sm:gap-[16px]">
					<div className="flex justify-center items-center">
						<div className="w-[110px] h-[108px] sm:w-[95px] sm:h-[96px] bg-[#FFFFFF]/70 p-[12px] flex justify-center items-center rounded-[16px] shadow-2xl shadow-slate-200 ">
							<div>
								<div className="flex justify-center items-center">
									<Image
										src="/images/head.svg"
										alt="head image"
										className="w-[65px] h-[65px] sm:w-[48px] sm:h-[48px] mb-2 "
										width={65}
										height={65}
									/>
								</div>
								<p className="text-[14px] font-semibold sm:font-bold font-secondary leading-[20px] sm:leading-[17.6px] tracking-[-1%] ">
									adam.lens
								</p>
							</div>
						</div>
					</div>

					<div className="sm:flex sm:flex-wrap items-center gap-[16px]">
						<div>
							<p className="text-[14px] font-semibold mb-[6px] text-center sm:text-left font-secondary my-[9px] sm:my-0 leading-[20px] tracking-[-1%] text-[#000000]">
								Job Title
							</p>
							<div className="flex justify-around items-center gap-[16px]">
								<div>
									<p className="text-[14px] sm:text-[10px] font-semibold text-center font-secondary leading-[20px] sm:leading-[10px] sm:mb-[8px] tracking-[-1%] text-[#000000]">
										Following
									</p>
									<p className="text-[14px] sm:text-[10px] font-semibold font-secondary leading-[20px] sm:leading-[12px] tracking-[-1%] text-[#000000]/50">
										100
									</p>
								</div>
								<div>
									<p className="text-[14px] sm:text-[10px] font-semibold text-center font-secondary leading-[20px] sm:leading-[10px] sm:mb-[8px] tracking-[-1%] text-[#000000]">
										Followers
									</p>
									<p className="text-[14px] sm:text-[10px] font-semibold font-secondary leading-[20px] sm:leading-[12px] tracking-[-1%] text-[#000000]/50">
										735
									</p>
								</div>
								<div className="hidden sm:visible md:hidden lg:hidden">
									<p className="text-[14px] sm:text-[10px] font-semibold font-secondary leading-[20px] sm:leading-[10px] tracking-[-1%] text-[#000000] mb-[4px]">
										Links
									</p>
									<ul className="socials-widgets gap-[10px] flex mt-1">
										<li className="socials-widgets-items">
											<a href="/">
												<Image
													className="w-[22px] sm:w-[13.94px]  h-[22px] sm:h-[13px]"
													src="/images/twitter-fo.svg"
													alt="socials icons images"
													width={22}
													height={22}
												/>
											</a>
										</li>
										<li className="socials-widgets-items">
											<a href="/">
												<Image
													className="w-[22px] sm:w-[13.94px]  h-[22px] sm:h-[13px]"
													src="/images/gitHub.svg"
													alt="socials icons images"
													width={22}
													height={22}
												/>
											</a>
										</li>
										<li className="socials-widgets-items">
											<a href="/">
												<Image
													className="w-[22px] sm:w-[13.94px]  h-[22px] sm:h-[13px]"
													src="/images/linkedIn.svg"
													alt="socials icons images"
													width={22}
													height={22}
												/>
											</a>
										</li>
									</ul>
								</div>
							</div>
						</div>

						<div className="mt-[8px] sm:mt-0 hidden">
							<p className="text-[14px] sm:text-[10px] font-semibold font-secondary leading-[20px] sm:leading-[10px] tracking-[-1%] text-[#000000]">
								Links
							</p>
							<ul className="socials-widgets gap-[10px] flex mt-1">
								<li className="socials-widgets-items">
									<a href="/">
										<Image
											className="w-[22px] sm:w-[13.94px]  h-[22px] sm:h-[13px]"
											src="/images/twitter-fo.svg"
											alt="socials icons images"
											width={22}
											height={22}
										/>
									</a>
								</li>
								<li className="socials-widgets-items">
									<a href="/">
										<Image
											className="w-[22px] sm:w-[13.94px]  h-[22px] sm:h-[13px]"
											src="/images/gitHub.svg"
											alt="socials icons images"
											width={22}
											height={22}
										/>
									</a>
								</li>
								<li className="socials-widgets-items">
									<a href="/">
										<Image
											className="w-[22px] sm:w-[13.94px]  h-[22px] sm:h-[13px]"
											src="/images/linedIn.svg"
											alt="socials icons images"
											width={22}
											height={22}
										/>
									</a>
								</li>
							</ul>
						</div>

						<div className="mt-[8px] sm:mt-0 hidden">
							<p className="text-[14px] sm:text-[10px] font-semibold font-secondary leading-[20px] sm:leading-[10px] tracking-[-1%] text-[#000000]">
								Accepted Tokens
							</p>
							<ul className="socials-widgets gap-[3px] flex mt-1">
								<li className="socials-widgets-items">
									<a href="/">
										<Image
											className="w-[26.5px] h-[26.5px] sm:w-[20px] sm:h-[20px] bg-[#F7931A] rounded-full p-[2px]"
											src="/images/token-1.svg"
											alt="socials icons images"
											width={26.5}
											height={26.5}
										/>
									</a>
								</li>
								<li className="socials-widgets-items">
									<a href="/">
										<Image
											className="w-[28px]  h-[28px] sm:w-[20px] sm:h-[20px]"
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
											className="w-[28px]  h-[28px] sm:w-[20px] sm:h-[20px]"
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

				<div className="sm:flex items-center gap-[16px]">
					<div className="mt-[8px] sm:mt-[16px] sm:w-[143.5px]">
						<p className="text-[14px] sm:text-[12px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
							About
						</p>
						<p className="text-[14px] sm:text-[10px] font-semibold  font-secondary leading-[20px] sm:leading-[16px] tracking-[-1%] text-[#000000]/50">
							bla bla bla bla bla bla bla bla bla bla bla bla bla
							bla bla bla bla bla bla bla bla bla bla bla bla bla
							bla bla bla bla bla bla
						</p>
					</div>

					<div className="mt-[8px] sm:mt-0">
						<p className="text-[14px] sm:text-[12px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
							Skills
						</p>
						<p className="text-[14px] sm:text-[10px] font-semibold  font-secondary leading-[20px] sm:leading-[16px] tracking-[-1%] text-[#000000]/50">
							[skill]
						</p>
						<p className="text-[14px] sm:text-[10px] font-semibold  font-secondary leading-[20px] sm:leading-[16px] tracking-[-1%] text-[#000000]/50">
							[skill]
						</p>
						<p className="text-[14px] sm:text-[10px] font-semibold  font-secondary leading-[20px] sm:leading-[16px] tracking-[-1%] text-[#000000]/50">
							[skill]
						</p>
					</div>
				</div>

				<div className="sm:hidden mt-[8px] sm:mt-0">
					<p className="text-[14px] sm:text-[10px] font-semibold font-secondary leading-[20px] sm:leading-[10px] tracking-[-1%] text-[#000000]">
						Links
					</p>
					<ul className="socials-widgets gap-[10px] flex mt-1">
						<li className="socials-widgets-items">
							<a href="/">
								<Image
									className="w-[22px] sm:w-[13.94px]  h-[22px] sm:h-[13px]"
									src="/images/twitter-fo.svg"
									alt="socials icons images"
									width={22}
									height={22}
								/>
							</a>
						</li>
						<li className="socials-widgets-items">
							<a href="/">
								<Image
									className="w-[22px] sm:w-[13.94px]  h-[22px] sm:h-[13px]"
									src="/images/gitHub.svg"
									alt="socials icons images"
									width={22}
									height={22}
								/>
							</a>
						</li>
						<li className="socials-widgets-items">
							<a href="/">
								<Image
									className="w-[22px] sm:w-[13.94px]  h-[22px] sm:h-[13px]"
									src="/images/linkedIn.svg"
									alt="socials icons images"
									width={22}
									height={22}
								/>
							</a>
						</li>
					</ul>
				</div>

				<div className="mt-[8px] sm:mt-0 sm:hidden">
					<p className="text-[14px] sm:text-[10px] font-semibold font-secondary leading-[20px] sm:leading-[10px] tracking-[-1%] text-[#000000]">
						Accepted Tokens
					</p>
					<ul className="socials-widgets gap-[3px] flex mt-1">
						<li className="socials-widgets-items">
							<a href="/">
								<Image
									className="w-[26.5px] h-[26.5px] sm:w-[20px] sm:h-[20px] bg-[#F7931A] rounded-full p-[2px]"
									src="/images/token-1.svg"
									alt="socials icons images"
									width={26.5}
									height={26.5}
								/>
							</a>
						</li>
						<li className="socials-widgets-items">
							<a href="/">
								<Image
									className="w-[28px]  h-[28px] sm:w-[20px] sm:h-[20px]"
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
									className="w-[28px]  h-[28px] sm:w-[20px] sm:h-[20px]"
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
	);
};

export default Sidebar;
