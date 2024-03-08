import SearchInput from '@/components/SearchInput/SearchInput';
import { bag, head } from '@/icons/Icons';

import DynamicCard from '@/reusable-components/JobCard/JobCard';
import JobCard from '@/reusable-components/JobCard/JobCard';
import MyButton from '@/reusable-components/Sidebar/Button/Button';

const FindWork = async () => {
	return (
		<div className="find-work-section pt-[105px]">
			<div className="custom-container">
				<div className="flex sm:flex-col md:flex-col justify-between items-center my-[30px]">
					<h2 className="section-title text-center text-[32px] sm:text-[24px] font-semibold font-secondary leading-[20px] tracking-[-4%] pb-4">
						Discover{' '}
						<span className="text-primary">opportunities</span>.
					</h2>
					<SearchInput />
				</div>

				<div className="tags-section flex sm:flex-col justify-center items-center gap-[25px] my-[30px]">
					<div className="max-w-[250px] w-full sm:max-w-full h-[591px] max-h-[100vh] bg-[#FFFFFF] rounded-[20px] p-[23px]">
						<h4 className="text-[20px] font-semibold font-secondary leading-[20px] tracking-[-1%] text-center pb-5 ">
							Tags
						</h4>

						<MyButton
							buttonText="Blockchain Development"
							buttonType="secondary"
							buttonStyles="bg-[#FFAEAE]/50 mb-[6px]"
						></MyButton>
						<MyButton
							buttonText="Programming & Development"
							buttonType="secondary"
							buttonStyles="bg-[#FFD5AE]/50 mb-[6px]"
						></MyButton>
						<MyButton
							buttonText="Design"
							buttonType="secondary"
							buttonStyles="bg-[#FDFFAE]/50 mb-[6px]"
						></MyButton>
						<MyButton
							buttonText="Marketing"
							buttonType="secondary"
							buttonStyles="bg-[#E0FFAE]/50 mb-[6px]"
						></MyButton>
						<MyButton
							buttonText="Admin Support"
							buttonType="secondary"
							buttonStyles="bg-[#AEFFBB]/50 mb-[6px]"
						></MyButton>
						<MyButton
							buttonText="Customer Service"
							buttonType="secondary"
							buttonStyles="bg-[#AEFAFF]/50 mb-[6px]"
						></MyButton>
						<MyButton
							buttonText="Security & Auditing"
							buttonType="secondary"
							buttonStyles="bg-[#AED8FF]/50 mb-[6px]"
						></MyButton>
						<MyButton
							buttonText="Consulting & Advisory"
							buttonType="secondary"
							buttonStyles="bg-[#BAAEFF]/50 mb-[6px]"
						></MyButton>
						<MyButton
							buttonText="Community Building"
							buttonType="secondary"
							buttonStyles="bg-[#EAAEFF]/50 mb-[6px]"
						></MyButton>
						<MyButton
							buttonText="Other"
							buttonType="secondary"
							buttonStyles="bg-[#FFAEF2]/50 mb-[6px]"
						></MyButton>
					</div>

					<div className="w-full">
						<JobCard
							userAvatar={head}
							username="adam.lens"
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
							userAvatar={head}
							username="adam.lens"
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
							userAvatar={head}
							username="adam.lens"
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
							userAvatar={head}
							username="adam.lens"
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

export default FindWork;
