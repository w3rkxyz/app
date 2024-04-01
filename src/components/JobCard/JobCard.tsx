'use client';

import Image from 'next/image';
import MyButton from '../reusable/Button/Button';

interface CardProps {
	userAvatar?: string;
	username?: string;
	jobName?: string;
	jobIcon?: string;
	cardStyles?: string;
	onClick?: () => void;
	onCardClick?: () => void;
	handlePostJobOpen?: () => void;
}

const JobCard = ({
	userAvatar,
	username,
	jobName,
	jobIcon,
	cardStyles,
	onCardClick,
	handlePostJobOpen,
}: CardProps) => {
	return (
		<div
			className={`flex sm:flex-col items-center md:items-start gap-[29px] sm:w-full sm:h-auto md:w-full h-[132px] md:h-auto md:gap-3 bg-[#FFFFFF] py-[17px] rounded-[20px] my-[21px] md:mb-[21px] md:mt-0 pl-[38px] md:pl-0 sm:pl-[16px] pr-[18px] overflow-hidden`}
			onClick={() => {
				if (handlePostJobOpen) {
					handlePostJobOpen();
				} else if (onCardClick) {
					onCardClick();
				}
			}}
		>
			<div className="sm:flex gap-[8px]">
				<div className="">
					{userAvatar && username && (
						<div className="items-center pr-2">
							<div className="flex justify-center items-center ">
								<div className="w-[57px] h-[54px] sm:w-[48px] sm:h-[48px] rounded-[10px]">
									<Image
										src={userAvatar}
										alt="User Avatar"
										className="w-full h-full rounded-[10px] p-[4px] mb-[10px]"
										width={100}
										height={100}
									/>
								</div>
							</div>
							<p className="text-[12px] sm:text-[14px] mt-[8px] sm:font-bold py-1 px-3 sm:px-[6px] bg-white rounded-[10px] font-bold font-secondary leading-[20px] sm:leading-[17.6px] tracking-[-1%]">
								{username}
							</p>
						</div>
					)}
				</div>

				<div className="max-w-[444px] hidden sm:block">
					<div className="flex items-center gap-3 pb-2">
						<p className="text-[12px] font-bold font-secondary leading-[20px] tracking-[-1%]">
							{jobName}
						</p>
						{jobIcon && (
							<div className="flex justify-center items-center rounded-[4px] w-[20px] h-[20px] bg-[#120037] ">
								<Image
									src={jobIcon}
									alt="job icon image"
									className="w-[12px] h-[12px]"
									width={12}
									height={12}
								/>
							</div>
						)}
					</div>
					<p className="text-[10px] font-medium font-secondary leading-[14px] tracking-[-1%] md:overflow-ellipsis">
						bla bla bla lbla bla bla bla lbla bla bla bla lbla bla
						bla bla lbla bla bla bla lbla bla bla bla lbla bla bla
						bla lbla bla bla bla lbla bla bla bla lbla a bla bla bla
						lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla
						lbla a bla bla bla lbla a bla bla bla lbla
					</p>
				</div>
			</div>
			<div
				className={`w-full flex sm:flex-col-reverse md:flex-col justify-between ${cardStyles} items-center`}
			>
				<div className="sm:hidden">
					<div className="flex items-center gap-3 pb-2">
						<p className="text-[12px] font-bold font-secondary leading-[20px] tracking-[-1%]">
							{jobName}
						</p>
						{jobIcon && (
							<div className="flex justify-center items-center rounded-[4px] w-[20px] h-[20px] bg-[#120037] ">
								<Image
									src={jobIcon}
									alt="job icon image"
									className="w-[12px] h-[12px]"
									width={12}
									height={12}
								/>
							</div>
						)}
					</div>
					<p className="text-[12px] font-medium max-w-[444px] font-secondary leading-[20px] tracking-[-1%] md:overflow-ellipsis">
						bla bla bla lbla bla bla bla lbla bla bla bla lbla bla
						bla bla lbla bla bla bla lbla bla bla bla lbla bla bla
						bla lbla bla bla bla lbla bla bla bla lbla a bla bla bla
						lbla a bla bla bla lbla a bla bla bla lbla a bla bla bla
						lbla a bla bla bla lbla a bla bla bla lbla
					</p>
				</div>

				{/* paid amount details */}
				<div className="sm:hidden md:hidden">
					<p className="text-[12px] font-medium font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
						Fixed/Hourly Contract
					</p>
					<p className="text-[12px] font-medium font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
						Payment [amount in USD]
					</p>
					<p className="text-[12px] font-medium font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
						Paid In [insert token logos]
					</p>
				</div>

				<div className="hidden sm:block md:block">
					<div className="w-full sm:w-[340px] flex flex-row items-center justify-center gap-3 whitespace-nowrap overflow-auto payment mt-3 sm:mx-0">
						<p className="text-[12px] font-medium font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
							Fixed/Hourly Contract
						</p>
						<p className="text-[12px] font-medium font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
							Payment [amount in USD]
						</p>
						<p className="text-[12px] font-medium font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
							Paid In [insert token logos]
						</p>
					</div>
				</div>

				<div className="sm:hidden md:hidden">
					<MyButton
						buttonText="Blockchain Development"
						buttonType="accent"
						buttonStyles="bg-[#FFAEAE]/50 mb-[4px]"
					/>
					<MyButton
						buttonText="[tag]"
						buttonType="accent"
						buttonStyles="bg-[#FFD5AE]/50 mb-[4px]"
					/>
					<MyButton
						buttonText="[tag]"
						buttonType="accent"
						buttonStyles="bg-[#FDFFAE]/50"
					/>
				</div>

				<div className="hidden sm:block md:block">
					<div className="flex flex-row items-center gap-3 whitespace-nowrap w-full sm:w-[340px] overflow-auto payment mt-3 sm:mt-2 sm:mx-0">
						<div className="!w-[146px]">
							<MyButton
								buttonText="Blockchain Development"
								buttonType="accent"
								buttonStyles="bg-[#FFAEAE80] mb-[4px] w-[146px]"
							/>
						</div>
						<div className="w-[146px]">
							<MyButton
								buttonText="[tag]"
								buttonType="accent"
								buttonStyles="bg-[#FFD5AE80] mb-[4px] w-[146px]"
							/>
						</div>
						<div className="w-[146px]">
							<MyButton
								buttonText="[tag]"
								buttonType="accent"
								buttonStyles="bg-[#FDFFAE80] mb-[4px] w-[146px]"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default JobCard;
