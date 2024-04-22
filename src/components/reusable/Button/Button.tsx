import React from 'react';

interface ButtonElement {
	buttonText: string;
	buttonStyles: string;
	buttonType: 'primary' | 'secondary' | 'accent' | 'tertiary' | 'custom';
}

const MyButton: React.FC<ButtonElement> = ({
	buttonText,
	buttonType,
	buttonStyles,
}) => {
	const getButtonTypes = (type: string) => {
		switch (type) {
			case 'primary':
				return 'text-[20px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-left max-w-[220px] height-[56px] py-[16px] px-[40px] rounded-[16px] bg-[#a274ff80] text-[#ffffff] hover:bg-[#120037] duration-300';
			case 'secondary':
				return 'text-[12px] sm:text-[10px] font-semibold font-secondary leading-[20px] sm:leading-[12px] tracking-[-1%] w-full sm:w-auto md:w-auto h-[40px] sm:h-[31px] sm:py-[10px] sm:px-3 md:px-5 text-center  rounded-[10px] text-[#000000]';
			case 'accent':
				return 'text-[10px] font-semibold font-secondary text-center leading-[20px] tracking-[-1%] w-full sm:w-[146px] md:w-full height-[30px] py-1 mb-[6px] rounded-[6px] text-[#000000]';
			case 'tertiary':
				return 'text-[16px] sm:text-[14px] font-semibold font-secondary text-center leading-[24px] sm:leading-[14px] tracking-[-3%] py-2 sm:py-[10px] w-[132.86px] sm:w-[104px] height-[40px] sm:h-[34px] rounded-[8px]';
			default:
				return 'bg-gray-500';
		}
	};

	return (
		<button className={` ${buttonStyles} ${getButtonTypes(buttonType)}`}>
			{buttonText}
		</button>
	);
};

export default MyButton;
