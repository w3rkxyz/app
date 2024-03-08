import React from 'react';
import Image from 'next/image';

import {
	bag,
	gitHub,
	head,
	linkedIn,
	token1,
	token2,
	token3,
	twitterFo,
} from '@/icons/Icons';
import JobCard from '@/reusable-components/JobCard/JobCard';

const NewMyPost = () => {
	return (
		<div className="find-work-section pt-[105px]">
			<div className="custom-container mt-7">
				<div className="tags-section flex justify-between items-center gap-5">
					<div>
						<div className="flex gap-[10px] mb-3">
							<button className="w-full text-[14px] text-white font-semibold font-secondary leading-[20px] tracking-[-1%] py-3 bg-[#A274FF] rounded-[10px]">
								Post a Job
							</button>
							<button className="w-full py-3 text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] bg-white rounded-[10px]">
								List a service
							</button>
						</div>
						<div className="h-[692px] w-[250px] sm:h-auto bg-[#FFFFFF] rounded-[20px] py-[26px] px-[30px]">
							<div className="flex justify-center items-center">
								<div className="w-[120px] h-[110px] bg-[#FFFFFF]/70 flex justify-center items-center rounded-[16px] shadow-2xl shadow-slate-200 ">
									<div>
										<Image
											src={head}
											alt="head image"
											className="w-[65px] h-[65px] mb-2 "
										/>
										<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] ">
											adam.lens
										</p>
									</div>
								</div>
							</div>

							<div>
								<p className="text-[14px] font-semibold mt-5 mb-3 text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
									Job Title
								</p>
								<div className="flex justify-around items-center">
									<div>
										<p className="text-[14px] font-semibold text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											Following
										</p>
										<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
											100
										</p>
									</div>
									<div>
										<p className="text-[14px] font-semibold text-center font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
											Followers
										</p>
										<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
											735
										</p>
									</div>
								</div>
							</div>

							<div className="mt-3">
								<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
									About
								</p>
								<p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
									bla bla bla bla bla bla bla bla bla bla bla
									bla bla bla bla bla bla bla bla bla bla bla
									bla bla bla bla bla bla bla bla bla bla
								</p>
							</div>

							<div className="mt-3">
								<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
									Skills
								</p>
								<p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
									[skill]
								</p>
								<p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
									[skill]
								</p>
								<p className="text-[14px] font-semibold  font-secondary leading-[20px] tracking-[-1%] text-[#000000]/50">
									[skill]
								</p>
							</div>

							<div className="mt-3">
								<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
									Links
								</p>
								<ul className="socials-widgets gap-[10px] flex mt-1">
									<li className="socials-widgets-items">
										<a href="/">
											<Image
												className="w-[22px]  h-[22px]"
												src={twitterFo}
												alt="socials icons images"
												width={22}
												height={22}
											/>
										</a>
									</li>
									<li className="socials-widgets-items">
										<a href="/">
											<Image
												className="w-[22px]  h-[22px]"
												src={gitHub}
												alt="socials icons images"
												width={22}
												height={22}
											/>
										</a>
									</li>
									<li className="socials-widgets-items">
										<a href="/">
											<Image
												className="w-[22px]  h-[22px]"
												src={linkedIn}
												alt="socials icons images"
												width={22}
												height={22}
											/>
										</a>
									</li>
								</ul>
							</div>

							<div className="mt-3">
								<p className="text-[14px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
									Accepted Tokens
								</p>
								<ul className="socials-widgets gap-[7px] flex mt-1">
									<li className="socials-widgets-items">
										<a href="/">
											<Image
												className="w-[22px] h-[22px] bg-[#F7931A] p-1 rounded-full"
												src={token1}
												alt="socials icons images"
												width={22}
												height={22}
											/>
										</a>
									</li>
									<li className="socials-widgets-items">
										<a href="/">
											<Image
												className="w-[22px]  h-[22px]"
												src={token2}
												alt="socials icons images"
												width={22}
												height={22}
											/>
										</a>
									</li>
									<li className="socials-widgets-items">
										<a href="/">
											<Image
												className="w-[22px]  h-[22px]"
												src={token3}
												alt="socials icons images"
												width={22}
												height={22}
											/>
										</a>
									</li>
								</ul>
							</div>
						</div>
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

export default NewMyPost;
