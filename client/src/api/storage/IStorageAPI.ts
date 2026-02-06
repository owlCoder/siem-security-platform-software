import { StorageLogResponseDTO } from "../../models/storage/StorageLogResponseDTO";
import { ArchiveStatsDTO } from "../../models/storage/ArchiveStatsDTO";
import { ArchiveVolumeDTO } from "../../models/storage/ArchiveVolumeDTO";
import { LargestArchiveDTO } from "../../models/storage/LargestArchiveDTO";
import { TopArchiveDTO } from "../../models/storage/TopArchiveDTO";

export interface IStorageAPI {
  getAllArchives(token: string): Promise<StorageLogResponseDTO[]>;
  getStats(token: string): Promise<ArchiveStatsDTO>;
  downloadArchive(token: string, id: number): Promise<ArrayBuffer>;
  getTopArchives(token: string, type: "events" | "alerts", limit: number): Promise<TopArchiveDTO[]>;
  getArchiveVolume(token: string, period: "daily" | "monthly" | "yearly"): Promise<ArchiveVolumeDTO[]>;
  getLargestArchive(token: string): Promise<LargestArchiveDTO>;
}
