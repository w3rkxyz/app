import React from 'react';

import Sidebar from '@/components/reusable/Sidebar/Sidebar';
import JobCard from '@/components/JobCard/JobCard';
import { bag, man } from '@/icons/Icons';

const OtherUserFollowing = () => {
	return (
		<div className="find-work-section pt-[105px] pb-10">
			<div className="custom-container">
				<div className="tags-section flex sm:flex-col justify-center items-center gap-[25px] mt-7">
					<div>
						<Sidebar height="744px" />
					</div>

					<div className="w-full">
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
						<JobCard
							jobIcon="/images/man.svg"
							cardStyles={'!flex !justify-evenly !items-center'}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OtherUserFollowing;
