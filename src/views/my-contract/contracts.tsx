'use client';

import React, { useState } from 'react';

import Sidebar from '@/components/reusable/Sidebar/Sidebar';

const MyContracts = () => {
	const [isActive, setIsActive] = useState(true);

	const handleButtonClick = () => {
		setIsActive(!isActive); 
	};

	return (
		<div className="find-work-section pt-[184px] sm:pt-[90px] pb-[114px] sm:pb-10">
			<div className="custom-container">
				<div className="my-contracts-section flex sm:flex-col justify-between items-center gap-[25px]">
					{/* sidebar content  */}
					<div className="sm:bg-[#FFFFFF] sm:px-4 sm:rounded-[16px] ">
						<Sidebar height="692px" />
					</div>

					{/* right panel */}
					<div className="w-full">
						<div className="flex justify-center items-center mb-[21px] sm:mb-14 mt-[23px] ">
							<div className="bg-white rounded-[10px] flex justify-between p-1">
								{/* <button className="bg-[#A274FF]/50 text-white py-3 rounded-[10px] px-8 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] ">
									Active
								</button>
								<button className="bg-white py-3 rounded-[10px] px-8 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%]">
									Ended
								</button> */}
								<button
									className={`py-3 px-8 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] rounded-[10px] ${
										isActive
											? 'bg-[#A274FF]/50 text-white'
											: 'bg-white text-black'
									}`}
									onClick={handleButtonClick}
									style={{
										transition: 'all 0.5s',
									}}
								>
									Active
								</button>
								<button
									className={`py-3 px-8 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] rounded-[10px] ${
										isActive
											? 'bg-white text-black'
											: 'bg-[#A274FF]/50 text-white'
									}`}
									onClick={handleButtonClick}
									style={{
										transition: 'all 0.5s',
									}}
								>
									Ended
								</button>
							</div>
						</div>
						<div className="grid grid-rows-4 gap-[21px]">
							<div className="bg-white rounded-[20px] sm:h-[197px] h-[132px]"></div>
							<div className="bg-white rounded-[20px] sm:h-[197px] h-[132px]"></div>
							<div className="bg-white rounded-[20px] sm:h-[197px] h-[132px]"></div>
							<div className="bg-white rounded-[20px] sm:h-[197px] h-[132px]"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyContracts;
