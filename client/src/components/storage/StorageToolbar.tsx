import { useState } from "react";
import DropDownMenu from "../events/DropDownMenu";
import { StorageToolBarProps } from "../../types/props/storage/StorageToolBarProps";


export default function StorageToolBar({ onSearch, onSort }: StorageToolBarProps) {
    const [searchText, setSearchText] = useState("");

    const handleSearch = () => {
        onSearch(searchText.trim());
        setSearchText("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSortChange = (value: number) => {
        switch (value) {
            case 1:
                onSort("name", "asc");
                break;
            case 2:
                onSort("name", "desc");
                break;
            case 3:
                onSort("size", "asc");
                break;
            case 4:
                onSort("size", "desc");
                break;
            case 5:
                onSort("date", "asc");
                break;
            case 6:
                onSort("date", "desc");
                break;
            default:
                break;
        }
    };

    return (
        <div className="grid grid-cols-3 lg:grid-cols-2  w-full px-2! py-2! mb-6">
            <div className="col-span-1" />

            <div className="col-span-2 lg:col-span-1 flex jusitfy-end">
                <div className="flex gap-3 w-full lg:w-auto">

                    <input
                        type="text"
                        placeholder="Search by file name..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-3! py-2! rounded-[10px]! border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)]! text-white text-[13px] outline-none"
                    />

                    <button
                        onClick={handleSearch}
                        className="px-6! py-2! rounded-[10px]! bg-[#007a55]! hover:bg-[#9ca3af]! text-white text-[13px] font-semibold cursor-pointer"
                    >
                        Search
                    </button>

                    <DropDownMenu
                        OnSortTypeChange={handleSortChange}
                        sortName1="Name"
                        sortName2="Size"
                        sortName3="Date" />
                </div>
            </div>
        </div>
    );
} 