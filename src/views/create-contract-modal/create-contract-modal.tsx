import { close2 } from '@/icons/Icons';
import Image from 'next/image';
import React from 'react';

const CreateContractModal = () => {
	return (
		<div className="my-[130px] sm:my-[99px] bg-[#6E6E6E] sm:bg-transparent">
			<div className="custom-container">
				<div className="flex justify-center items-center">
					<div className="max-w-[614px] m-[200px] md:m-[50px] sm:mx-0 sm:my-0 bg-[#EFEFEF] modal-shadow w-full border-[2px] border-[#000000]/20 sm:border-none rounded-[20px] relative">
						<div className="absolute right-[10px] top-[10px] lg:hidden">
							<Image
								src={close2}
								alt=""
								className="w-[16px] h-[16px]"
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
											className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
										>
											idk
										</label>{' '}
										<br />
										<input
											type="text"
											placeholder="[amount in USD]"
											className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
										/>
									</div>
									<div className="mb-[22px] sm:mb-[9px]">
										<label
											htmlFor="role"
											className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
										>
											idk
										</label>{' '}
										<br />
										<input
											type="text"
											placeholder="[amount in USD]"
											className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
										/>
									</div>
									<div className="mb-[22px] sm:mb-[9px]">
										<label
											htmlFor="role"
											className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
										>
											idk
										</label>{' '}
										<br />
										<input
											type="text"
											placeholder="[select token]"
											className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
										/>
									</div>
									<div>
										<label
											htmlFor="role"
											className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
										>
											idk
										</label>{' '}
										<br />
										<input
											type="text"
											placeholder="[select token]"
											className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="flex justify-center items-center mt-[113px] md:mt-[50px] mb-[15px] sm:mt-[16px] sm:mb-[16px]">
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
