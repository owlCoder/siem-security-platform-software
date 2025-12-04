import path from "path";
import axios, { AxiosInstance } from "axios";
import { Repository } from "typeorm";
import { StorageLog } from "../Domain/models/StorageLog";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import { IStorageLogService } from "../Domain/services/IStorageLogService";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { execSync } from "child_process";
import { getTimeGroup } from "../Utils/TimeGroup";
import { ILogerService } from "../Domain/services/ILogerService";

const ARCHIVE_DIR = process.env.ARCHIVE_PATH || path.join(__dirname, "../../archives");
const TEMP_DIR = path.join(ARCHIVE_DIR, "tmp");

export class StorageLogService implements IStorageLogService{
        private readonly queryClient: AxiosInstance;
        private readonly eventClient: AxiosInstance;
        private readonly correlationClient: AxiosInstance;
    
        constructor(private readonly storageRepo: Repository<StorageLog>,
            private readonly logger: ILogerService
        ){
            const queryServiceURL = process.env.QUERY_SERVICE_API;
            const eventServiceURL = process.env.EVENT_SERVICE_API;
            const analysisServiceURL = process.env.ANALYSIS_ENGINE_API;

            this.queryClient = axios.create({
                baseURL: queryServiceURL,
                headers: { "Content-Type" : "application/json" },
                timeout: 5000
            });

            this.eventClient = axios.create({
                baseURL: eventServiceURL,
                headers: { "Content-Type" : "application/json" },
                timeout: 5000
            });

            this.correlationClient = axios.create({
                baseURL: analysisServiceURL,
                headers: { "Content-Type" : "application/json" },
                timeout: 5000
            });

            //radi proveru 
            mkdirSync(ARCHIVE_DIR, {recursive: true});
            mkdirSync(TEMP_DIR, {recursive: true});

            this.logger.log("Storage Log Service initialized.");
    }

    public async getArchives(): Promise<StorageLog[]>{
        await this.logger.log("Fetching archive list...");
        return this.storageRepo.find();
    }

    public async runArchiveProcess(): Promise<void> {
        await this.logger.log("Starting archive process...");
        
        const hours = 72;
        // dobavljanje dogadjaja i pretnje
        await this.logger.log(`Fetching events older than ${hours} hours.`);
        //getOldEvents(int hours) : List<Event>
        //dobavljanje podataka ide od queryClient
        const eventsToArchive = (await this.queryClient.get<EventDTO[]>(
            "/query/oldEvents", 
            {params: { hours }}
        )).data;

        await this.logger.log(`Fetched ${eventsToArchive.length} events to archive`);

        if(eventsToArchive.length === 0){
            await this.logger.log("No events to archive. Exiting process.");
            return;
        }

        const groups: Record<string, string[]> = {};

        for(const e of eventsToArchive){
            const key = getTimeGroup(e.timestamp);
            if(!groups[key]) groups[key] = [];

            groups[key].push(`EVENT | ID=${e.id} | TYPE=${e.type} | SOURCE=${e.source} | ${e.description} | ${e.timestamp}`);
        }

        await this.logger.log("Events grouped into time slots.");

        // generisanje txt fajlova
        const txtFiles: string[] = [];

        for(const [slot, lines] of Object.entries(groups)){
            const name = `logs_${slot}.txt`;
            const filePath = path.join(TEMP_DIR, name);

            writeFileSync(filePath, lines.join("\n"));
            txtFiles.push(name);
        }

        await this.logger.log(`Generated ${txtFiles.length} .txt files in tmp directory.`);

        // kreiranje tar arhive
        const tarName = `logs_${new Date().toISOString().replace(/[:.]/g, "_")}.tar`;
        const tarPath = path.join(ARCHIVE_DIR, tarName);

        execSync(`tar -cf ${tarPath} -C ${TEMP_DIR} ${txtFiles.join(" ")}`);
        await this.logger.log(`Created tar archive: ${tarName}`);
        
        // upis u bazu
        const entry = this.storageRepo.create({
            fileName: tarName,
            eventCount: eventsToArchive.length 
        });

        await this.storageRepo.save(entry);
        await this.logger.log("Archive entry saved to DB.");

        // brisanje temp fajlova
        for (const f of txtFiles){
            unlinkSync(path.join(TEMP_DIR, f));
        }

        await this.logger.log("Temporary files cleaned.");

        // salje se Event Collector Service-u
        await this.eventClient.delete(
            "/events/old", 
            {data: eventsToArchive.map(e => e.id)}
        );
        await this.logger.log("Old events deleted from Event Collector Service.");

        //salje se Analysis Engine Service-u
        await this.correlationClient.delete(
            "/AnalysisEngine/correlations/deleteByEventIds",
            {data: eventsToArchive.map(c => c.id)}
        );
        await this.logger.log("Correlation records deleted in Analysis Engine.");

        await this.logger.log("Archive process completed successfully.");
    }
}