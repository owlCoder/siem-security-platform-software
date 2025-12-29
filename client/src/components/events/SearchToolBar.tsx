interface SearchToolBarProps {
    value: string;
    onSearchText: (searchText: string) => void;
    value1: string;
    onEventType: (eventType: string) => void;
    value2: string;
    onDateTo: (dateTo: string) => void;
    value3: string;
    onDateFrom: (dateFrom: string) => void;
    onSearchClick: () => void;
}

export function SearchToolBar({ value, onSearchText, value1, onEventType, value2, onDateTo, value3, onDateFrom, onSearchClick }: SearchToolBarProps) {

    return (
        <>
            {/* items-end poravnava sve u liniju sa dnom (tamo gde je Search dugme i inputi) */}
            <div className="flex flex-wrap items-end gap-[16px] ml-[10px] w-full">
                
                {/* Search Input polje */}
                <div className="flex flex-col gap-[4px] flex-1 min-w-[300px]">
                    <label className="opacity-0">Spacing</label> {/* Nevidljivi label radi savršenog poravnanja */}
                    <input
                        className="px-3 py-2 h-[40px] rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)] text-white text-[13px] outline-none w-full"
                        placeholder="Type..."
                        value={value}
                        onChange={(e) => onSearchText(e.target.value)}
                    />
                </div>

                {/* Type Select */}
                <div className="flex flex-col gap-[4px]">
                    <label className="text-white text-[14px]">Type:</label>
                    <select
                        className="border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white w-[180px] rounded-[10px] p-[4px] h-[40px] font-semibold outline-none"
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
                        className="border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d] text-white w-[160px] rounded-[10px] px-[8px] h-[40px] font-semibold outline-none"
                        type="date"
                        value={value3}
                        onChange={(e) => onDateFrom(e.target.value)}
                    />
                </div>

                {/* Date To */}
                <div className="flex flex-col gap-[4px]">
                    <label className="text-white text-[14px]">Date to:</label>
                    <input
                        className="border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d] text-white w-[160px] rounded-[10px] px-[8px] h-[40px] font-semibold outline-none"
                        type="date"
                        value={value2}
                        onChange={(e) => onDateTo(e.target.value)}
                    />
                </div>

                {/* Search Button */}
                <button
                    className="bg-[#007a55] text-white min-w-[120px] rounded-[10px] px-[20px] h-[40px] font-semibold hover:bg-[#009166] transition-colors"
                    onClick={onSearchClick}
                >
                    Search
                </button>

            </div>
        </>
    )
}