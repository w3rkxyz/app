import { searchIcon } from '@/icons/Icons';
import Image from 'next/image';

const SearchInput = () => {
	return (
		<>
			<div className="flex justify-between items-center max-w-[671px] w-full bg-[#FFFFFF]/50 rounded-[20px] p-[6px]">
				<input
					type="search"
					className="rounded-[10px] pl-3 py-1 w-full"
					placeholder="[search query here]"
				/>
				<button className="search-button bg-primary -ml-10 mr-[4px] rounded-[10px]">
					<Image
						src={searchIcon}
						alt="search icon"
						className="w-[28px] h-[28px] p-1 rounded-[10px]"
					/>
				</button>
			</div>
		</>
	);
};

export default SearchInput;
