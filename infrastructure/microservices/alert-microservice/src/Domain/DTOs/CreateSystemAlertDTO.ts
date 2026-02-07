import { AlertCategory } from "../enums/AlertCategory";
import { AlertSeverity } from "../enums/AlertSeverity";

export interface CreateSystemAlertDTO {
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  source: string;
}