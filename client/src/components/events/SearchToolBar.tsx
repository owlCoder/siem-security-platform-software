import { SearchToolBarProps } from "../../types/props/events/SearchToolBarProps";

export function SearchToolBar({ value, onSearchText, value1, onEventType, value2, onDateTo, value3, onDateFrom, onSearchClick }: SearchToolBarProps) {

    return (
        <>
            {/* items-end poravnava sve u liniju sa dnom (tamo gde je Search dugme i inputi) */}
            <div className="flex flex-wrap items-end gap-[15px]! ml-[10px] w-full">
                
                {/* Search Input polje */}
                <div className="flex flex-col gap-[4px] flex-1 min-w-[400px]">
                    <label className="opacity-0">Spacing</label> {/* Nevidljivi label radi savršenog poravnanja */}
                    <input
                        className="px-3 py-2 h-[40px] ml-[10px]! rounded-[10px] w-[400px]! border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)] text-white text-[13px] outline-none w-full"
                        placeholder="Type..."
                        value={value}
                        onChange={(e) => onSearchText(e.target.value)}
                    />
                </div>

                {/* Type Select */}
                <div className="flex flex-col gap-[4px]">
                    <label className="text-white text-[14px]">Type:</label>
                    <select
                        className="border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white w-[200px]! rounded-[10px]! py-[4px]! h-[40px] font-semibold outline-none"
                        value={value1}
                        onChange={(e) => onEventType(e.target.value)}
                    >
                        <option value="all">All types</option>
                        <option value="info">Informations</option>
                        <option value="warning">Warnings</option>
                        <option value="error">Errors</option>
                    </select>
                </div>

                {/* Date From */}
                <div className="flex flex-col gap-[4px]">
                    <label className="text-white text-[14px]">Date from:</label>
                    <input
                        className="border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d] text-white w-[200px] rounded-[10px]! px-[8px] h-[40px] font-semibold outline-none"
                        type="date"
                        value={value3}
                        onChange={(e) => onDateFrom(e.target.value)}
                    />
                </div>

                {/* Date To */}
                <div className="flex flex-col gap-[4px]">
                    <label className="text-white text-[14px]">Date to:</label>
                    <input
                        className="border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d] text-white w-[200px] rounded-[10px] px-[8px] h-[40px] font-semibold outline-none"
                        type="date"
                        value={value2}
                        onChange={(e) => onDateTo(e.target.value)}
                    />
                </div>

                {/* Search Button */}
                <button
                    className="bg-[#007a55] text-white min-w-[120px] mr-[10px]! w-[200px]! rounded-[10px]! px-[20px] h-[40px] font-semibold hover:bg-[#009166] transition-colors"
                    onClick={onSearchClick}
                >
                    Search
                </button>

            </div>
        </>
    )
}