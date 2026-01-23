import { AxiosInstance } from "axios";
import { IKpiSnapshotService } from "../Domain/services/IKpiSnapshotService";
import { IKpiRepositoryService } from "../Domain/services/IKpiRepositoryService";
import { AlertForKpi } from "../Domain/types/AlertForKpi";
import { ComputedKpi } from "../Domain/types/ComputedKpi";
import { KpiSnapshot } from "../Domain/models/KpiSnapshot";
import { createAxiosClient } from "../Infrastructure/helpers/createAxiosClient";
import { ISecurityMaturityService } from "../Domain/services/ISecurityMaturityService";
import { AlertServiceClient } from "../Infrastructure/clients/AlertServiceClient";
import { diffMinutesNonNegative, isValidDate } from "../Infrastructure/utils/dateUtils";
import { AlertCategory } from "../Domain/enums/AlertCategory";

export class KpiSnapshotService implements IKpiSnapshotService {
  private readonly repo: IKpiRepositoryService;
  private readonly alertClient: AxiosInstance;
  private readonly alertServiceClient: AlertServiceClient;
  private readonly SMSService: ISecurityMaturityService;

  public constructor(repo: IKpiRepositoryService, smsService: ISecurityMaturityService) {
    this.repo = repo;
    this.alertClient = createAxiosClient(process.env.ALERT_SERVICE_API ?? "");
    this.alertServiceClient = new AlertServiceClient(this.alertClient);
    this.SMSService = smsService;
  }

  public async createSnapshotForWindow(windowFrom: Date, windowTo: Date): Promise<void> {
    if (!this.isValidWindow(windowFrom, windowTo)) {
      console.log("[KpiSnapshotService] Invalid window; snapshot not created.");
      return;
    }

    const alerts = await this.safeFetchAlerts(windowFrom, windowTo);
    const computed = await this.calculateKpis(alerts);
    const snapshot = this.toSnapshotEntity(windowFrom, windowTo, computed);

    const snapshotId = await this.repo.upsertSnapshot(snapshot);
    if (snapshotId === -1) {
      console.log("[KpiSnapshotService] Snapshot upsert failed; categories not written.");
      return;
    }

    const ok = await this.repo.replaceCategoryCounts(snapshotId, computed.categoryCounts);
    if (!ok) {
      console.log("[KpiSnapshotService] Failed to persist category counts.");
    }
  }

  private async calculateKpis(alerts: AlertForKpi[]): Promise<ComputedKpi> {
    const totalAlerts = alerts.length;

    let resolvedAlerts = 0;
    let mttdSum = 0;
    let mttdSampleCount = 0;
    let mttrSum = 0;
    let mttrSampleCount = 0;
    let falseAlarms = 0;

    const categoryCounts: Partial<Record<AlertCategory, number>> = {};

    for (const a of alerts) {
      const category = a.category;
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;

      if (a.isFalseAlarm) falseAlarms++;

      if (a.resolvedAt) {
        resolvedAlerts++;
        const mttrMin = diffMinutesNonNegative(a.resolvedAt, a.createdAt);
        if (mttrMin !== null) {
          mttrSum += mttrMin;
          mttrSampleCount++;
        }
      }

      const mttdMin = diffMinutesNonNegative(a.createdAt, a.oldestCorrelatedEventAt);
      if (mttdMin !== null) {
        mttdSum += mttdMin;
        mttdSampleCount++;
      }
    }

    const openAlerts = totalAlerts - resolvedAlerts;

    const mttdMinutes = mttdSampleCount > 0 ? mttdSum / mttdSampleCount : null;
    const mttrMinutes = mttrSampleCount > 0 ? mttrSum / mttrSampleCount : null;

    const falseAlarmRate = totalAlerts > 0 ? falseAlarms / totalAlerts : 0;

    const smsResult = await this.SMSService.calculateCurrentMaturity({
      mttdMinutes,
      mttrMinutes,
      falseAlarmRate,
      totalAlerts,
    });

    return {
      mttdMinutes,
      mttrMinutes,
      mttdSampleCount,
      mttrSampleCount,
      totalAlerts,
      resolvedAlerts,
      openAlerts,
      falseAlarms,
      falseAlarmRate,
      scoreValue: smsResult.scoreValue,
      maturityLevel: smsResult.maturityLevel,
      categoryCounts,
    };
  }

  private toSnapshotEntity(windowFrom: Date, windowTo: Date, computed: ComputedKpi): KpiSnapshot {
    const s = new KpiSnapshot();
    s.windowFrom = windowFrom;
    s.windowTo = windowTo;
    s.mttdMinutes = computed.mttdMinutes;
    s.mttrMinutes = computed.mttrMinutes;
    s.mttdSampleCount = computed.mttdSampleCount;
    s.mttrSampleCount = computed.mttrSampleCount;
    s.totalAlerts = computed.totalAlerts;
    s.resolvedAlerts = computed.resolvedAlerts;
    s.openAlerts = computed.openAlerts;
    s.falseAlarms = computed.falseAlarms;
    s.falseAlarmRate = computed.falseAlarmRate;
    s.scoreValue = computed.scoreValue;
    s.maturityLevel = computed.maturityLevel;
    return s;
  }

  private async safeFetchAlerts(from: Date, to: Date): Promise<AlertForKpi[]> {
    try {
      return await this.alertServiceClient.fetchAlerts(from, to);
    } catch (e) {
      console.log("[KpiSnapshotService] Failed to fetch alerts. Using empty set.", e);
      return [];
    }
  }

  private isValidWindow(windowFrom: Date, windowTo: Date): boolean {
    return isValidDate(windowFrom) && isValidDate(windowTo) && windowFrom.getTime() < windowTo.getTime();
  }
}
