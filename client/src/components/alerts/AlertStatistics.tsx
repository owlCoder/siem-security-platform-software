import  { useMemo } from "react";
import { AlertStatus } from "../../enums/AlertStatus";
import { AlertSeverity } from "../../enums/AlertSeverity";
import AlertCard from "./AlertCard";
import { AlertStatisticsProps } from "../../types/props/alerts/AlertStatisticsProps";


export default function AlertStatistics ({alerts,lastAlertTime,}:AlertStatisticsProps)  {
  const statistics = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
    high: alerts.filter(a => a.severity === AlertSeverity.HIGH).length,
    active: alerts.filter(a => a.status === AlertStatus.ACTIVE).length,
    investigating: alerts.filter(a => a.status === AlertStatus.INVESTIGATING).length,
    resolved: alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
  }), [alerts]);

  return (
    <div className="mb-6">
      <div className="grid grid-cols-6 gap-3">
        <AlertCard measurementUnit={statistics.total} color="#60cdff" message="Total Alerts" />
        <AlertCard measurementUnit={statistics.critical} color="#ff4b4b" message="Critical" />
        <AlertCard measurementUnit={statistics.high} color="#ffa500" message="High Severity" />
        <AlertCard measurementUnit={statistics.active} color="#ffa500" message="Active" />
        <AlertCard measurementUnit={statistics.investigating} color="#60a5fa" message="Investigating" />
        <AlertCard measurementUnit={statistics.resolved} color="#4ade80" message="Resolved" />
      </div>

      <div className="flex justify-end items-center gap-2 mt-3 text-xs text-gray-400">
        <span>Last Alert Received:</span>
        <span className="font-semibold text-[#60cdff]">{lastAlertTime}</span>
      </div>
    </div>
  );
};
