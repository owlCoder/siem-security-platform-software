import { ArchiveStatsDTO } from "../models/storage/ArchiveStatsDTO";

export const emptyStats: ArchiveStatsDTO = {
    totalSize: 0,
    retentionHours: 72,
    lastArchiveName: "No archives"
};