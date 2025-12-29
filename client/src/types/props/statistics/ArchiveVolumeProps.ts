import { ArchiveVolumeDTO } from "../../../models/storage/ArchiveVolumeDTO";

export interface ArchiveVolumeProps  {
    data: ArchiveVolumeDTO[];
    period: "daily" | "monthly" | "yearly";
    onPeriodChange: (period: "daily" | "monthly" | "yearly") => void;
};