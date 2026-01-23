import { TrendMetricType } from "../../Domain/enums/TrendMetricType";
import { TrendPeriod } from "../../Domain/enums/TrendPeriod";
import { KpiSnapshot } from "../../Domain/models/KpiSnapshot";
import { IKpiRepositoryService } from "../../Domain/services/IKpiRepositoryService";
import { IncidentsByCategoryDto } from "../../Domain/types/IncidentsByCategoryDto";
import { KpiSummaryDto } from "../../Domain/types/KpiSummaryDto";
import { TrendPointDto } from "../../Domain/types/TrendPointDto";

export class KpiSnapshotQuery {
  constructor(private readonly kpiRepository: IKpiRepositoryService) {}

  async getCurrent(): Promise<KpiSummaryDto> {
    const now = new Date();
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const snapshots = await this.kpiRepository.getSnapshots(from, now);
    const latest = snapshots.at(-1);

    if (!latest) {
      return {
        mttdMinutes: null,
        mttrMinutes: null,
        falseAlarmRate: null,
        totalAlerts: 0,
        resolvedAlerts: 0,
        openAlerts: 0,
        categoryCounts: {},
        scoreValue: null,
        maturityLevel: null,
      };
    }

    return {
      mttdMinutes: latest.mttdMinutes,
      mttrMinutes: latest.mttrMinutes,
      falseAlarmRate: latest.falseAlarmRate,
      totalAlerts: latest.totalAlerts,
      resolvedAlerts: latest.resolvedAlerts,
      openAlerts: latest.openAlerts,
      categoryCounts: {},
      scoreValue: latest.scoreValue,
      maturityLevel: latest.maturityLevel,
    };
  }

  async getIncidentsByCategory(
    period: TrendPeriod,
  ): Promise<IncidentsByCategoryDto[]> {
    const { from, to } = this.resolvePeriod(period);
    const counts = await this.kpiRepository.getCategoryCounts(from, to);

    const aggregated: Record<string, number> = {};

    for (const c of counts) {
      aggregated[c.category] = (aggregated[c.category] ?? 0) + c.count;
    }

    const result: IncidentsByCategoryDto[] = [];

    for (const category in aggregated) {
      result.push({
        category,
        count: aggregated[category],
      });
    }

    return result;
  }

  async getTrend(
    metric: TrendMetricType,
    period: TrendPeriod,
  ): Promise<TrendPointDto[]> {
    const { from, to, bucket } = this.resolvePeriod(period);
    const snapshots = await this.kpiRepository.getSnapshots(from, to);

    // po satu
    if (bucket === "hour") {
      const result: TrendPointDto[] = [];

      for (const s of snapshots) {
        result.push({
          bucketStart: s.windowFrom.toISOString(),
          value: this.resolveMetricValue(s, metric),
          sampleCount: s.mttdSampleCount,
        });
      }

      return result;
    }

    // po danu
    const grouped: Record<string, KpiSnapshot[]> = {};

    for (const s of snapshots) {
      const dayKey = s.windowFrom.toISOString().slice(0, 10);

      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }

      grouped[dayKey].push(s);
    }

    const result: TrendPointDto[] = [];

    for (const day in grouped) {
      const items = grouped[day];

      result.push({
        bucketStart: `${day}T00:00:00.000Z`,
        value: this.averageMetric(items, metric),
        sampleCount: items.length,
      });
    }

    return result;
  }

  private resolveMetricValue(
    snapshot: any,
    metric: TrendMetricType,
  ): number | null {
    switch (metric) {
      case TrendMetricType.SMS:
        return snapshot.scoreValue;
      case TrendMetricType.MTTD:
        return snapshot.mttdMinutes;
      case TrendMetricType.MTTR:
        return snapshot.mttrMinutes;
      case TrendMetricType.FALSE_ALARM_RATE:
        return snapshot.falseAlarmRate;
      default:
        return null;
    }
  }

  private averageMetric(
    snapshots: KpiSnapshot[],
    metric: TrendMetricType,
  ): number | null {
    let sum = 0;
    let count = 0;

    for (const s of snapshots) {
      const value = this.resolveMetricValue(s, metric);
      if (value !== null) {
        sum += value;
        count++;
      }
    }

    if (count === 0) return null;

    return Math.round(sum / count);
  }

  private resolvePeriod(period: TrendPeriod) {
    const now = new Date();

    if (period === TrendPeriod.D7) {
      return {
        from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        to: now,
        bucket: "day" as const,
      };
    }

    return {
      from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      to: now,
      bucket: "hour" as const,
    };
  }
}
