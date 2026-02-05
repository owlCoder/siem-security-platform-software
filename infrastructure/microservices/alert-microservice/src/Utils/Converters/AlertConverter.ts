import { Alert } from "../../Domain/models/Alert";
import { AlertDTO } from "../../Domain/DTOs/AlertDTO";
import { AlertSeverity } from "../../Domain/enums/AlertSeverity";
import { AlertStatus } from "../../Domain/enums/AlertStatus";

export function toAlertDTO(alert: Alert): AlertDTO {
  return {
    id: alert.id,
    title: alert.title,
    description: alert.description,
    severity: alert.severity,
    status: alert.status,
    correlatedEvents: alert.correlatedEvents,
    source: alert.source,
    createdAt: alert.createdAt,
    resolvedAt: alert.resolvedAt,
    resolvedBy: alert.resolvedBy,
    ipAddress: alert.ipAddress,
    userId: alert.userId,
    userRole: alert.userRole
  };
}

export function createEmptyAlertDTO(): AlertDTO {
  return {
    id: -1,
    title: "",
    description: "",
    severity: AlertSeverity.LOW,
    status: AlertStatus.ACTIVE,
    correlatedEvents: [],
    source: "",
    createdAt: new Date(),
    resolvedAt: null,
    resolvedBy: null,
    ipAddress: undefined,
    userId: undefined,
    userRole: ""
  };
}