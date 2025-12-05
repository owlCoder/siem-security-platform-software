import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { ExpandedRow } from "./ExpandedRow";

interface EventRow {  //move into a right folders(types)
    id: string;
    time: string;
    type: "Info" | "Warning" | "Error";
}
interface RowProps {  //move into a right folders(types)
    e: EventRow;
    index: number;
}
export default function AllEventsTable({ e, index }: RowProps) {
    const [rotateArrow, setRotateArrow] = useState<number | null>(null);

    const tdStyle: React.CSSProperties = {
        padding: "12px 16px",
        borderBottom: "1px solid #2d2d2d",
        color: "#dcdcdc",
        height: "50px"
    };
    const eventIdStyle: React.CSSProperties = {
        ...tdStyle,
        fontFamily: "Consolas, 'Courier New', monospace",
        fontSize: "13px",
        color: "#b5b5b5",
    };

    const badgeBase: React.CSSProperties = {
        padding: "5px 10px",
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 600,
    };

    const badgeColors: Record<string, React.CSSProperties> = {
        Info: {
            background: "rgba(59, 130, 246, 0.15)",
            color: "#60a5fa",
            border: "1px solid rgba(59, 130, 246, 0.3)",
        },
        Warning: {
            background: "rgba(234, 179, 8, 0.15)",
            color: "#facc15",
            border: "1px solid rgba(234, 179, 8, 0.3)",
        },
        Error: {
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
        },
    };

    const arrowStyle = (index: number): React.CSSProperties => ({
        transform: rotateArrow === index ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease"
    });
    
    return (
        <>
            <tr key={index} className="hover:bg-gray-600">
                <td style={eventIdStyle}>{e.id}</td>
                <td style={tdStyle}>{e.time}</td>
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
            <ExpandedRow expanded={rotateArrow===index} e={e}/>
        </>
    );
}