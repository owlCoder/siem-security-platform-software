import React from "react";

interface SearchBarProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const inputClass = "flex-1 px-1 h-10 rounded-xl border border-white/20 bg-black/30 text-white text-[10px] outline-none";
const buttonClass = "flex-1 px-2 h-10 bg-[#007a55] hover:opacity-90 text-white font-semibold rounded-xl flex items-center justify-center gap-0.5 transition-all";

export const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  onSearchTextChange,
  onSearch,
  onReset,
  onKeyPress
}) => {
  return (
    <div className="col-span-4">
      <label className="block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Search Source</label>
      <div className="flex gap-2 w-full">
        <input
          type="text"
          placeholder="Search by..."
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          onKeyPress={onKeyPress}
          className={inputClass}
        />
        <button onClick={onSearch} className={buttonClass}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
          </svg>
          Search
        </button>
        <button onClick={onReset} className={buttonClass}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
};
