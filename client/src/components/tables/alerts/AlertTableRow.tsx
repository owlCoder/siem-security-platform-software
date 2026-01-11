import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { PiWarningOctagonFill, PiInfoBold } from "react-icons/pi";
import { BiMessageRounded } from "react-icons/bi";

// za sada lokalno
interface AlertRow {
  id: string;
  time: string;
  isAlert: boolean;
}

interface RowProps {
  a: AlertRow;
  index: number;
}

//kasnije u css fajl style
export default function AlertTableRow({ a, index }: RowProps) {
  const [rotateArrow, setRotateArrow] = useState<number | null>(null);

  const tdStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderBottom: "1px solid #2d2d2d",
    color: "#dcdcdc",
    height: "50px",
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

  const yesBadge: React.CSSProperties = {
    ...badgeBase,
    background: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  };

  const noBadge: React.CSSProperties = {
    ...badgeBase,
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.3)",
  };

  const arrowStyle = (index: number): React.CSSProperties => ({
    transform: rotateArrow === index ? "rotate(180deg)" : "rotate(0deg)",
    transition: "transform 0.3s ease",
  });

  return (
    <>
      <tr key={index} className="hover:bg-gray-600">
        {/* ikonica levo */}
        <td style={tdStyle}>
          {a.isAlert ? (
            <PiWarningOctagonFill color="#ff4b4b" size={20} />
          ) : (
            <BiMessageRounded size={20} />
          )}
        </td>

        <td style={eventIdStyle}>{a.id}</td>
        <td style={tdStyle}>{a.time}</td>

        <td style={tdStyle}>
          <span style={a.isAlert ? yesBadge : noBadge}>
            {a.isAlert ? "YES" : "NO"}
          </span>
        </td>

        <td style={{ ...tdStyle, textAlign: "center" }}>
          <PiInfoBold size={18} />
        </td>

        <td>
          <IoIosArrowDown
            className="cursor-pointer"
            style={arrowStyle(index)}
            onClick={() =>
              setRotateArrow(rotateArrow === index ? null : index)
            }
            size={20}
          />
        </td>
      </tr>

    </>
  );
}
