import Image from 'next/image';
import React from 'react';
import MyButton from '../Sidebar/Button/Button';

interface CardProps {
	userAvatar?: string; // Replace with the actual source for the user avatar image
	username?: string;
	jobName: string;
	jobIcon: string; // Replace with the actual source for the job icon image
	description: string;
	contractType: string;
	paymentAmount: string;
	paymentMethod: string;
	buttonData: {
		buttonText: string;
		buttonType: string;
		buttonStyles: string;
	}[];
}

const JobCard: React.FC<CardProps> = ({
	userAvatar,
	username,
	jobName,
	jobIcon,
	description,
	contractType,
	paymentAmount,
	paymentMethod,
	buttonData,
}) => {
	return (
		<div className="flex sm:flex-col items-center gap-7 md:gap-3 bg-[#FFFFFF] p-[14px] rounded-[20px] sm:h-auto my-[21px]">
			{userAvatar && username && (
				<div className="items-center pl-2">
					<div className="flex justify-center items-center mb-2">
						<div className="w-[57px] h-[54px] shadow-xl shadow-[#000000]/5 rounded-[10px]">
							<Image
								src={userAvatar}
								alt="User Avatar"
								className="w-full h-full rounded-[10px] p-[4px] mb-[10px]"
							/>
						</div>
					</div>
					<p className="text-[12px] py-1 px-3 bg-white rounded-[10px] shadow-xl shadow-[#000000]/5 font-bold font-secondary leading-[20px] tracking-[-1%]">
						{username}
					</p>
				</div>
			)}
			<div className="w-full flex justify-between items-center">
				<div className="max-w-[444px]">
					<div className="flex items-center gap-3 pb-2">
						<p className="text-[12px] font-bold font-secondary leading-[20px] tracking-[-1%]">
							{jobName}
						</p>
						<Image
							src={jobIcon}
							alt="Job Icon"
							className="bg-[#120037] rounded-[4px] p-1 w-[20px] h-[20px]"
						/>
					</div>
					<p className="text-[12px] font-medium max-w-[444px] font-secondary leading-[20px] tracking-[-1%] md:overflow-ellipsis">
						{description}
					</p>
				</div>
				<div className="">
					<p className="text-[12px] font-medium font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
						{contractType}
					</p>
					<p className="text-[12px] font-medium font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
						{paymentAmount}
					</p>
					<p className="text-[12px] font-medium font-secondary leading-[20px] tracking-[-1%] text-[#000000]">
						{paymentMethod}
					</p>
				</div>
				<div>
					{buttonData.map((button, index) => (
						<MyButton
							key={index}
							buttonText={button.buttonText}
							buttonType={button.buttonType}
							buttonStyles={button.buttonStyles}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default JobCard;
