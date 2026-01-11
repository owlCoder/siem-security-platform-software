import { SearchBarProps } from "../../types/props/alerts/SearchBarProps";


const inputClass = "flex-1 px-3! py-2! rounded-[10px]! border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)]! text-white text-[13px] outline-none";

export default function SearchBar({
  searchText,
  onSearchTextChange,
  onSearch,
  onReset,
  onKeyPress
}:SearchBarProps) {
  return (
    <div className="col-span-4">
      <label className="block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Search Source</label>
      <div className="flex gap-3 w-full">
        <input
          type="text"
          placeholder="Search by..."
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          onKeyPress={onKeyPress}
          className={inputClass}
        />
        <button 
          onClick={onSearch} 
          className="w-[90px]! sm:w-[80px] py-2! rounded-[10px]! bg-[#007a55]! hover:bg-[#9ca3af]! text-white text-[13px] font-semibold cursor-pointer"
        >
          Search
        </button>
        <button 
          onClick={onReset} 
          className="w-[90px]! sm:w-[80px] py-2! rounded-[10px]! bg-[#313338]! hover:bg-[#9ca3af]! text-white text-[13px] font-semibold cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
};