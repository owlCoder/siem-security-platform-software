import { AlertCategory } from "../../Domain/enums/AlertCategory";
import { MaturityLevel } from "../../Domain/enums/MaturityLevel";
import { TrendMetricType } from "../../Domain/enums/TrendMetricType";
import { TrendPeriod } from "../../Domain/enums/TrendPeriod";
import { KpiSnapshot } from "../../Domain/models/KpiSnapshot";
import { IKpiAggregationService } from "../../Domain/services/IKpiAggregationService";
import { IKpiRepositoryService } from "../../Domain/services/IKpiRepositoryService";
import { IncidentsByCategoryDto } from "../../Domain/types/IncidentsByCategoryDto";
import { KpiSummaryDto } from "../../Domain/types/KpiSummaryDto";
import { TrendPointDto } from "../../Domain/types/TrendPointDto";
import { parseAlertCategory } from "../../Domain/parsers/parseAlertCategory";
import { mapScoreToLevel } from "../../Utils/MapScoreToLevel";
import { NOT_FOUND } from "../../Domain/constants/Sentinels";
import { IKpiSnapshotQuery } from "../contracts/IKpiSnapshotQuery";

export class KpiSnapshotQuery implements IKpiSnapshotQuery {
  private readonly kpiRepository: IKpiRepositoryService;
  private readonly kpiAggregation: IKpiAggregationService;

  constructor(repoService: IKpiRepositoryService, aggregationService: IKpiAggregationService) {
    this.kpiRepository = repoService;
    this.kpiAggregation = aggregationService;
  }

  async getCurrent(): Promise<KpiSummaryDto> {
    const now = new Date();
    const to = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      0, 0, 0
    ));

    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

    const snapshots = await this.kpiRepository.getSnapshots(from, to);

    let totalAlerts = 0;
    let resolvedAlerts = 0;
    let openAlerts = 0;
    let falseAlarms = 0;

    for (const s of snapshots) {
      totalAlerts += s.totalAlerts;
      resolvedAlerts += s.resolvedAlerts;
      openAlerts += s.openAlerts;
      falseAlarms += s.falseAlarms;
    }

    const falseAlarmRate = totalAlerts === 0 ? NOT_FOUND : falseAlarms / totalAlerts;

    const mttdMinutes = this.kpiAggregation.weightedAverageMetric(snapshots, TrendMetricType.MTTD);
    const mttrMinutes = this.kpiAggregation.weightedAverageMetric(snapshots, TrendMetricType.MTTR);
    const scoreValue = this.kpiAggregation.weightedAverageMetric(snapshots, TrendMetricType.SMS);

    const maturityLevel =
      scoreValue === NOT_FOUND ? MaturityLevel.UNKNOWN : mapScoreToLevel(scoreValue);

    const rawCounts = await this.kpiRepository.getCategoryCounts(from, to);
    const categoryCounts: Partial<Record<AlertCategory, number>> = {};

    for (const c of rawCounts) {
      const cat = parseAlertCategory(c.category);
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + c.count;
    }

    return {
      mttdMinutes,
      mttrMinutes,
      falseAlarmRate,
      totalAlerts,
      resolvedAlerts,
      openAlerts,
      categoryCounts,
      scoreValue,
      maturityLevel,
    };
  }

  async getIncidentsByCategory(period: TrendPeriod): Promise<IncidentsByCategoryDto[]> {
    const { from, to } = this.resolvePeriod(period);
    const counts = await this.kpiRepository.getCategoryCounts(from, to);

    const aggregated: Partial<Record<AlertCategory, number>> = {};

    for (const c of counts) {
      const category = parseAlertCategory(c.category);
      aggregated[category] = (aggregated[category] ?? 0) + c.count;
    }

    return (Object.entries(aggregated) as Array<[AlertCategory, number]>)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getTrend(metric: TrendMetricType, period: TrendPeriod): Promise<TrendPointDto[]> {
    const { from, to, bucket } = this.resolvePeriod(period);
    const snapshots = await this.kpiRepository.getSnapshots(from, to);

    if (bucket === "hour") {
      const result: TrendPointDto[] = [];

      for (const s of snapshots) {
        result.push({
          bucketStart: s.windowFrom.toISOString(),
          value: this.kpiAggregation.resolveMetricValue(s, metric),
          sampleCount: this.kpiAggregation.sumSampleCount([s], metric),
        });
      }

      return result;
    }

    const grouped: Record<string, KpiSnapshot[]> = {};

    for (const s of snapshots) {
      const dayKey = s.windowFrom.toISOString().slice(0, 10);
      (grouped[dayKey] ??= []).push(s);
    }

    const result: TrendPointDto[] = [];

    for (const day of Object.keys(grouped).sort()) {
      const items = grouped[day];

      result.push({
        bucketStart: `${day}T00:00:00.000Z`,
        value: this.kpiAggregation.weightedAverageMetric(items, metric),
        sampleCount: this.kpiAggregation.sumSampleCount(items, metric),
      });
    }

    return result;
  }

  private resolvePeriod(period: TrendPeriod) {
    const now = new Date();

    const toHour = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      0, 0, 0
    ));

    if (period === TrendPeriod.D7) {
      const toDay = new Date(Date.UTC(
        toHour.getUTCFullYear(),
        toHour.getUTCMonth(),
        toHour.getUTCDate(),
        0, 0, 0, 0
      ));

      return {
        from: new Date(toDay.getTime() - 7 * 24 * 60 * 60 * 1000),
        to: toDay,
        bucket: "day" as const,
      };
    }

    return {
      from: new Date(toHour.getTime() - 24 * 60 * 60 * 1000),
      to: toHour,
      bucket: "hour" as const,
    };
  }
}
