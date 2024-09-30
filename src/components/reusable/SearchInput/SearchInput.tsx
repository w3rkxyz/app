import SearchIcon from "@/icons/SearchIcon";

interface Search {
  toggleCategories?: any;
  setSearchText: any;
}

const SearchInput = ({ toggleCategories, setSearchText }: Search) => {
  return (
    <>
      <div className="flex justify-start sm:justify-between items-center max-w-[600px] bg-white w-full border-[1px] border-[#E4E4E7] rounded-[12px]">
        <input
          className="search-input rounded-[12px] p-[11px]"
          placeholder="Search..."
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          className="hidden sm:block search-button -ml-10 mr-[4px] border-l-[1px] border-l-[#E4E4E7] px-[5px]"
          onClick={() => toggleCategories?.()}
        >
          <SearchIcon />
        </button>
      </div>
    </>
  );
};

export default SearchInput;
