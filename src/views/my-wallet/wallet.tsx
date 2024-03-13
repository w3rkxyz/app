import React from 'react';
import Sidebar from '@/components/reusable/Sidebar/Sidebar';

const MyWallet = () => {
	return (
		<div className="find-work-section mt-[181px] pb-10">
			<div className="custom-container mt-7">
				<div className="my-wallet-section flex sm:flex-col justify-between items-center gap-6">
					<div>
						<Sidebar height="675px" />
					</div>

					<div className="h-[675px] sm:h-[197px] w-[792px] sm:w-full bg-white rounded-[20px] p-[20px]">
						<h3 className="text-[20px] font-semibold font-secondary leading-[20px] tracking-[-1%]">
							Transaction History
						</h3>
					</div>
					<div className="h-[675px] sm:h-[197px] w-[250px] sm:w-full bg-[#FFFFFF] rounded-[20px] py-[26px] px-[30px]">
						<h3 className="text-[20px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-center sm:text-left ">
							Balance
						</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyWallet;
