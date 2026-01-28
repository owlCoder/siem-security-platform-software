import { AlertCategory } from "../enums/AlertCategory";
import { MaturityLevel } from "../enums/MaturityLevel";

export interface SecuirtyMaturityCurrentDTO {
  mttdMinutes: number;
  mttrMinutes: number;
  falseAlarmRate: number;
  totalAlerts: number;
  resolvedAlerts: number;
  openAlerts: number;
  categoryCounts: Partial<Record<AlertCategory, number>>;
  scoreValue: number;
  maturityLevel: MaturityLevel;
}
