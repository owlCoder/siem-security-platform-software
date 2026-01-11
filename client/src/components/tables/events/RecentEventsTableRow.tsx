import { badgeClasses } from "../../../constants/badgeClasses";
import { RowProps } from "../../../types/props/events/RowProps";

export function RecentEventsTableRow({ e, index }: RowProps) {
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