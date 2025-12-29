import React from "react";
import { AlertStatus } from "../../enums/AlertStatus";
import { AlertSeverity } from "../../enums/AlertSeverity";
import AlertCard from "./AlertCard";
import { AlertStatisticsProps } from "../../types/props/alerts/AlertStatisticsProps";


export const AlertStatistics: React.FC<AlertStatisticsProps> = ({ alerts, lastAlertTime }) => {
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length;
  const activeAlerts = alerts.filter(a => a.status === AlertStatus.ACTIVE).length;
  const resolvedAlerts = alerts.filter(a => a.status === AlertStatus.RESOLVED).length;

  return (
    <div className="grid grid-cols-5 gap-4 mb-6!">
      <AlertCard measurementUnit={totalAlerts} color={"#60cdff"} message="Total Alerts" />
      <AlertCard measurementUnit={criticalAlerts} color="#ff4b4b" message="Critical" />
      <AlertCard measurementUnit={activeAlerts} color="#ffa500" message="Active" />
      <AlertCard measurementUnit={resolvedAlerts} color="#4ade80" message="Resolved" />
      <AlertCard measurementUnit={lastAlertTime} color="#60cdff" message="Last Alert" />
    </div>
  );
};