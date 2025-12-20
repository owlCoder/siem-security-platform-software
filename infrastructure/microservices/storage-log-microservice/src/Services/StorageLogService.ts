import path from "path";
import axios, { AxiosInstance } from "axios";
import { Repository } from "typeorm";
import { StorageLog } from "../Domain/models/StorageLog";
import { mkdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { IStorageLogService } from "../Domain/services/IStorageLogService";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { exec } from "child_process";
import { getTimeGroup } from "../Utils/TimeGroup";
import { ILogerService } from "../Domain/services/ILogerService";
import util from "util";
import { ArchiveStatsDTO } from "../Domain/DTOs/ArchiveStatsDTO";
import { TopArchiveDTO } from "../Domain/DTOs/TopArchiveDTO";
import { ArchiveVolumeDTO } from "../Domain/DTOs/ArchiveVolumeDTO";
import { ArchiveType } from "../Domain/enums/ArchiveType";
import { CorrelationDTO } from "../Domain/DTOs/CorrelationDTO";
import { ARCHIVE_DIR, TEMP_DIR, ARCHIVE_RETENTION_HOURS } from "../Domain/constants/ArchiveConstants";

const execSync = util.promisify(exec);

export class StorageLogService implements IStorageLogService {
    private readonly queryClient: AxiosInstance;
    private readonly eventClient: AxiosInstance;
    private readonly correlationClient: AxiosInstance;

    constructor(private readonly storageRepo: Repository<StorageLog>,
        private readonly logger: ILogerService
    ) {
        const queryServiceURL = process.env.QUERY_SERVICE_API;
        const eventServiceURL = process.env.EVENT_SERVICE_API;
        const analysisServiceURL = process.env.ANALYSIS_ENGINE_API;

        this.queryClient = axios.create({
            baseURL: queryServiceURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000
        });

        this.eventClient = axios.create({
            baseURL: eventServiceURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000
        });

        this.correlationClient = axios.create({
            baseURL: analysisServiceURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000
        });

        //radi proveru 
        mkdirSync(ARCHIVE_DIR, { recursive: true });
        mkdirSync(TEMP_DIR, { recursive: true });

        this.logger.log("Storage Log Service initialized.");
    }

    public async getArchives(): Promise<StorageLog[]> {
        await this.logger.log("Fetching archive list...");
        return this.storageRepo.find();
    }

    public async runArchiveProcess(): Promise<Boolean> {
        await this.logger.log("Starting archive process...");

        const eventsOk = await this.archiveEvents();
        const alertsOk = await this.archiveAlerts();

        await this.logger.log(`Archive process result: events:${eventsOk}, alerts=${alertsOk}`);

        return eventsOk && alertsOk;
    }

    public async archiveEvents(): Promise<boolean> {
        try {
            await this.logger.log("Archiving events started...");

            const events = (await this.queryClient.get<EventDTO[]>("/query/oldEvents", 
                { params: {ARCHIVE_RETENTION_HOURS} }
            )).data;

            if (events.length === 0){
                await this.logger.log("No events to archive.");
                return true;
            }

            const groups: Record<string, string[]> = {};

            for (const e of events) {
                const line = `EVENT | ID = ${e.id} | TYPE = ${e.type} | SOURCE = ${e.source} | ${e.description} | ${e.timestamp.toISOString()}`;

                const key = getTimeGroup(e.timestamp);
                if(!groups[key])
                    groups[key] = [];
                
                groups[key].push(line);
            }

            const txtFiles: string[] = [];

            for(const [slot, content] of Object.entries(groups)){
                const name = `logs_${slot}.txt`;
                writeFileSync(path.join(TEMP_DIR, name), content.join("\n"));
                txtFiles.push(name);
            }

            const tarName = `events_${new Date().toISOString().replace(/[:.]/g, "_")}.tar`;
            const tarPath = path.join(ARCHIVE_DIR, tarName);

            await execSync(`tar -cf "${tarPath}" -C "${TEMP_DIR}" ${txtFiles.join(" ")}`);
            
            txtFiles.forEach(f => 
                unlinkSync(path.join(TEMP_DIR, f))
            );

            const stats = statSync(tarPath);

            await this.storageRepo.save(this.storageRepo.create({
                fileName: tarName,
                archiveType: ArchiveType.EVENT,
                recordCount: events.length,
                fileSize: stats.size
            }));

            await this.logger.log(`Deleting ${events.length} events from Event service`);

            await this.eventClient.delete("/events/old", 
                { data: events.map(e => e.id)}
            );

            await this.logger.log(`Archived ${events.length} events.`);
            return true;

        } catch (err) {
            await this.logger.log("ERROR archiving events: " + (err as Error).message);
            return false;
        }
    }

    public async archiveAlerts(): Promise<boolean> {
        try {
            await this.logger.log("Archiving alerts started...");
            
            const alerts = (await this.queryClient.get<CorrelationDTO[]>("/query/oldAlerts",
                { params: {ARCHIVE_RETENTION_HOURS} }
            )).data;

            if (alerts.length === 0) {
                await this.logger.log("No alerts to archive.");
                return true;
            }

            const groups: Record<string, string[]> = {};

            for (const a of alerts) {
                const line = `ALERT | ID = ${a.id} | SOURCE = ${a.source} | ${a.timestamp.toISOString()}`;

                const key = getTimeGroup(a.timestamp);
                if(!groups[key])
                    groups[key] = [];
                
                groups[key].push(line);
            }

            const txtFiles: string[] = [];

            for(const [slot, content] of Object.entries(groups)){
                const name = `logs_${slot}.txt`;
                writeFileSync(path.join(TEMP_DIR, name), content.join("\n"));
                txtFiles.push(name);
            }

            const tarName = `alerts_${new Date().toISOString().replace(/[:.]/g, "_")}.tar`;
            const tarPath = path.join(ARCHIVE_DIR, tarName);

            await execSync(`tar -cf "${tarPath}" -C "${TEMP_DIR}" ${txtFiles.join(" ")}`);
            
            txtFiles.forEach(f => 
                unlinkSync(path.join(TEMP_DIR, f))
            );

            const stats = statSync(tarPath);

            await this.storageRepo.save(this.storageRepo.create({
                fileName: tarName,
                archiveType: ArchiveType.ALERT,
                recordCount: alerts.length,
                fileSize: stats.size
            }));

            await this.logger.log(`Deleting ${alerts.length} events from Analysis Engine service`);

            await this.correlationClient.delete("/AnalysisEngine/correlations/deleteByEventIds",
                { data: alerts.map(a => a.id)}
            );

            await this.logger.log(`Archived ${alerts.length} alerts.`);
            return true;

        } catch (err) {
            await this.logger.log("ERROR archiving alerts: " + (err as Error).message);
            return false;
        }
    }

    public async searchArchives(query: string): Promise<StorageLog[]> {
        const allArchives = await this.getArchives();
        const normalized = query.toLowerCase();
        return allArchives.filter(a => a.fileName.toLowerCase().includes(normalized));
    }

    public async sortArchives(by: "date" | "size" | "name", order: "asc" | "desc"): Promise<StorageLog[]> {
        const allArchives = await this.getArchives();
        const factor = order == "asc" ? 1 : -1;

        allArchives.sort((a, b) => {
            let valA: number | string;
            let valB: number | string;

            switch (by) {
                case "date":
                    valA = new Date(a.createdAt).getTime();
                    valB = new Date(b.createdAt).getTime();
                    break;

                case "size":
                    valA = a.fileSize;
                    valB = b.fileSize;
                    break;

                case "name":
                    valA = a.fileName;
                    valB = b.fileName;
                    break;
            }

            if (valA < valB) return -1 * factor;
            if (valA > valB) return 1 * factor;
            return 0;
        });
        return allArchives;
    }

    public async getStats(): Promise<ArchiveStatsDTO> {
        try {

            const archives = await this.storageRepo.find();

            const totalSize = archives.reduce((sum, a) => sum + a.fileSize, 0);
            const lastArchive = archives.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];

            return {
                totalSize,
                retentionHours: 72,
                lastArchiveName: lastArchive ? lastArchive.fileName : null
            };
        } catch (err) {
            await this.logger.log("ERROR fetching archive stats");
            return {
                totalSize: 0,
                retentionHours: 72,
                lastArchiveName: null
            }
        }
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

                volumeMap[key] = (volumeMap[key] || 0) + a.recordCount;
            });

            return Object.entries(volumeMap).map(([label, size]) => ({ label, size })).sort((a, b) => a.label.localeCompare(b.label));
        } catch (err) {
            await this.logger.log("ERROR calculating archive volume.");
            return []; //vracam opet prazan niz, jer se desila greska
        }
    }
}