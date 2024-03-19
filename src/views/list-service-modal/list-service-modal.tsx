import PostListModal from '@/components/reusable/PostListModal/PostListModal';

const ListServiceModal = () => {
	return (
		// <div className="mt-[170px] mb-[56px]">
		// 	<div className="custom-container">
		// 		<div className="shadow-2xl shadow-[#000000]/25 max-w-[1110px] w-full mx-auto relative px-[108px] sm:px-5 py-[28px] sm:py-5 rounded-[20px] ">
		// 			<div className="absolute top-[10px] right-[10px] sm:top-[10px]">
		// 				<Image
		// 					src="/images/close.svg"
		// 					alt="close icon"
		// 					className="w-[35px] sm:w-[25px] h-[35px] sm:h-[25px]"
		// 					width={35}
		// 					height={35}
		// 				/>
		// 			</div>
		// 			<h2 className="text-[36px] sm:text-[25px] font-semibold font-secondary leading-[40xp] tracking-[-4%] text-center ">
		// 				List A Service
		// 			</h2>
		// 			<div className="grid grid-cols-2 sm:grid-cols-1 gap-10 sm:gap-3">
		// 				<div>
		// 					<div className="my-5">
		// 						<label
		// 							htmlFor="role"
		// 							className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%]"
		// 						>
		// 							Service Name
		// 						</label>{' '}
		// 						<br />
		// 						<input
		// 							type="text"
		// 							placeholder="[service name]"
		// 							className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
		// 						/>
		// 					</div>

		// 					<label
		// 						htmlFor="description"
		// 						className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
		// 					>
		// 						Service Description
		// 					</label>
		// 					<br />
		// 					<textarea
		// 						placeholder="[service description]"
		// 						className="w-full pl-3 pt-3 h-[313px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] sm:h-[100px] rounded-[10px] resize-none mt-2 border-[2px] border-[#000000]/20"
		// 					/>
		// 				</div>
		// 				<div>
		// 					<div className="my-5">
		// 						<label
		// 							htmlFor="role"
		// 							className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
		// 						>
		// 							Price
		// 						</label>{' '}
		// 						<br />
		// 						<input
		// 							type="text"
		// 							placeholder="[amount in USD]"
		// 							className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
		// 						/>
		// 						<div className="flex justify-end -mt-[40px]">
		// 							<button className="py-[6px] px-[9px] border-2  border-[#000000]/20 bg-white text-[#000000]/50 rounded-[10px] text-[16px] font-semibold font-secondary leading-[24px] tracking-[-3%] ">
		// 								[fixed/hourly]
		// 							</button>
		// 						</div>
		// 					</div>
		// 					<div className="my-5">
		// 						<label
		// 							htmlFor="role"
		// 							className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
		// 						>
		// 							Accepted Tokens
		// 						</label>{' '}
		// 						<br />
		// 						<input
		// 							type="text"
		// 							placeholder="[select tokens]"
		// 							className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
		// 						/>
		// 					</div>

		// 					<div className="my-5">
		// 						<label
		// 							htmlFor="role"
		// 							className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
		// 						>
		// 							Tags
		// 						</label>{' '}
		// 						<br />
		// 						<input
		// 							type="text"
		// 							placeholder="[select 3 tags minimum]"
		// 							className="py-2 w-full h-[40px] rounded-[10px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] mt-2 pl-3 border-[2px] border-[#000000]/20"
		// 						/>
		// 					</div>
		// 					<div className="my-5">
		// 						<label
		// 							htmlFor="role"
		// 							className="text-[18px] pl-3 font-semibold font-secondary leading-[24px] tracking-[-3%] "
		// 						>
		// 							Portfolio
		// 						</label>{' '}
		// 						<br />
		// 						<input
		// 							type="text"
		// 							placeholder="[attach previous work]"
		// 							className="py-2 w-full h-[40px] text-[16px] placeholder-[#000000]/50 font-semibold font-secondary leading-[24px] tracking-[-3%] rounded-[10px] mt-2 pl-3 border-[2px] border-[#000000]/20"
		// 						/>
		// 					</div>
		// 				</div>
		// 			</div>
		// 			<div className="flex justify-center items-center mt-[34px] sm:mt-3 sm:mb-7">
		// 				<button className="button-primary w-[186px] h-[56px] !px-16 flex justify-center items-center">
		// 					List
		// 				</button>
		// 			</div>
		// 		</div>
		// 	</div>
		// </div>
		<>
			<PostListModal />
		</>
	);
};

export default ListServiceModal;
