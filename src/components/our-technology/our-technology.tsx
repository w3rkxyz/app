import Image from 'next/image';
import React from 'react';

const OurTechnology = () => {
	return (
		<div className="our-technology-section pt-[65px] sm:pt-10 pb-[110px] sm:pb-10">
			<div className="custom-container">
				<div className="section-title-box text-center mb-10">
					<h2 className="section-title text-center">
						Unlock the potential of{' '}
						<span className="text-primary">blockchain</span>{' '}
						technology.
					</h2>
				</div>
				<div className="our-technology-wrapper">
					<div className="our-technology-cards-item sm:flex-col sm:gap-4 flex items-center gap-[14px] max-w-[864px] mx-auto mb-[18px] sm:mb-10">
						<div className="card-modal flex justify-center items-center relative py-[25px] sm:py-[17px] rounded-[40px] sm:rounded-[20px] bg-[#FFFFFF1A] max-w-[150px] max-h-[150px] sm:max-w-[100px] sm:max-h-[100px] min-w-[150px] min-h-[150px] sm:min-w-[100px] sm:min-h-[100px]">
							<Image
								src="/images/tech-icon-1.svg"
								className="absolute top-0 bottom-0 left-0 right-0 m-auto"
								alt="technology items modal"
								width={180}
								height={180}
							/>
						</div>
						<p className="tech-card-desc text-left sm:text-center">
							Create your Web 3.0 identity effortlessly via Lens
							where you can showcase your expertise and
							experience.
						</p>
					</div>
					<div className="our-technology-cards-item sm:flex-col sm:gap-4 flex items-center gap-[14px] max-w-[864px] mx-auto mb-[18px] sm:mb-10">
						<div className="card-modal flex justify-center items-center relative p-[25px] sm:p-[17px] rounded-[40px] sm:rounded-[20px] bg-[#FFFFFF1A] max-w-[150px] max-h-[150px] sm:max-w-[100px] sm:max-h-[100px] min-w-[150px] min-h-[150px] sm:min-w-[100px] sm:min-h-[100px]">
							<Image
								src="/images/tech-icon-2.svg"
								className="relative top-0 bottom-0 left-0 right-0 m-auto"
								alt="tectnology items modal"
								width={100}
								height={100}
							/>
						</div>
						<p className="tect-card-desc text-left sm:text-center">
							Create your Web 3.0 identity effortlessly via Lens
							where you can showcase your expertise and
							experience.
						</p>
					</div>
					<div className="our-technology-cards-item sm:flex-col sm:gap-4 flex items-center gap-[14px] max-w-[864px] mx-auto mb-[18px] sm:mb-10">
						<div className="card-modal flex justify-center items-center relative p-[25px] sm:p-[17px]  rounded-[40px] sm:rounded-[20px] bg-[#FFFFFF1A] max-w-[150px] max-h-[150px] sm:max-w-[100px] sm:max-h-[100px] min-w-[150px] min-h-[150px] sm:min-w-[100px] sm:min-h-[100px]">
							<Image
								src="/images/tech-icon-3.svg"
								className="relative top-0 bottom-0 left-0 right-0 m-auto w-full"
								alt="tectnology items modal"
								width={100}
								height={100}
							/>
						</div>
						<p className="tect-card-desc text-left sm:text-center">
							Create your Web 3.0 identity effortlessly via Lens
							where you can showcase your expertise and
							experience.
						</p>
					</div>
					<div className="our-technology-cards-item sm:flex-col sm:gap-4 flex items-center gap-[14px] max-w-[864px] mx-auto">
						<div className="card-modal flex justify-center items-center relative p-[25px] sm:p-[17px] rounded-[40px] sm:rounded-[20px] bg-[#FFFFFF1A] max-w-[150px] max-h-[150px] sm:max-w-[100px] sm:max-h-[100px] min-w-[150px] min-h-[150px] sm:min-w-[100px] sm:min-h-[100px]">
							<Image
								src="/images/tech-icon-4.svg"
								className="relative top-0 bottom-0 left-0 right-0 m-auto"
								alt="tectnology items modal"
								width={100}
								height={100}
							/>
						</div>
						<p className="tect-card-desc text-left sm:text-center">
							Create your Web 3.0 identity effortlessly via Lens
							where you can showcase your expertise and
							experience.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OurTechnology;
