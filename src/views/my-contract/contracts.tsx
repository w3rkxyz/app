import React from 'react';

import Sidebar from '@/components/reusable/Sidebar/Sidebar';

const MyContracts = () => {
	return (
		<div className="find-work-section pt-[205px] pb-10">
			<div className="custom-container mt-7">
				<div className="my-contracts-section flex sm:flex-col justify-between items-center gap-[25px]">
					<div>
						<Sidebar height="692px" />
					</div>
					<div className="w-full">
						<div className="flex justify-center items-center mb-[21px] mt-[23px]">
							<div className="bg-white rounded-[10px] flex justify-between p-1">
								<button className="bg-[#A274FF]/50 text-white py-3 rounded-[10px] px-8 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] ">
									Active
								</button>
								<button className="bg-white py-3 rounded-[10px] px-8 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%]">
									Ended
								</button>
							</div>
						</div>
						<div className="grid grid-rows-4 gap-[21px]">
							<div className="bg-white rounded-[20px] sm:h-[197px] h-[132px]">
								hello
							</div>
							<div className="bg-white rounded-[20px] sm:h-[197px] h-[132px]">
								hello
							</div>
							<div className="bg-white rounded-[20px] sm:h-[197px] h-[132px]">
								hello
							</div>
							<div className="bg-white rounded-[20px] sm:h-[197px] h-[132px]">
								hello
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyContracts;
