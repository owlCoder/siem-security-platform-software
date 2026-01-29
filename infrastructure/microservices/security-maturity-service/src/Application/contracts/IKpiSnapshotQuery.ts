import { TrendMetricType } from "../../Domain/enums/TrendMetricType";
import { TrendPeriod } from "../../Domain/enums/TrendPeriod";
import { IncidentsByCategoryDto } from "../../Domain/types/IncidentsByCategoryDto";
import { KpiSummaryDto } from "../../Domain/types/KpiSummaryDto";
import { TrendPointDto } from "../../Domain/types/TrendPointDto";

export interface IKpiSnapshotQuery {
  getCurrent(): Promise<KpiSummaryDto>;

  getIncidentsByCategory(
    period: TrendPeriod
  ): Promise<IncidentsByCategoryDto[]>;

  getTrend(
    metric: TrendMetricType,
    period: TrendPeriod
  ): Promise<TrendPointDto[]>;
}
