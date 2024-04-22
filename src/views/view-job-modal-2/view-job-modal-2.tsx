import React from 'react';
import Image from 'next/image';

import MyButton from '@/components/reusable/Button/Button';

import CloseIcon from '@/icons/CloseIcon';
import Sidebar from '@/components/reusable/Sidebar/Sidebar';

type Props = {
	closeJobCardModal: () => void;
};

const ViewJobModal2 = ({ closeJobCardModal }: Props) => {
	return (
		<div className="view-job-modal-2-section">
			<div className="custom-container">
				<div className="flex justify-center items-center">
					<div className="bg-[#EFEFEF] w-[1110px] pl-[63px] pr-[78px] md:p-5 pt-[47px] pb-[65px] sm:py-5  sm:px-5 rounded-[20px] relative">
						<button className="w-[35px] sm:w-[16px] h-[35px] sm:h-[16px] absolute right-[23px] sm:right-[30px] top-[23px] sm:top-[10px] cursor-pointer">
							{/* <CloseIcon /> */}
							<Image
								onClick={closeJobCardModal}
								src="images/Close.svg"
								alt="close icon"
								width={35}
								height={35}
							/>
						</button>
						<div className="view-job-modal2-section flex sm:flex-col justify-between">
							<div>
								<Sidebar height="auto" />
							</div>
							<div className="flex-1 pl-[79px] md:pl-5 md:px sm:px-0">
								<h3 className="text-[36px] sm:text-[14px] font-secondary font-semibold leading-[80px] sm:leading-[20px] tracking-[-4%] sm:tracking-[-1] sm:pt-[16px] sm:pb-[24px] text-[#000000]">
									Job Name
								</h3>
								<div>
									<div className="flex sm:flex-col justify-between">
										<div className="mb-3">
											<p className="text-[18px] sm:text-[14px] font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] text-[#000000] ">
												Description
											</p>
											<p className="text-[16px] h-[64px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-4 tracking-[-3%] sm:tracking-[-1%] text-[#00000080] ">
												[service description]
											</p>
										</div>
										<div>
											<div className="sm:hidden">
												<div className="mb-[13px] sm:mb-3">
													<p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
														Contract Type
													</p>
													<p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#00000080]">
														[amount in USD][fixed /
														hourly]
													</p>
												</div>
												<div className="mb-[13px] sm:mb-3">
													<p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
														Payment
													</p>
													<p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#00000080]">
														[amount in USD]
													</p>
												</div>
												<div className="mb-[13px] sm:mb-3">
													<p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
														Paid In
													</p>
													<p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#00000080]">
														[select cryptocurrency]
													</p>
												</div>
												<div>
													<p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
														Tags
													</p>
													<p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#00000080]">
														[select 1-3 tags]
													</p>
												</div>
											</div>

											<div className="hidden sm:block">
												<div className="flex gap-3">
													<div>
														<div className="mb-[13px] sm:mb-3">
															<p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
																Contract Type
															</p>
															<p className="text-[10px] font-semibold font-secondary leading-[12px] tracking-[-1%] text-[#00000080]">
																[amount in USD]{' '}
																<span className="pl-3"></span>
																[fixed / hourly]
															</p>
														</div>
														<div className="mb-[13px] sm:mb-3">
															<p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
																Paid In
															</p>
															<p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#00000080]">
																[select
																cryptocurrency]
															</p>
														</div>
													</div>
													<div>
														<div className="mb-[13px] sm:mb-3">
															<p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
																Payment
															</p>
															<p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#00000080]">
																[amount in USD]
															</p>
														</div>
														<div>
															<p className="text-[18px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[10px] tracking-[-3%] sm:tracking-[-1] text-[#000000] sm:mb-1">
																Tags
															</p>
															<p className="text-[16px] sm:text-[10px] font-semibold font-secondary leading-[24px] sm:leading-[12px] tracking-[-3%] sm:tracking-[-1%] text-[#00000080]">
																[select 1-3
																tags]
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="sm:mt-6">
							<div className="flex justify-end sm:justify-center items-center -mt-10  sm:-mt-0">
								<MyButton
									buttonText="Edit"
									buttonType="tertiary"
									buttonStyles="bg-[#BEC6C6]/50 hover:bg-[#F5F5F5] duration-300 text-[#000000] mr-[14.14px]"
								/>
								<MyButton
									buttonText="Delete"
									buttonType="tertiary"
									buttonStyles="bg-[#FFAEAE]/50 hover:bg-[#FAE5D3] duration-300 text-[#000000]"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewJobModal2;
