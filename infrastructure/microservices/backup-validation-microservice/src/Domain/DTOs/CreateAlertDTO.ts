import { AlertCategory } from "../enums/AlertCategory";
import { AlertSeverity } from "../enums/AlertSeverity";

export interface CreateAlertDTO {
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  source: string;
}