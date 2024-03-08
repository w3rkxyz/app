import React from 'react';
import Image from 'next/image';
import { closeIcon } from '@/icons/Icons';

const PostJobModal = () => {
	return (
		<div className="mt-[181px] sm:my-[100px]">
			<div className="custom-container">
				<div className="shadow-2xl shadow-[#000000]/50 max-w-[1110px] w-full mx-auto relative rounded-[20px] px-[108px] py-[28px] sm:py-[15px] sm:px-5 ">
					<div className="absolute top-[10px] right-[10px] sm:top-[10px]">
						<Image
							src={closeIcon}
							alt="close icon"
							className="w-[35px] sm:w-[25px] h-[35px] sm:h-[25px]"
						/>
					</div>
					<h2 className="text-[36px] sm:text-[25px] font-semibold font-secondary leading-[40xp] tracking-[-4%] text-center pb-[10px]">
						Post A Job
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-1 gap-10 sm:gap-3">
						<div>
							<div className="my-5">
								<label
									htmlFor="role"
									className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
								>
									Role
								</label>{' '}
								<br />
								<input
									type="text"
									className="py-2 w-full rounded-[10px] h-[40px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
								/>
							</div>

							<label
								htmlFor="description"
								className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
							>
								Description
							</label>
							<br />
							<textarea
								placeholder="[job description]"
								className="py-2 w-full rounded-[10px] h-[313px] resize-none text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
							/>
						</div>
						<div>
							<div className="my-5 sm:mb-5 sm:mt-0">
								<label
									htmlFor="role"
									className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
								>
									Contract Type
								</label>{' '}
								<br />
								<input
									type="text"
									placeholder="[permanent/task]"
									className="py-2 w-full rounded-[10px] h-[40px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
								/>
							</div>
							<div className="my-5">
								<label
									htmlFor="role"
									className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
								>
									Payment
								</label>{' '}
								<br />
								<input
									type="text"
									placeholder="[amount in USD]"
									className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
								/>
								<div className="flex justify-end -mt-[40px]">
									<button className="py-[6px] px-[9px] border-2  border-[#000000]/20 bg-white text-[#000000]/50 rounded-[10px] text-[16px] font-semibold font-secondary leading-[24px] tracking-[-3%] ">
										[fixed/hourly]
									</button>
								</div>
							</div>
							<div className="my-5">
								<label
									htmlFor="role"
									className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
								>
									Paid In
								</label>{' '}
								<br />
								<input
									type="text"
									placeholder="[select token]"
									className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
								/>
							</div>
							<div className="my-5">
								<label
									htmlFor="role"
									className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
								>
									Tags
								</label>{' '}
								<br />
								<input
									type="text"
									placeholder="[select 3 tags minimum]"
									className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
								/>
							</div>
						</div>
					</div>
					<div className="flex justify-center items-center mt-[34px] sm:mt-3 sm:mb-3">
						<button className="button-primary w-[186px] h-[56px] !px-16 flex justify-center items-center">
							Post
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PostJobModal;
