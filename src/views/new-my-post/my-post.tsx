import React from 'react';
import Image from 'next/image';

import JobCard from '@/components/JobCard/JobCard';
import Sidebar from '@/components/reusable/Sidebar/Sidebar';

const NewMyPost = () => {
	return (
		<div className="find-work-section pt-[170px] mb-[57px] sm:pt-[90px]">
			<div className="custom-container">
				<div className="flex sm:flex-col justify-between items-center gap-5">
					<div className="flex-shrink-0">
						<div className="flex gap-[10px] mb-3 sm:mb-6">
							<button className="w-full text-[14px] text-white font-semibold font-secondary leading-[20px] tracking-[-1%] py-3 bg-[#A274FF] rounded-[10px]">
								Post a Job
							</button>
							<button className="w-full py-3 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] bg-white rounded-[10px]">
								List a service
							</button>
						</div>
						<div className="sm:bg-[#FFFFFF] sm:px-4 sm:rounded-[16px] sm:modal-shadow">
							<Sidebar height="692px" />
						</div>
					</div>

					<div className="right-panel flex-1">
						<JobCard cardStyles="flex !justify-start gap-[55px] items-center pl-[32px]" />
						<JobCard cardStyles="flex !justify-start gap-[55px] items-center pl-[32px]" />
						<JobCard cardStyles="flex !justify-start gap-[55px] items-center pl-[32px]" />
						<JobCard cardStyles="flex !justify-start gap-[55px] items-center pl-[32px]" />
						<JobCard cardStyles="flex !justify-start gap-[55px] items-center pl-[32px]" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default NewMyPost;
