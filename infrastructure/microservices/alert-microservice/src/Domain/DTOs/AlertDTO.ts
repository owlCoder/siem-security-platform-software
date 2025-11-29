import { AlertSeverity } from "../enums/AlertSeverity";
import { AlertStatus } from "../enums/AlertStatus";

// Za vraćanje alerta (GET)
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
}

// Za kreiranje alerta (POST)
export interface CreateAlertDTO {
  title: string;
  description: string;
  severity: AlertSeverity;
  correlatedEvents: number[];
  source: string;
}

// Za rješavanje alerta (PUT)
export interface ResolveAlertDTO {
  resolvedBy: string;
  status: AlertStatus;
}