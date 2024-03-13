import SearchIcon from '@/icons/SearchIcon';

const SearchInput = () => {
	return (
		<>
			<div className="flex justify-between items-center max-w-[671px] w-full bg-[#FFFFFF]/50 rounded-[20px] p-[6px] sm:my-[16px]">
				<input
					type="search"
					className="rounded-[10px] pl-3 py-1 w-full"
					placeholder="[search query here]"
				/>
				<button className="search-button p-[2px] bg-primary/50 -ml-10 mr-[4px] rounded-[8px]">
					<SearchIcon />
				</button>
			</div>
		</>
	);
};

export default SearchInput;
