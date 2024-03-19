import Image from 'next/image';
import React from 'react';

const HomeBanner = () => {
	return (
		<div className="banner-section pt-[268px] sm:pt-[194px] pb-[235px] sm:pb-[300px] overflow-hidden">
			<div className="custom-container">
				<div className="banner-wrapper max-w-[1156px] mx-auto relative">
					<div className="banner-modal banner-modal-top">
						{/* modal image container 2 */}
						<div className="modal-item-2 absolute left-[139px] top-[-85px] sm:top-[-73px] sm:left-[24px] w-[96px] h-[96px] sm:w-[57px] sm:h-[57px] bg-[#A274FF1A] rounded-[24px] sm:rounded-[14px] flex justify-center items-center banner-modal-shadow">
							<div>
								<div className="flex justify-center items-center mb-[7px] sm:mb-[3.2px]">
									<Image
										src="/images/banner-modal-2.svg"
										alt="banner modal image items"
										className="sm:w-[23px] sm:h-[23px] "
										width={40}
										height={40}
									/>
								</div>
								<p className="w-[75px] sm:w-[44px] h-[25px] sm:h-[15px] bg-white text-[10px] sm:text-[7px] font-secondary font-semibold leading-[20px] sm:leading-[12px] tracking-[-1%] text-[#000000] rounded-[10px] sm:rounded-[6px] flex justify-center items-center">
									Marketer
								</p>
							</div>
						</div>

						{/* modal image container 3 */}
						<div className="modal-item-3 w-[132px] h-[132px] absolute right-0 sm:top-[-96px] sm:right-0 sm:w-[80px] sm:h-[80px] bg-[#A274FF1A] rounded-[32px] sm:rounded-[19px] flex justify-center items-center banner-modal-shadow">
							<div className="mt-[-10px]">
								<div className="flex justify-center items-center mb-[8px] sm:mb-1">
									<Image
										src="/images/banner-modal-3.svg"
										alt="banner modal image items"
										className="sm:w-[34px] h-[32px] "
										width={62}
										height={62}
									/>
								</div>
								<p className="w-[93px] sm:w-[60px] h-[34px] sm:h-[21px] bg-white text-[12px] sm:text-[8px] font-secondary font-semibold leading-[20px] sm:leading-[12px] tracking-[-1%] text-[#000000] rounded-[10px] sm:rounded-[6px] flex justify-center items-center">
									Copywriter
								</p>
							</div>
						</div>
					</div>

					<div className="banner-cont-box text-center">
						<h1 className="banner-title max-w-[705px] mx-auto mb-[31px] sm:mb-4 text-[#120037]">
							The <span className="text-primary">Web 3.0 </span>{' '}
							<br />
							Freelancing Marketplace
						</h1>
						<p className="banner-desc max-w-[570px] sm:mb-6 mx-auto mb-[44px] text-[18px] text-center font-semibold sm:font-normal sm:text-[14px] font-secondary tracking-[.01em] leading-[24px] sm:leading-[19.5px]">
							At w3rk we are on a mission to to reshape the
							freelancing and hiring landscape for the Web 3.0
							world, proudly bridging global businesses with
							exceptional Web 3.0 professionals who embrace
							cryptocurrency payments.
						</p>
						<button type="button" className="button-primary">
							Connect Wallet
						</button>
					</div>
					<div className="banner-modal banner-modal-bottom">
						{/* modal image container 4 */}
						<div className="modal-item-4 w-[264px] h-[264px] absolute right-0 bottom-[-141px] sm:bottom-[-182px] sm:right-[-20px] sm:w-[158px] sm:h-[158px] sm:object-contain bg-[#A274FF1A] rounded-[40px] flex justify-center items-center banner-modal-shadow">
							<div className="">
								<div className="flex justify-center items-center mb-[19px] sm:mb-[14px]">
									<Image
										src="/images/banner-modal-4.svg"
										alt="banner modal image items"
										className="sm:w-[75px] sm:h-[75px] "
										width={140}
										height={140}
									/>
								</div>
								<p className="w-[202px] sm:w-[121px] h-[56px] sm:h-[33px] bg-white text-[18px] sm:text-[10.8px] font-secondary font-semibold leading-[20px] sm:leading-[12px] tracking-[-1%] text-[#000000] rounded-[16px] sm:rounded-[9.6px] flex justify-center items-center">
									Full-Stack Developer
								</p>
							</div>
						</div>

						{/* modal image container 5 */}
						<div className="modal-item-5 w-[196px] h-[196px] absolute left-[100px] bottom-[-161px] sm:bottom-[-245px] sm:w-[117px] sm:h-[117px] sm:object-contain sm:left-[55px] bg-white rounded-[32px] sm:rounded-[19px] flex justify-center items-center banner-modal-shadow">
							<div>
								<div className="flex justify-center items-center mb-[16px] sm:mb-[10px]">
									<Image
										src="/images/banner-modal-5.svg"
										alt="banner modal image items"
										className="sm:w-[43px] sm:h-[43px] "
										width={90}
										height={90}
									/>
								</div>
								<p className="w-[142px] sm:w-[93px] h-[42px] sm:h-[25px] bg-[#A274FF1A] text-[12px] sm:text-[8px]  font-secondary font-semibold leading-[20px] sm:leading-[12px] tracking-[-1%] text-[#000000] rounded-[11px] sm:rounded-[6px] flex justify-center items-center">
									Blockchain Developer
								</p>
							</div>
						</div>

						{/* modal image container 1 */}
						<div className="modal-item-1 w-[164px] h-[164px] absolute left-[-75px] bottom-[133px] sm:bottom-[-113px] sm:left-0 sm:w-[98px] sm:h-[98px] bg-white rounded-[32px] sm:rounded-[19px] flex justify-center items-center banner-modal-shadow">
							<div>
								<div className="flex justify-center items-center mb-[13px] sm:mb-[10px]">
									<Image
										src="/images/banner-modal-1.svg"
										alt="banner modal image items"
										className="sm:w-[33px] sm:h-[33px] "
										width={76}
										height={76}
									/>
								</div>
								<p className="w-[120px] sm:w-[78px] h-[35px] sm:h-[21px] bg-[#A274FF1A] text-[12px] sm:text-[8px] font-secondary font-semibold leading-[20px] sm:leading-[12px] tracking-[-1%] text-[#000000] rounded-[11px] sm:rounded-[6.6px] flex justify-center items-center">
									Graphic Designer
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HomeBanner;
