import React from 'react';

import Sidebar from '@/reusable-components/Sidebar/Sidebar';
import JobCard from '@/reusable-components/JobCard/JobCard';
import { bag } from '@/icons/Icons';

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
							jobName="Job Name"
							jobIcon={bag}
							description="bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla"
							contractType="Fixed/Hourly Contract"
							paymentAmount="Payment [amount in USD]"
							paymentMethod="Paid In [insert token logos]"
							buttonData={[
								{
									buttonText: 'Blockchain Development',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFAEAE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFD5AE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FDFFAE]/50 mb-[4px]',
								},
							]}
						/>
						<JobCard
							jobName="Job Name"
							jobIcon={bag}
							description="bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla"
							contractType="Fixed/Hourly Contract"
							paymentAmount="Payment [amount in USD]"
							paymentMethod="Paid In [insert token logos]"
							buttonData={[
								{
									buttonText: 'Blockchain Development',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFAEAE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFD5AE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FDFFAE]/50 mb-[4px]',
								},
							]}
						/>
						<JobCard
							jobName="Job Name"
							jobIcon={bag}
							description="bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla"
							contractType="Fixed/Hourly Contract"
							paymentAmount="Payment [amount in USD]"
							paymentMethod="Paid In [insert token logos]"
							buttonData={[
								{
									buttonText: 'Blockchain Development',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFAEAE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFD5AE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FDFFAE]/50 mb-[4px]',
								},
							]}
						/>
						<JobCard
							jobName="Job Name"
							jobIcon={bag}
							description="bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla"
							contractType="Fixed/Hourly Contract"
							paymentAmount="Payment [amount in USD]"
							paymentMethod="Paid In [insert token logos]"
							buttonData={[
								{
									buttonText: 'Blockchain Development',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFAEAE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFD5AE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FDFFAE]/50 mb-[4px]',
								},
							]}
						/>
						<JobCard
							jobName="Job Name"
							jobIcon={bag}
							description="bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla lbla"
							contractType="Fixed/Hourly Contract"
							paymentAmount="Payment [amount in USD]"
							paymentMethod="Paid In [insert token logos]"
							buttonData={[
								{
									buttonText: 'Blockchain Development',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFAEAE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FFD5AE]/50 mb-[4px]',
								},
								{
									buttonText: '[tag]',
									buttonType: 'accent',
									buttonStyles: 'bg-[#FDFFAE]/50 mb-[4px]',
								},
							]}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OtherUserFollowing;
