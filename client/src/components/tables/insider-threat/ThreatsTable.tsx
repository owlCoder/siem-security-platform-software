import { PiWarningOctagonFill, PiShieldWarningFill, PiInfoBold } from "react-icons/pi";
import RiskLevelBadge from "../../insider-threat/RiskLevelBadge";
import { ThreatsTableProps } from "../../../types/props/insider-threat/ThreatsTableProps";

const getThreatTypeColor = (type: string): string => {
  switch (type) {
    case "MASS_DATA_READ": return "#3B82F6";
    case "PERMISSION_CHANGE": return "#F59E0B";
    case "OFF_HOURS_ACCESS": return "#8B5CF6";
    case "SUSPICIOUS_LOGIN": return "#DC2626";
    case "DATA_EXFILTRATION": return "#EF4444";
    default: return "#6B7280";
  }
};

const getThreatIcon = (type: string) => {
  switch (type) {
    case "SUSPICIOUS_LOGIN":
    case "DATA_EXFILTRATION":
      return <PiWarningOctagonFill size={20} color={getThreatTypeColor(type)} />;
    default:
      return <PiShieldWarningFill size={20} color={getThreatTypeColor(type)} />;
  }
};

export default function ThreatsTable({ threats, onSelectThreat }: ThreatsTableProps) {
  return (
    <div className="bg-[#1f1f1f] rounded-[14px] overflow-hidden shadow-md border border-[#333]">
      <table className="w-full border-collapse text-center font-sans text-[14px]">
        <thead className="bg-[#2a2a2a]">
          <tr>
            <th className="px-4 py-3 text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]"></th>
            <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">User ID</th>
            <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Threat Type</th>
            <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Risk Level</th>
            <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Description</th>
            <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Detected At</th>
            <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Status</th>
            <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {threats.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-10 py-10 text-center border-b border-[#2d2d2d] text-[#a6a6a6]">
                No insider threats detected
              </td>
            </tr>
          ) : (
            threats.map((threat) => (
              <tr
                key={threat.id}
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  {getThreatIcon(threat.threatType)}
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  <div className="font-semibold text-[16px]">{threat.userId}</div>
                </td>

                <td className="px-4 py-3 border-b border-[#2d2d2d]">
                  <span
                    className="px-2.5! py-1.5! rounded-[8px] text-[11px] font-semibold inline-block border ml-3!"
                    style={{
                      backgroundColor: `${getThreatTypeColor(threat.threatType)}22`,
                      color: getThreatTypeColor(threat.threatType),
                      borderColor: `${getThreatTypeColor(threat.threatType)}44`,
                    }}
                  >
                    {threat.threatType.replace(/_/g, " ")}
                  </span>
                </td>

                <td className="px-4 py-3 border-b border-[#2d2d2d]">
                  <RiskLevelBadge level={threat.riskLevel} />
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc] max-w-[300px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {threat.description}
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  {new Date(threat.detectedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td className="px-4 py-3 border-b border-[#2d2d2d]">
                  {threat.isResolved ? (
                    <span className="px-2.5! py-1.5! rounded-[8px]! text-[11px] font-semibold inline-block border bg-[#10B98122] text-[#10B981] border-[#10B98144] ml-3!">
                      RESOLVED
                    </span>
                  ) : (
                    <span className="px-2.5! py-1.5! rounded-[8px]! text-[11px] font-semibold inline-block border bg-[#F5970922] text-[#F59E0B] border-[#F5970944] ml-3!">
                      ACTIVE
                    </span>
                  )}
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc] text-center">
                  <button
                    onClick={() => onSelectThreat(threat.id)}
                    className="bg-transparent border! border-blue-400 text-blue-400 px-3! py-1.5! rounded-[6px]! cursor-pointer text-[12px]! font-semibold transition-all duration-200"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#60a5fa22";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <PiInfoBold size={14} className="mr-1 align-middle" />
                    Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}