import { AlertSeverity } from "../../enums/AlertSeverity";
import { PiWarningOctagonFill, PiInfoBold } from "react-icons/pi";
import { BiMessageRounded } from "react-icons/bi";
import { getSeverityColor, getStatusColor } from "../../helpers/alertColorHelpers";
import { RecentAlertsTableProps } from "../../types/props/alerts/RecentAlertsTableProps";


export default function RecentAlertsTable({
  alerts,
  onSelectAlert,
}: RecentAlertsTableProps) {

  return (
    <div className="bg-[#1f1f1f] rounded-[14px] overflow-hidden shadow-md border border-[#333]">
      <table className="w-full border-collapse font-sans text-[14px]">
        <thead className="bg-[#2a2a2a]">
          <tr>
            <th className="px-4 py-3 text-left text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]"></th>
            <th className="px-4! py-3! text-left text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Title</th>
            <th className="px-4! py-3! text-left text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Severity</th>
            <th className="px-4! py-3! text-left text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Status</th>
            <th className="px-4! py-3! text-left text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Source</th>
            <th className="px-4! py-3! text-left text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Created At</th>
            <th className="px-4! py-3! text-left text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {alerts.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-10 py-10 text-center border-b border-[#2d2d2d] text-[#a6a6a6]">
                No alerts found
              </td>
            </tr>
          ) : (
            alerts.map((alert) => (
              <tr
                key={alert.id}
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a2a"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  {alert.severity === AlertSeverity.CRITICAL || alert.severity === AlertSeverity.HIGH ? (
                    <PiWarningOctagonFill color={getSeverityColor(alert.severity)} size={20} />
                  ) : (
                    <BiMessageRounded color={getSeverityColor(alert.severity)} size={20} />
                  )}
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc] max-w-[300px] overflow-hidden overflow-ellipsis shitespace-nowrap">
                  {alert.title}
                </td>

                <td className="px-4 py-3 border-b border-[#2d2d2d]">
                  <span
                    className="px-2.5! py-1.5! rounded-[8px] text-[12px] font-semibold inline-block border ml-3!"
                    style={{
                      backgroundColor: `${getSeverityColor(alert.severity)}22`,
                      color: getSeverityColor(alert.severity),
                      borderColor: `${getSeverityColor(alert.severity)}44`,
                    }}
                  >
                    {alert.severity}
                  </span>
                </td>

                <td className="px-4 py-3 border-b border-[#2d2d2d]">
                  <span
                    className="px-2.5! py-1.5! rounded-[8px] text-[12px] font-semibold inline-block border ml-3!"
                    style={{
                      backgroundColor: `${getStatusColor(alert.status)}22`,
                      color: getStatusColor(alert.status),
                      borderColor: `${getStatusColor(alert.status)}44`,
                    }}
                  >
                    {alert.status}
                  </span>
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">{alert.source}</td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc]">
                  {new Date(alert.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>

                <td className="px-4! py-3! border-b border-[#2d2d2d] text-[#dcdcdc] text-center">
                  <button
                    onClick={() => onSelectAlert(alert.id)}
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