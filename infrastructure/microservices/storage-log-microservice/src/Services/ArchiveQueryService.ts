import { Repository } from "typeorm";
import { IArchiveQueryService } from "../Domain/services/IArchiveQueryService";
import { StorageLog } from "../Domain/models/StorageLog";
import { ILogerService } from "../Domain/services/ILogerService";
import path from "path";
import { ARCHIVE_DIR } from "../Domain/constants/ArchiveConstants";
import { LargestArchiveDTO } from "../Domain/DTOs/LargestArchiveDTO";
import { ArchiveVolumeDTO } from "../Domain/DTOs/ArchiveVolumeDTO";
import { TopArchiveDTO } from "../Domain/DTOs/TopArchiveDTO";
import { ArchiveType } from "../Domain/enums/ArchiveType";

export class ArchiveQueryService implements IArchiveQueryService {
    constructor(
        private readonly storageRepo: Repository<StorageLog>,
        private readonly logger: ILogerService
    ) { }

    public async getArchives(): Promise<StorageLog[]> {
        await this.logger.log("Fetching archive list...");
        return this.storageRepo.find();
    }

    public async getArchiveFilePath(id: number): Promise<string | null> {
        try {

            const log = await this.storageRepo.findOne({ where: { storageLogId: id } });
            if (!log)
                return null;

            const fullPath = path.join(ARCHIVE_DIR, log.fileName);
            return fullPath;
        } catch (err) {
            await this.logger.log("ERROR getting archive file path for id=" + id);
            return null;
        }
    }

    public async getTopArchives(type: "events" | "alerts", limit: number): Promise<TopArchiveDTO[]> {
        try {
            const archiveType = type === "events" ? ArchiveType.EVENT : ArchiveType.ALERT;

            const archives = await this.storageRepo.find({
                where: { archiveType },
                order: { recordCount: "DESC" },
                take: limit
            });

            return archives.map(a => ({
                id: a.storageLogId,
                fileName: a.fileName,
                count: a.recordCount
            }));
        } catch (err) {
            await this.logger.log("ERROR fetching top archives");
            return []; //prazan niz, znaci nema podataka
        }
    }

    public async getArchiveVolume(period: "daily" | "monthly" | "yearly"): Promise<ArchiveVolumeDTO[]> {
        try {
            const archives = await this.storageRepo.find();
            const volumeMap: Record<string, number> = {};

            archives.forEach(a => {
                const date = new Date(a.createdAt);
                let key: string;

                switch (period) {
                    case "daily":
                        key = date.toISOString().split("T")[0];
                        break;
                    case "monthly":
                        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
                        break;
                    case "yearly":
                        key = `${date.getFullYear()}`;
                        break;
                }

                volumeMap[key] = (volumeMap[key] || 0) + a.fileSize;
            });

            return Object.entries(volumeMap).map(([label, size]) => ({ label, size })).sort((a, b) => a.label.localeCompare(b.label));
        } catch (err) {
            await this.logger.log("ERROR calculating archive volume.");
            return []; //vracam opet prazan niz, jer se desila greska
        }
    }

    public async getLargestArchive(): Promise<LargestArchiveDTO | null> {
        try {
            const archives = await this.storageRepo.find();

            if (archives.length === 0)
                return null;

            const largest = archives.reduce((max, curr) => curr.fileSize > max.fileSize ? curr : max);

            return {
                archiveName: largest.fileName,
                size: largest.fileSize
            };
        } catch (err) {
            await this.logger.log("ERROR fetching largest archive");
            return null;
        }
    }

}