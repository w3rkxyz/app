import Image from 'next/image';
import React from 'react';

interface PostJobModalProps {
	title: string;
	nameLabel: string;
	namePlaceholder: string;
	descriptionLabel: string;
	descriptionPlaceholder: string;
	priceLabel: string;
	pricePlaceholder: string;
	priceTypeLabel: string;
	priceTypePlaceholder: string;
	acceptedTokensLabel: string;
	acceptedTokensPlaceholder: string;
	tagsLabel: string;
	tagsPlaceholder: string;
	portfolioLabel: string;
	portfolioPlaceholder: string;
	buttonText: string;
}

const PostListModal = ({
	title,
	nameLabel,
	descriptionLabel,
	descriptionPlaceholder,
	priceLabel,
	pricePlaceholder,
	priceTypePlaceholder,
	acceptedTokensLabel,
	acceptedTokensPlaceholder,
	tagsLabel,
	tagsPlaceholder,
	portfolioLabel,
	portfolioPlaceholder,
	buttonText,
}: PostJobModalProps) => {
	return (
		<div className="mt-[170px] sm:mt-[99px] mb-[56px]">
			<div className="custom-container">
				<div className="shadow-2xl shadow-[#000000]/25 max-w-[1110px] w-full mx-auto relative px-[108px] sm:px-5 py-[28px] sm:py-5 rounded-[20px] ">
					<div className="absolute top-[10px] right-[10px] sm:top-[10px]">
						<div className="sm:hidden">
							<Image
								src="/images/close.svg"
								alt="close icon"
								width={35}
								height={35}
							/>
						</div>
						<div className="hidden sm:block">
							<Image
								src="/images/close-2.svg"
								alt="close icon"
								width={16}
								height={16}
							/>
						</div>
					</div>
					<h2 className="text-[36px] sm:text-[25px] font-semibold font-secondary leading-[40xp] tracking-[-4%] text-center ">
						{title}
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-1 gap-10 sm:gap-0">
						<div>
							<div className="my-5 sm:mb-0">
								<label
									htmlFor="role"
									className="text-[18px] sm:text-[14px] pl-3 sm:pl-0 font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] mb-[5px] sm:mb-1"
								>
									{nameLabel}
								</label>{' '}
								<br />
								<input
									type="text"
									className="py-2 w-full h-[40px] sm:h-[29px] text-[16px] placeholder-[#00000080] font-semibold font-secondary leading-[24px] sm:text-[12px] sm:leading-[16.8px] tracking-[-3%] rounded-[10px] sm:rounded-[6px] pl-3 sm:pl-2 border-[2px] border-[#00000033]"
								/>
							</div>

							<div className="sm:hidden">
								<label
									htmlFor="description"
									className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] mb-[5px]"
								>
									{descriptionLabel}
								</label>
								<br />
								<textarea
									placeholder={descriptionPlaceholder}
									className="w-full pl-3 pt-3 h-[313px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] sm:h-[100px] rounded-[10px] resize-none border-[2px] border-[#000000]/20"
								/>
							</div>
						</div>
						<div>
							<div className="my-5 sm:my-[9px]">
								<label
									htmlFor="role"
									className="text-[18px] sm:text-[14px] pl-3 sm:pl-0 font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] mb-[5px] sm:mb-1"
								>
									{priceLabel}
								</label>{' '}
								<br />
								<div className="sm:flex items-center gap-1">
									<input
										type="text"
										placeholder={pricePlaceholder}
										className="py-2 w-full h-[40px] sm:h-[29px] text-[16px] placeholder-[#00000080] font-semibold font-secondary leading-[24px] sm:text-[12px] sm:leading-[16.8px] tracking-[-3%] rounded-[10px] sm:rounded-[6px] pl-3 sm:pl-2 border-[2px] border-[#00000033]"
									/>
									<div className="flex justify-end -mt-[40px] sm:-mt-0">
										<button className="py-[6px] sm:py-1 px-[9px] border-2  border-[#000000]/20 bg-white text-[#000000]/50 rounded-[10px] sm:rounded-[6px] text-[16px] sm:text-[12px] font-semibold sm:font-normal font-secondary leading-[24px] sm:leading-[16.8px] tracking-[-3%] ">
											{priceTypePlaceholder}
										</button>
									</div>
								</div>
							</div>
							<div className="my-5 sm:my-[9px]">
								<label
									htmlFor="role"
									className="text-[18px] sm:text-[14px] pl-3 sm:pl-0 font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] mb-[5px] sm:mb-1"
								>
									{acceptedTokensLabel}
								</label>{' '}
								<br />
								<input
									type="text"
									placeholder={acceptedTokensPlaceholder}
									className="py-2 w-full h-[40px] sm:h-[29px] text-[16px] placeholder-[#00000080] font-semibold font-secondary leading-[24px] sm:text-[12px] sm:leading-[16.8px] tracking-[-3%] rounded-[10px] sm:rounded-[6px] pl-3 sm:pl-2 border-[2px] border-[#00000033]"
								/>
							</div>

							<div className="my-5 sm:my-[9px]">
								<label
									htmlFor="role"
									className="text-[18px] sm:text-[14px] pl-3 sm:pl-0 font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] mb-[5px] sm:mb-1"
								>
									{tagsLabel}
								</label>{' '}
								<br />
								<input
									type="text"
									placeholder={tagsPlaceholder}
									className="py-2 w-full h-[40px] sm:h-[29px] text-[16px] placeholder-[#00000080] font-semibold font-secondary leading-[24px] sm:text-[12px] sm:leading-[16.8px] tracking-[-3%] rounded-[10px] sm:rounded-[6px] pl-3 sm:pl-2 border-[2px] border-[#00000033]"
								/>
							</div>
							<div className="my-5 sm:my-[9px]">
								<label
									htmlFor="role"
									className="text-[18px] sm:text-[14px] pl-3 sm:pl-0 font-semibold sm:font-bold font-secondary leading-[24px] sm:leading-[17.6px] tracking-[-3%] mb-[5px] sm:mb-1"
								>
									{portfolioLabel}
								</label>{' '}
								<br />
								<input
									type="text"
									placeholder={portfolioPlaceholder}
									className="py-2 w-full h-[40px] sm:h-[29px] text-[16px] placeholder-[#00000080] font-semibold font-secondary leading-[24px] sm:text-[12px] sm:leading-[16.8px] tracking-[-3%] rounded-[10px] sm:rounded-[6px] pl-3 sm:pl-2 border-[2px] border-[#00000033]"
								/>
							</div>
							<div className="hidden sm:block">
								<label
									htmlFor="description"
									className="text-[14px] font-bold font-secondary leading-[17.6px] tracking-[-3%] mb-1"
								>
									{descriptionLabel}
								</label>
								<br />
								<textarea
									placeholder={descriptionPlaceholder}
									className="w-full pl-3 sm:pl-2 pt-3 sm:pt-[6px] h-[133px] text-[12px] placeholder-[#00000080] font-normal font-secondary leading-[16.8px] tracking-[-1%] rounded-[10px] resize-none border-[2px] border-[#00000033]"
								/>
							</div>
						</div>
					</div>
					<div className="flex justify-center items-center mt-[34px] sm:mt-[17px]">
						<button className="button-primary w-[186px] h-[56px] !px-16 flex justify-center items-center">
							{buttonText}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

PostListModal.defaultProps = {
	title: 'List A Service',
	nameLabel: 'Service Name',
	namePlaceholder: '[service name]',
	descriptionLabel: 'Service Description',
	descriptionPlaceholder: '[service description]',
	priceLabel: 'Price',
	pricePlaceholder: '[amount in USD]',
	priceTypeLabel: 'Price Type',
	priceTypePlaceholder: '[fixed/hourly]',
	acceptedTokensLabel: 'Accepted Tokens',
	acceptedTokensPlaceholder: '[select tokens]',
	tagsLabel: 'Tags',
	tagsPlaceholder: '[select 3 tags minimum]',
	portfolioLabel: 'Portfolio',
	portfolioPlaceholder: '[attach previous work]',
	buttonText: 'List',
};

export default PostListModal;
