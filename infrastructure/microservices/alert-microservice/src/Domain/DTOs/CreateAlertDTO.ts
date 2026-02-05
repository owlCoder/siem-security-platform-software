import { AlertCategory } from "../enums/AlertCategory";
import { AlertSeverity } from "../enums/AlertSeverity";

export interface CreateAlertDTO {
  title: string;
  description: string;
  severity: AlertSeverity;
  correlatedEvents: number[];
  source: string;
  detectionRule?: string; 
  ipAddress?: string;
  category: AlertCategory;
  oldestEventTimestamp: Date;
  userId?: number;    
  userRole?: string;
}