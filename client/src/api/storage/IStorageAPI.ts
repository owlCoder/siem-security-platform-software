import { ArchiveDTO } from "../../models/storage/ArchiveDTO";
import { ArchiveStatsDTO } from "../../models/storage/ArchiveStatsDTO";
import { ArchiveVolumeDTO } from "../../models/storage/ArchiveVolumeDTO";
import { TopArchiveDTO } from "../../models/storage/TopArchiveDTO";

export interface IStorageAPI {
  getAllArchives(): Promise<ArchiveDTO[]>;
  searchArchives(query: string): Promise<ArchiveDTO[]>;
  sortArchives(
    by: "date" | "size" | "name",
    order: "asc" | "desc"
  ): Promise<ArchiveDTO[]>;
  getStats(): Promise<ArchiveStatsDTO>;
  downloadArchive(id: number): Promise<ArrayBuffer>;
  getTopArchives(
    type: "events" | "alerts",
    limit: number,
    token: string
  ): Promise<TopArchiveDTO[]>;
  getArchiveVolume(
    period: "daily" | "monthly" | "yearly",
    token: string
  ): Promise<ArchiveVolumeDTO[]>;
}
