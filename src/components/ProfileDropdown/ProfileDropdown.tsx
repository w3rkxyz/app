import React from 'react';

const ProfileDropdown = () => {
	return (
		<div className="profile-dropdown-section">
			<div className="custom-container">
				<div className="w-[201px] h-[273px] top-pick-card-shadow rounded-[20px] pt-[12px] px-[17px] pb-[19px] bg-[#EFEFEF]">
					<p className="text-[14px] font-medium font-secondary leading-[24px] tracking-[-3%] text-[#000000] mb-[9px]">
						@user.lens
					</p>
					<button className="h-[40px] text-[16px] font-medium font-secondary leading-[24px] tracking-[-3%] text-[#000000] bg-white w-full mb-[9px] rounded-[10px]">
						My Posts
					</button>
					<button className="h-[40px] text-[16px] font-medium font-secondary leading-[24px] tracking-[-3%] text-[#000000] bg-white w-full mb-[9px] rounded-[10px]">
						My Contract
					</button>
					<button className="h-[40px] text-[16px] font-medium font-secondary leading-[24px] tracking-[-3%] text-[#000000] bg-white w-full mb-[31px] rounded-[10px]">
						My Wallet
					</button>
					<button className="h-[40px] text-[16px] font-medium font-secondary leading-[24px] tracking-[-3%] text-[#000000] bg-[#FFAEAE]/50 w-full rounded-[10px]">
						Log Out
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProfileDropdown;
