import { EventRow } from "../../types/events/EventRow";

interface RowProps {   //at the end,move into a right folders(types) 
    e: EventRow;
    index: number;
}
export function RecentEventsTableRow({ e, index }: RowProps) {
    const badgeClasses: Record<string, string> = {
        INFO: "bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.3)]",
        WARNING: "bg-[rgba(234,179,8,0.15)] text-[#facc15] border border-[rgba(234,179,8,0.3)]",
        ERROR: "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]",
    };
    return (
        <>
            <tr className="transition-colors duration-200 cursor-pointer hover:bg-[#2a2a2a]" key={index}>
                <td className="px-4! py-3! text-center border-b border-[#2d2d2d] text-[#dcdcdc] font-mono text-[14px]">{e.source}</td>
                <td className="px-4! py-3! text-center border-b border-[#2d2d2d] text-[#dcdcdc] font-mono text-[14px]">{new Date(e.time).toLocaleString("en-GB")}</td>
                <td className="px-4! py-3! text-center border-b border-[#2d2d2d] text-[#dcdcdc] font-mono text-[14px]">
                    <span className={`px-2.5! py-1! rounded-[10px] text-[14px] font-semibold ${badgeClasses[e.type]}`}>
                        {e.type}
                    </span>
                </td>
            </tr>
        </>
    )
}