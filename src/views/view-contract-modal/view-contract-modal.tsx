import React from 'react';

const ViewContractModal = () => {
	return (
		<div className="mt-[184px] bg-[#6E6E6E]">
			<div className="custom-container">
				<div className="flex justify-center items-center">
					<div className="max-w-[614px] m-[200px] bg-[#EFEFEF] shadow-2xl shadow-[#000000]/20 w-full border-[2px] border-[#000000]/20  rounded-[20px]">
						<div className="px-[97px]">
							<h2 className="text-[36px] font-semibold font-secondary leading-[40xp] tracking-[-4%] text-center pt-[47px] pb-[51px]">
								Create A Contract
							</h2>
							<div className="">
								<div>
									<div className="mb-[22px]">
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
									<div className="mb-[22px]">
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
									<div className="mb-[22px]">
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
						<div className="flex justify-center items-center mt-[113px] mb-[15px] sm:mt-3 sm:mb-7">
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

export default ViewContractModal;
