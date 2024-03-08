import React from 'react';

interface ButtonElement {
	buttonText: string;
	buttonStyles: string;
	buttonType: 'primary' | 'secondary' | 'accent' | 'terterry' | 'custom'; // Specify the types of buttons
}

const MyButton: React.FC<ButtonElement> = ({
	buttonText,
	buttonType,
	buttonStyles,
}) => {
	const getButtonStyles = (type: string) => {
		switch (type) {
			case 'primary':
				return 'text-[20px] font-semibold font-secondary leading-[24px] tracking-[-3%] text-left max-w-[220px] height-[56px] py-[16px] px-[40px] rounded-[16px] bg-[#a274ff80] text-[#ffffff] hover:bg-[#120037]';
			case 'secondary':
				return 'text-[12px] font-semibold font-secondary leading-[20px] tracking-[-1%] w-full height-[40px] py-[10px] text-center  rounded-[10px] text-[#000000]';
			case 'accent':
				return 'text-[10px] font-semibold font-secondary text-center leading-[20px] tracking-[-1%] w-full height-[30px] py-1 mb-[6px] rounded-[6px] text-[#000000]';
			case 'terterry':
				return 'text-[16px] font-semibold font-secondary text-center leading-[24px] tracking-[-3%] py-2   w-[132.86px] height-[40px] py-1 mb-[6px] rounded-[10px] ';
			default:
				return 'bg-gray-500'; // Default style
		}
	};

	return (
		<button className={` ${buttonStyles} ${getButtonStyles(buttonType)}`}>
			{buttonText}
		</button>
	);
};

export default MyButton;
