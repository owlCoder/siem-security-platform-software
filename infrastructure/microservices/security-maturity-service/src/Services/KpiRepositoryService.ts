import { Repository } from "typeorm";
import { IKpiRepositoryService } from "../Domain/services/IKpiRepositoryService";
import { KpiSnapshot } from "../Domain/models/KpiSnapshot";
import { KpiSnapshotCategoryCount } from "../Domain/models/KpiSnapshotCategoryCount";
import { Db } from "../Database/DBConnectionPool";
import { AlertCategory } from "../Domain/enums/AlertCategory";


export class KpiRepositoryService implements IKpiRepositoryService {
  private readonly snapshotRepo: Repository<KpiSnapshot>;
  private readonly categoryRepo: Repository<KpiSnapshotCategoryCount>;

  public constructor() {
    this.snapshotRepo = Db.getRepository(KpiSnapshot);
    this.categoryRepo = Db.getRepository(KpiSnapshotCategoryCount);
  }

  public async upsertSnapshot(snapshot: KpiSnapshot): Promise<number> {
    try {
        //upsert based on windowFrom + windowTo to avoid duplicates
      await this.snapshotRepo.upsert(
        {
          windowFrom: snapshot.windowFrom,
          windowTo: snapshot.windowTo,

          mttdMinutes: snapshot.mttdMinutes,
          mttrMinutes: snapshot.mttrMinutes,

          mttdSampleCount: snapshot.mttdSampleCount,
          mttrSampleCount: snapshot.mttrSampleCount,

          totalAlerts: snapshot.totalAlerts,
          resolvedAlerts: snapshot.resolvedAlerts,
          openAlerts: snapshot.openAlerts,

          falseAlarms: snapshot.falseAlarms,
          falseAlarmRate: snapshot.falseAlarmRate,

          scoreValue: snapshot.scoreValue,
          maturityLevel: snapshot.maturityLevel,
        },
        ["windowFrom", "windowTo"]
      );
    } catch (e) {
      console.log("[KpiRepository] Failed to upsert KpiSnapshot.", e);
      return -1;
    }

    try {
      const saved = await this.snapshotRepo.findOne({
        where: { windowFrom: snapshot.windowFrom, windowTo: snapshot.windowTo },
      });

      if (!saved) {
        console.log("[KpiRepository] Snapshot not found after upsert.");
        return -1;
      }

      return saved.id;
    } catch (e) {
      console.log("[KpiRepository] Failed to reload KpiSnapshot after upsert.", e);
      return -1;
    }
  }

  public async replaceCategoryCounts(
    snapshotId: number,
    categoryCounts: Partial<Record<AlertCategory, number>>
  ): Promise<boolean> {
    try {
      await this.categoryRepo.delete({ snapshotId });
    } catch (e) {
      console.log("[KpiRepository] Failed to delete old category rows.", e);
      return false;
    }

    const rows = Object.entries(categoryCounts).map(([category, count]) => {
      const row = new KpiSnapshotCategoryCount();
      row.snapshotId = snapshotId;
      row.category = category as AlertCategory;
      row.count = count as number;
      return row;
    });

    if (rows.length === 0) return true;

    try {
      await this.categoryRepo.save(rows);
      return true;
    } catch (e) {
      console.log("[KpiRepository] Failed to save category rows.", e);
      return false;
    }
  }

  public async getSnapshots(from: Date, to: Date): Promise<KpiSnapshot[]> {
    try {
      return await this.snapshotRepo
        .createQueryBuilder("s")
        .where("s.windowFrom >= :from", { from })
        .andWhere("s.windowTo < :to", { to })
        .orderBy("s.windowFrom", "ASC")
        .getMany();
    } catch (e) {
      console.log("[KpiRepository] Failed to read snapshots.", e);
      return [];
    }
  }

  public async getCategoryCounts(from: Date, to: Date): Promise<KpiSnapshotCategoryCount[]> {
    try {
      // Join to snapshots to filter by time window without needing a list of IDs first.
      return await this.categoryRepo
        .createQueryBuilder("c")
        .innerJoin(KpiSnapshot, "s", "s.id = c.snapshotId")
        .where("s.windowFrom >= :from", { from })
        .andWhere("s.windowTo < :to", { to })
        .getMany();
    } catch (e) {
      console.log("[KpiRepository] Failed to read category counts.", e);
      return [];
    }
  }
}
