import { AlertCategory } from "../enums/AlertCategory";
import { MaturityLevel } from "../enums/MaturityLevel";

export type ComputedKpi = {
  mttdMinutes: number | null;
  mttrMinutes: number | null;
  mttdSampleCount: number;
  mttrSampleCount: number;

  totalAlerts: number;
  resolvedAlerts: number;
  openAlerts: number;

  falseAlarms: number;
  falseAlarmRate: number;

  scoreValue: number;
  maturityLevel: MaturityLevel;

  categoryCounts: Partial<Record<AlertCategory, number>>;
};