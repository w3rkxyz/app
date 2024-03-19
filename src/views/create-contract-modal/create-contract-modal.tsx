import Image from 'next/image';
import React from 'react';

const CreateContractModal = () => {
	return (
		<div className="my-[130px] sm:mt-[99px] sm:mb-[89px] bg-[#6E6E6E] sm:bg-transparent">
			<div className="custom-container">
				<div className="flex justify-center items-center">
					<div className="max-w-[614px] m-[200px] md:m-[50px] sm:mx-0 sm:my-0 bg-[#EFEFEF] modal-shadow w-full border-[2px] border-[#000000]/20 sm:border-none rounded-[20px] relative">
						<div className="hidden sm:block absolute right-[10px] top-[10px]">
							<Image
								src="/images/close-2.svg"
								alt=""
								className="w-[16px] h-[16px]"
								width={16}
								height={16}
							/>
						</div>
						<div className="px-[97px] sm:px-[16px] md:px-[50px]">
							<h2 className="text-[36px] sm:text-[16px] sm:font-bold font-semibold font-secondary leading-[40xp] sm:leading-[17.6px] tracking-[-4%] text-center pt-[47px] pb-[51px] sm:py-[16px]">
								Create A Contract
							</h2>
							<div className="">
								<div>
									<div className="mb-[22px] sm:mb-[9px]">
										<label
											htmlFor="role"
											className="text-[18px] sm:text-[14px] pl-[10px] sm:pl-0 font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%]"
										>
											idk
										</label>{' '}
										<br />
										<input
											type="text"
											placeholder="[amount in USD]"
											className="py-2 sm:py-[6px] w-full h-[40px] sm:h-[29px] rounded-[10px] sm:rounded-[6px] text-[16px] sm:text-[12px] placeholder-[#00000080] font-semibold sm:font-normal font-secondary leading-[24px] sm:leading-[16.8] tracking-[-3%] mt-2 sm:mt-1 pl-[10px] sm:pl-2 border-[2px] border-[#00000033]"
										/>
									</div>
									<div className="mb-[22px] sm:mb-[9px]">
										<label
											htmlFor="role"
											className="text-[18px] sm:text-[14px] pl-[10px] sm:pl-0 font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] sm:mb-1"
										>
											idk
										</label>{' '}
										<br />
										<input
											type="text"
											placeholder="[amount in USD]"
											className="py-2 sm:py-[6px] w-full h-[40px] sm:h-[29px] rounded-[10px] sm:rounded-[6px] text-[16px] sm:text-[12px] placeholder-[#00000080] font-semibold sm:font-normal font-secondary leading-[24px] sm:leading-[16.8] tracking-[-3%] mt-2 sm:mt-1 pl-[10px] sm:pl-2 border-[2px] border-[#00000033]"
										/>
									</div>
									<div className="mb-[22px] sm:mb-[9px]">
										<label
											htmlFor="role"
											className="text-[18px] sm:text-[14px] pl-[10px] sm:pl-0 font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] sm:mb-1"
										>
											idk
										</label>{' '}
										<br />
										<input
											type="text"
											placeholder="[select token]"
											className="py-2 sm:py-[6px] w-full h-[40px] sm:h-[29px] rounded-[10px] sm:rounded-[6px] text-[16px] sm:text-[12px] placeholder-[#00000080] font-semibold sm:font-normal font-secondary leading-[24px] sm:leading-[16.8] tracking-[-3%] mt-2 sm:mt-1 pl-[10px] sm:pl-2 border-[2px] border-[#00000033]"
										/>
									</div>
									<div>
										<label
											htmlFor="role"
											className="text-[18px] sm:text-[14px] pl-[10px] sm:pl-0 font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] sm:mb-1"
										>
											idk
										</label>{' '}
										<br />
										<input
											type="text"
											placeholder="[select token]"
											className="py-2 sm:py-[6px] w-full h-[40px] sm:h-[29px] rounded-[10px] sm:rounded-[6px] text-[16px] sm:text-[12px] placeholder-[#00000080] font-semibold sm:font-normal font-secondary leading-[24px] sm:leading-[16.8] tracking-[-3%] mt-2 sm:mt-1 pl-[10px] sm:pl-2 border-[2px] border-[#00000033]"
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="flex justify-center items-center mt-[113px] md:mt-[50px] mb-[15px] sm:my-[16px]">
							<button className="button-primary !px-16 flex justify-center items-center">
								Create
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateContractModal;
