import { AlertCategory } from "../enums/AlertCategory";

export type AlertForKpi = {
  id: number;
  createdAt: Date;
  resolvedAt: Date | null;
  oldestCorrelatedEventAt: Date;
  category: AlertCategory;
  isFalseAlarm: boolean;
};
