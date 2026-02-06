import RiskLevelBadge from "../../insider-threat/RiskLevelBadge";
import { PiUserFill } from "react-icons/pi";
import { UserRiskTableProps } from "../../../types/props/insider-threat/UserRiskTableProps";

const getRiskScoreColor = (score: number): string => {
  if (score >= 100) return "#DC2626";
  if (score >= 60) return "#EA580C";
  if (score >= 30) return "#F59E0B";
  return "#10B981";
};

export default function UserRiskTable({ profiles, onSelectUser }: UserRiskTableProps) {
  return (
    <div className="bg-[#1f1f1f] rounded-[14px] overflow-hidden shadow-md border border-[#333]">
      <table className="w-full border-collapse text-center font-sans text-[14px]">
        <thead className="bg-[#2a2a2a]">
          <tr>
            <th className="px-4 py-3 text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">User ID</th>
            <th className="px-4 py-3 text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Risk Score</th>
            <th className="px-4 py-3 text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Risk Level</th>
            <th className="px-4 py-3 text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Total Threats</th>
            <th className="px-4 py-3 text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Critical</th>
            <th className="px-4 py-3 text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">High</th>
            <th className="px-4 py-3 text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Last Activity</th>
            <th className="px-4 py-3 text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {profiles.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-10 py-10 text-center border-b border-[#2d2d2d] text-[#a6a6a6]">
                No user risk profiles available
              </td>
            </tr>
          ) : (
            profiles.map((profile) => (
              <tr
                key={profile.userId}
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  <div className="flex items-center gap-2 justify-center">
                    <PiUserFill size={16} />
                    <div className="font-semibold text-[16px]">{profile.userId}</div>
                  </div>
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d]">
                  <div
                    className="font-bold text-[18px]"
                    style={{ color: getRiskScoreColor(profile.riskScore) }}
                  >
                    {profile.riskScore}
                  </div>
                </td>

                <td className="px-4 py-3 border-b border-[#2d2d2d]">
                  <RiskLevelBadge level={profile.currentRiskLevel} />
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  {profile.totalThreatsDetected}
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  <span className="font-semibold text-[#DC2626]">{profile.criticalThreatsCount}</span>
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  <span className="font-semibold text-[#EA580C]">{profile.highThreatsCount}</span>
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  {profile.lastThreatDetectedAt
                    ? new Date(profile.lastThreatDetectedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "No activity"}
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-center">
                  <button
                    onClick={() => onSelectUser(profile.userId)}
                    className="bg-transparent border! border-blue-400 text-blue-400 px-3! py-1.5! rounded-[6px]! cursor-pointer text-[12px]! font-semibold transition-all duration-200"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#60a5fa22";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    View Analysis
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