import React from 'react';
import Sidebar from '@/components/reusable/Sidebar/Sidebar';

const MyWallet = () => {
	return (
		<div className="find-work-section mt-[181px] sm:mt-[90px] mb-[115px] sm:mb-10">
			<div className="custom-container">
				<div className="my-wallet-section flex sm:flex-col justify-between items-center gap-6">
					<div className="sm:bg-[#FFFFFF] sm:px-4 sm:rounded-[16px] sm:modal-shadow">
						<Sidebar height="675px" />
					</div>

					<div className="hidden sm:block mt-4 mb-7">
						<div className="flex justify-center items-center">
							<div className="bg-white rounded-[10px] flex justify-between p-1">
								<button className="bg-[#A274FF80] text-white py-3 rounded-[10px] px-8 text-[14px] sm:text-[12px] font-semibold font-secondary leading-[20px] tracking-[-1%] ">
									Transactions
								</button>
								<button className="bg-white py-3 rounded-[10px] px-8 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%]">
									Balance
								</button>
							</div>
						</div>
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
