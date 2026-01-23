import { AlertCategory } from "../enums/AlertCategory";
import { KpiSnapshot } from "../models/KpiSnapshot";
import { KpiSnapshotCategoryCount } from "../models/KpiSnapshotCategoryCount";

export interface IKpiRepositoryService {
  upsertSnapshot(snapshot: KpiSnapshot): Promise<number>;
  replaceCategoryCounts(snapshotId: number, categoryCounts: Partial<Record<AlertCategory, number>>): Promise<boolean>;
  getSnapshots(from: Date, to: Date): Promise<KpiSnapshot[]>;
  getCategoryCounts(from: Date, to: Date): Promise<KpiSnapshotCategoryCount[]>;
}
