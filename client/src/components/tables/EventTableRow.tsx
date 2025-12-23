import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { ExpandedRow } from "./ExpandedRow";
import React from "react";
import { EventRow } from "../../types/events/EventRow";

interface RowProps {   //at the end,move into a right folders(types) 
    e: EventRow;
    index: number;
}
export default function EventTableRow({ e, index }: RowProps) {
    const [rotateArrow, setRotateArrow] = useState<number | null>(null);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const tdStyle: React.CSSProperties = {
        padding: "12px 16px",
        borderBottom: "1px solid #2d2d2d",
        color: "#dcdcdc",
        height: "50px"
    };
    const eventIdStyle: React.CSSProperties = {
        ...tdStyle,
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: "15px",
        color: "#dcdcdc",
    };

    const badgeBase: React.CSSProperties = {
        padding: "5px 10px",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
    };

    const badgeColors: Record<string, React.CSSProperties> = {
        INFO: {
            background: "rgba(59, 130, 246, 0.15)",
            color: "#60a5fa",
            border: "1px solid rgba(59, 130, 246, 0.3)",
        },
        WARNING: {
            background: "rgba(234, 179, 8, 0.15)",
            color: "#facc15",
            border: "1px solid rgba(234, 179, 8, 0.3)",
        },
        ERROR: {
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
        },
    };

    const liHoverStyle: React.CSSProperties = {
        backgroundColor: "#3d3d3d", // gray-400
    };
    const arrowStyle = (index: number): React.CSSProperties => ({
        transform: rotateArrow === index ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease"
    });

    return (
        <React.Fragment>
            <tr
                style={hoveredRow === e.id ? liHoverStyle : undefined}
                onMouseEnter={() => setHoveredRow(e.id)}
                onMouseLeave={() => setHoveredRow(null)}
            >
                <td style={eventIdStyle}>{e.source}</td>
                <td style={tdStyle}>{new Date(e.time).toLocaleString("en-GB")}</td>
                <td style={tdStyle}>
                    <span style={{ ...badgeBase, ...badgeColors[e.type] }}>
                        {e.type}
                    </span>
                </td>
                <td>
                    <IoIosArrowDown className="cursor-pointer"
                        style={arrowStyle(index)}
                        onClick={() => { setRotateArrow(rotateArrow === index ? null : index) }}
                        size={20} />
                </td>
            </tr>

            {/* Expanded details row */}
            <ExpandedRow expanded={rotateArrow === index} e={e} />
        </React.Fragment>
    );
}