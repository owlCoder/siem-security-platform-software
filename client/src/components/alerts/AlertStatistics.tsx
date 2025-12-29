import React, { useMemo } from "react";
import { AlertDTO } from "../../models/alerts/AlertDTO";
import { AlertStatus } from "../../enums/AlertStatus";
import { AlertSeverity } from "../../enums/AlertSeverity";
import AlertCard from "./AlertCard";

interface AlertStatisticsProps {
  alerts: AlertDTO[];
  lastAlertTime: string;
}

export const AlertStatistics: React.FC<AlertStatisticsProps> = ({
  alerts,
  lastAlertTime,
}) => {
  // Calculate statistics
  const statistics = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === AlertSeverity.CRITICAL)
        .length,
      high: alerts.filter((a) => a.severity === AlertSeverity.HIGH).length,
      active: alerts.filter((a) => a.status === AlertStatus.ACTIVE).length,
      investigating: alerts.filter(
        (a) => a.status === AlertStatus.INVESTIGATING
      ).length,
      resolved: alerts.filter((a) => a.status === AlertStatus.RESOLVED).length,
    };
  }, [alerts]);

  const containerStyle: React.CSSProperties = {
    marginBottom: "24px",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "12px",
  };

  const footerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "12px",
    fontSize: "12px",
    color: "#a6a6a6",
  };

  const lastAlertStyle: React.CSSProperties = {
    fontWeight: 600,
    color: "#60cdff",
  };

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <AlertCard
          measurementUnit={statistics.total}
          color="#60cdff"
          message="Total Alerts"
        />
        <AlertCard
          measurementUnit={statistics.critical}
          color="#ff4b4b"
          message="Critical"
        />
        <AlertCard
          measurementUnit={statistics.high}
          color="#ffa500"
          message="High Severity"
        />
        <AlertCard
          measurementUnit={statistics.active}
          color="#ffa500"
          message="Active"
        />
        <AlertCard
          measurementUnit={statistics.investigating}
          color="#60a5fa"
          message="Investigating"
        />
        <AlertCard
          measurementUnit={statistics.resolved}
          color="#4ade80"
          message="Resolved"
        />
      </div>

      <div style={footerStyle}>
        <span>Last Alert Received:</span>
        <span style={lastAlertStyle}>{lastAlertTime}</span>
      </div>
    </div>
  );
};