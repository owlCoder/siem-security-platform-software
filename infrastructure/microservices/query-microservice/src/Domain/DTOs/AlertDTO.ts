import { AlertSeverity } from "../enums/AlertSeverity";
import { AlertStatus } from "../enums/AlertStatus";

export interface AlertDTO {
  id: number;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  correlatedEvents: number[];
  source: string;
  createdAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  ipAddress?: string;
  userId?: number;
  userRole?: string;
}