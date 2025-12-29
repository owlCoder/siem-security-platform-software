import { TopArchivesProps } from "../../types/props/statistics/TopArchivesProps";

export default function TopArchives( {data, type, onTypeChange}: TopArchivesProps) {
    const thClass = "px-4! py-5! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]"
    const tdClass = "px-4! py-5! text-center text-[#dcdcdc] text-[14px] border-b-[1px] border-b-[#2d2d2d]"

    return(
        <div>
            <div className="flex justify-between items-center m-4!">
                <span className="text-white text-lg font-semibold">
                    Top 5 Archives
                </span>

                <div className="flex gap-2">
                    <button
                        className={`px-5! py-2! rounded-[10px]! text-white text-sm font-semibold transition-all duration-200 ${
                            type === "events" ? "bg-[#007a55]" : "bg-[#313338]"
                        }`}
                        onClick={() => onTypeChange("events")}>
                            Events
                    </button>
                    <button
                        className={`px-5! py-2! rounded-[10px]! text-white text-sm font-semibold transition-all duration-200 ${
                            type === "alerts" ? "bg-[#007a55]" : "bg-[#313338]"
                        }`}
                        onClick={() => onTypeChange("alerts")}>
                            Alerts
                    </button>
                </div>
            </div>
            <div className="bg-[#1f1f1f] border-2 border-[#333] rounded-[10px]! shadow-md overflow-hidden m-2!">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-[#2a2a2a]">
                            <tr>
                                <th className={`${thClass} w-[10%]`}>ID</th>
                                <th className={`${thClass} w-[10%]`}>File name</th>
                                <th className={`${thClass} w-[10%]`}>
                                    {type === "events" ? "Event count" : "Alert count"}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-10 py-10 text-center text-[#a6a6a6] border-b border-[#2d2d2d]">
                                        No archives found
                                    </td> 
                                </tr>
                            ): (data.map((archive, index) => (
                                <tr key={archive.id} className="transition-colors duration-200 hover:bg-[#2a2a2a] cursor-pointer">
                                    <td className={tdClass}>{index + 1}</td>
                                    <td className={tdClass}>{archive.fileName}</td>
                                    <td className={`${tdClass} font-semibold`}>{archive.count}</td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
            </div>
        </div>  
    );
}
