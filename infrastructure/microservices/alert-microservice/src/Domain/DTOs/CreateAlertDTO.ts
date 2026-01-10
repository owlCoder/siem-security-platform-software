import { AlertSeverity } from "../enums/AlertSeverity";

export interface CreateAlertDTO {
  title: string;
  description: string;
  severity: AlertSeverity;
  correlatedEvents: number[];
  source: string;
  detectionRule?: string; 
}