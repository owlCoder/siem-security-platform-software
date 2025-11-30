import { AlertSeverity } from "../enums/AlertSeverity";

// DTO koji AnalysisEngine salje Alert servisu kada pronadje korelaciju
export interface CreateAlertFromCorrelationDTO {
  correlationId: number;
  description: string;
  severity: AlertSeverity;
  correlatedEventIds: number[];
}