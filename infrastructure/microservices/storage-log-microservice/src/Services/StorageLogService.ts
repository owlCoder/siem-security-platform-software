import path from "path";
import axios, { AxiosInstance } from "axios";
import { Repository } from "typeorm";
import { StorageLog } from "../Domain/models/StorageLog";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import { IStorageLogService } from "../Domain/services/IStorageLogService";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { CorrelationDTO } from "../Domain/DTOs/CorrelationDTO";
import { execSync } from "child_process";
import { getTimeGroup } from "../Utils/TimeGroup";

const ARCHIVE_DIR = process.env.ARCHIVE_PATH || path.join(__dirname, "../../archives");
const TEMP_DIR = path.join(ARCHIVE_DIR, "tmp");

export class StorageLogService implements IStorageLogService{
    constructor(
        private readonly storageRepo: Repository<StorageLog>,
        //dodati query client i da bude AxiosInstance
        private readonly queryClient: AxiosInstance,
        private readonly eventClient: AxiosInstance,
        private readonly correlationClient: AxiosInstance
    ){
        //radi proveru 
        mkdirSync(ARCHIVE_DIR, {recursive: true});
        mkdirSync(TEMP_DIR, {recursive: true});
    }

    public async getArchives(): Promise<StorageLog[]>{
        return this.storageRepo.find();
    }

    public async runArchiveProcess(): Promise<void> {
        const hours = 72;
        // dobavljanje dogadjaja i pretnje
        //getOldEvents(int hours) : List<Event>

        //dobavljanje podataka ide od queryClient
        const eventsToArchive = (await this.queryClient.get<EventDTO[]>(
            "neka ruta", // zamijeniti rutu od query service
            {params: { hours }}
        )).data;

        const groups: Record<string, string[]> = {};

        for(const e of eventsToArchive){
            const key = getTimeGroup(e.timestamp);
            if(!groups[key]) groups[key] = [];

            groups[key].push(`EVENT | ID=${e.id} | TYPE=${e.type} | SOURCE=${e.source} | ${e.description} | ${e.timestamp}`);
        }

        // generisanje txt fajlova
        const txtFiles: string[] = [];

        for(const [slot, lines] of Object.entries(groups)){
            const name = `logs_${slot}.txt`;
            const filePath = path.join(TEMP_DIR, name);

            writeFileSync(filePath, lines.join("\n"));
            txtFiles.push(name);
        }

        // kreiranje tar arhive
        const tarName = `logs_${new Date().toISOString().replace(/[:.]/g, "_")}.tar`;
        const tarPath = path.join(ARCHIVE_DIR, tarName);

        execSync(`tar -cf ${tarPath} -C ${TEMP_DIR} ${txtFiles.join(" ")}`);
        
        // upis u bazu
        const entry = this.storageRepo.create({
            fileName: tarName,
            eventCount: eventsToArchive.length 
        });

        await this.storageRepo.save(entry);

        // brisanje temp fajlova
        for (const f of txtFiles){
            unlinkSync(path.join(TEMP_DIR, f));
        }

        // salje se Event Collector Service-u
        await this.eventClient.delete(
            "neka ruta", // zamijeniti rutu kada se zavrsi event collector servis
            {data: eventsToArchive.map(e => e.id)}
        );

        //salje se Analysis Engine Service-u
        await this.correlationClient.delete(
            "neka ruta", // zamijeniti rutu kada se zavrsi analysis servis
            {data: eventsToArchive.map(c => c.id)}
            //{data: correlationsToArchive.map(c => c.id)}
        );
    }
}