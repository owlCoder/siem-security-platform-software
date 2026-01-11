import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { ExpandedRow } from "./ExpandedRow";
import React from "react";
import { EventTableRowProps } from "../../../types/props/events/EventTableRowProps";
import { badgeClasses } from "../../../constants/badgeClasses";

export default function EventTableRow({ e, index, parserApi }: EventTableRowProps) {
    const [rotateArrow, setRotateArrow] = useState<number | null>(null);

    return (
        <React.Fragment>
            <tr className="transition-colors duration-200 cursor-pointer hover:bg-[#2a2a2a]">
                <td className="px-4! py-3! text-center border-b border-[#2d2d2d] text-[#dcdcdc] font-mono text-[14px]">{e.source}</td>
                <td className="px-4! py-3! text-center border-b border-[#2d2d2d] text-[#dcdcdc] font-mono text-[14px]">{new Date(e.time).toLocaleString("en-GB")}</td>
                <td className="px-4! py-3! text-center border-b border-[#2d2d2d] text-[#dcdcdc] font-mono text-[14px]">
                    <span className={`px-2.5! py-1! rounded-[10px] text-[14px] font-semibold ${badgeClasses[e.type]}`}>
                        {e.type}
                    </span>
                </td>
                <td>
                    <IoIosArrowDown className={`cursor-pointer transition-transform duration-300 ease-in-out ${rotateArrow === index ? "rotate-180" : "rotate-0"
                        }`}
                        onClick={() => { setRotateArrow(rotateArrow === index ? null : index) }}
                        size={20} />
                </td>
            </tr>

            {/* Expanded details row */}
            <ExpandedRow expanded={rotateArrow === index} e={e} parserApi={parserApi} />
        </React.Fragment>
    );
}