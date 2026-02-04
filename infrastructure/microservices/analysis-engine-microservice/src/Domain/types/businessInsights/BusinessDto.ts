import { ActivityMetricsDto } from "./ActivityMetricsDto";
import { ProjectFinancialMetricsDto } from "./ProjectFinancialMetricsDto";
import { ProjectPerformanceMetricsDto } from "./ProjectPerformanceMetricsDto";
import { TimeWindow } from "./TimeWindow";

export interface BusinessLLMInputDto {
  timeWindow: TimeWindow;
  activity: ActivityMetricsDto;
  projects_performance: ProjectPerformanceMetricsDto[];
  projects_financials: ProjectFinancialMetricsDto[];
}