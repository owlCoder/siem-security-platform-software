import React from "react";
import { AlertDTO } from "../../models/alerts/AlertDTO";
import { AlertSeverity } from "../../enums/AlertSeverity";
import { AlertStatus } from "../../enums/AlertStatus";
import { PiWarningOctagonFill, PiInfoBold } from "react-icons/pi";
import { BiMessageRounded } from "react-icons/bi";

interface RecentAlertsTableProps {
  alerts: AlertDTO[];
  onSelectAlert: (id: number) => void;
  onResolve: (id: number, resolvedBy: string) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

export default function RecentAlertsTable({ 
  alerts, 
  onSelectAlert,
}: RecentAlertsTableProps) {
  
  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return "#ff4b4b";
      case AlertSeverity.HIGH: return "#ffa500";
      case AlertSeverity.MEDIUM: return "#ffd700";
      case AlertSeverity.LOW: return "#4ade80";
      default: return "#60a5fa";
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE: return "#ffa500";
      case AlertStatus.INVESTIGATING: return "#60a5fa";
      case AlertStatus.RESOLVED: return "#4ade80";
      case AlertStatus.DISMISSED: return "#a6a6a6";
      case AlertStatus.ESCALATED: return "#ff4b4b";
      default: return "#60a5fa";
    }
  };

  const containerStyle: React.CSSProperties = {
    background: "#1f1f1f",
    borderRadius: "14px 14px 0 0",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
    border: "1px solid #333",
    borderBottom: "none",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "Segoe UI, sans-serif",
    fontSize: "14px",
  };

  const theadStyle: React.CSSProperties = {
    background: "#2a2a2a",
  };

  const thStyle: React.CSSProperties = {
    padding: "14px 16px",
    textAlign: "left",
    color: "#d0d0d0",
    fontWeight: 600,
    fontSize: "13px",
    borderBottom: "1px solid #3a3a3a",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    borderBottom: "1px solid #2d2d2d",
    color: "#dcdcdc",
  };

  const rowStyle: React.CSSProperties = {
    cursor: "pointer",
    transition: "background 0.2s",
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
    background: `${color}22`,
    color: color,
    border: `1px solid ${color}44`,
  });

  return (
    <div style={containerStyle}>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}></th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Severity</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Source</th>
            <th style={thStyle}>Created At</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {alerts.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: "40px", color: "#a6a6a6" }}>
                No alerts found
              </td>
            </tr>
          ) : (
            alerts.map((alert) => (
              <tr 
                key={alert.id} 
                style={rowStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a2a"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={tdStyle}>
                  {alert.severity === AlertSeverity.CRITICAL || alert.severity === AlertSeverity.HIGH ? (
                    <PiWarningOctagonFill color={getSeverityColor(alert.severity)} size={20} />
                  ) : (
                    <BiMessageRounded color={getSeverityColor(alert.severity)} size={20} />
                  )}
                </td>

                <td style={{ ...tdStyle, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {alert.title}
                </td>

                <td style={tdStyle}>
                  <span style={badgeStyle(getSeverityColor(alert.severity))}>
                    {alert.severity}
                  </span>
                </td>

                <td style={tdStyle}>
                  <span style={badgeStyle(getStatusColor(alert.status))}>
                    {alert.status}
                  </span>
                </td>

                <td style={tdStyle}>{alert.source}</td>

                <td style={tdStyle}>
                  {new Date(alert.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>

                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <button
                    onClick={() => onSelectAlert(alert.id)}
                    style={{
                      background: "transparent",
                      border: "1px solid #60a5fa",
                      color: "#60a5fa",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#60a5fa22";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <PiInfoBold size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
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