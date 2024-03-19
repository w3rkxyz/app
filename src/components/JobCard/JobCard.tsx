import Image from 'next/image';
import React from 'react';
import MyButton from '../reusable/Button/Button';

interface CardProps {
	userAvatar?: string;
	username?: string;
	jobIcon?: string;
	cardStyles?: string;
}

const JobCard: React.FC<CardProps> = ({
	userAvatar,
	username,
	jobIcon,
	cardStyles,
}) => {
	return (
		<div
			className={`flex sm:flex-col items-center gap-[29px] sm:w-full h-[132px] md:gap-3 bg-[#FFFFFF] py-[17px] rounded-[20px] sm:h-auto my-[21px] pl-[38px] sm:pl-[16px] pr-[18px]`}
		>
			<div className="sm:flex gap-[8px]">
				<div>
					{userAvatar && username && (
						<div className="items-center pr-2">
							<div className="flex justify-center items-center ">
								<div className="w-[57px] h-[54px] sm:w-[48px] sm:h-[48px] shadow-xl shadow-[#0000000D] rounded-[10px]">
									<Image
										src={userAvatar}
										alt="User Avatar"
										className="w-full h-full rounded-[10px] p-[4px] mb-[10px]"
										width={100}
										height={100}
									/>
								</div>
							</div>
							<p className="text-[12px] sm:text-[14px] mt-[8px] sm:font-bold py-1 px-3 sm:px-[6px] bg-white rounded-[10px] shadow-xl shadow-[#000000]/5 font-bold font-secondary leading-[20px] sm:leading-[17.6px] tracking-[-1%]">
								{username}
							</p>
						</div>
					)}
				</div>

				<div className="max-w-[444px] hidden sm:block">
					<div className="flex items-center gap-3 pb-2">
						<p className="text-[12px] font-bold font-secondary leading-[20px] tracking-[-1%]">
							Job Name
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
				className={`w-full flex sm:flex-col-reverse justify-between ${cardStyles} items-center`}
			>
				<div className="max-w-[444px] sm:hidden">
					<div className="flex items-center gap-3 pb-2">
						<p className="text-[12px] font-bold font-secondary leading-[20px] tracking-[-1%]">
							Job Name
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

				<div className="sm:hidden">
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
				<div className="hidden sm:block">
					<div className="w-[100%] flex flex-row items-center gap-2 overflow-hidden">
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

				<div>
					<div className="sm:w-full">
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
				</div>
			</div>
		</div>
	);
};

export default JobCard;
