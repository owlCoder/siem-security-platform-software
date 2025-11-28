import path from "path";
import axios from "axios";
import { Repository } from "typeorm";
import { StorageLog } from "../Domain/models/StorageLog";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import { IStorageLogService } from "../Domain/services/IStorageLogService";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { CorrelationDTO } from "../Domain/DTOs/CorrelationDTO";
import { execSync } from "child_process";

const ARCHIVE_DIR = process.env.ARCHIVE_PATH || path.join(__dirname, "../../archives");
const TEMP_DIR = path.join(ARCHIVE_DIR, "tmp");

export class StorageLogService implements IStorageLogService{
    constructor(
        private readonly storageRepo: Repository<StorageLog>,
        private readonly eventClient: typeof axios,
        private readonly correlationClient: typeof axios
    ){
        //radi proveru 
        mkdirSync(ARCHIVE_DIR, {recursive: true});
        mkdirSync(TEMP_DIR, {recursive: true});

        console.log("[StorageLogService] initialized");
    }

    private isOlderThan72h(timestamp: Date): boolean{
        const ts = new Date(timestamp).getTime();
        const cutoff = Date.now() - 72 * 60 * 60 * 1000;
        return ts < cutoff;
    }
    
    private getTimeGroup(timeStamp: Date): string{
        const d = new Date(timeStamp);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");

        const quarter = Math.floor(d.getMinutes() / 15) * 15;
        const qStr = String(quarter).padStart(2, "0");

        return `${yyyy}_${mm}_${dd}_${hh}_${qStr}`;
    }

    public async getArchives(): Promise<StorageLog[]>{
        return this.storageRepo.find();
    }

    public async runArchiveProcess(): Promise<void> {
        console.log("[StorageLogService] Starting archive process...");
        
        // dobavljanje dogadjaja
        const allEvents = (await this.eventClient.get<EventDTO[]>(
            "neka ruta" // zamijeniti rutu kada se zavrsi event collector servis
        )).data;

        const eventsToArchive = allEvents.filter(e => this.isOlderThan72h(e.timestamp));

        // dobavljanje alerta/correlationa
        const allCorrelations = (await this.correlationClient.get<CorrelationDTO[]>(
            "neka ruta" // zamijeniti rutu kada se zavrsi alert servis
        )).data;

        const correlationsToArchive = allCorrelations.filter(c => this.isOlderThan72h(c.timestamp));

        const groups: Record<string, string[]> = {};

        for(const e of eventsToArchive){
            const key = this.getTimeGroup(e.timestamp);
            if(!groups[key]) groups[key] = [];

            groups[key].push(`EVENT | ID=${e.id} | TYPE=${e.type} | SOURCE=${e.source} | ${e.description} | ${e.timestamp}`);
        }

        for(const c of correlationsToArchive){
            const key = this.getTimeGroup(c.timestamp);
            if(!groups[key]) groups[key] = [];

            groups[key].push(`CORRELATION | ID=${c.id} | ALERT=${c.is_alert} | ${c.description} | ${c.timestamp}`);
        }

        // generisanje txt fajlova
        const txtFiles: string[] = [];

        for(const [slot, lines] of Object.entries(groups)){
            const name = `logs_${slot}.txt`;
            const filePath = path.join(TEMP_DIR, name);

            writeFileSync(filePath, lines.join("\n"));
            txtFiles.push(name);
        }

        console.log(`[StorageLogService] Created ${txtFiles.length} batch files.`);

        // kreiranje tar arhive
        const tarName = `logs_${new Date().toISOString().replace(/[:.]/g, "_")}.tar`;
        const tarPath = path.join(ARCHIVE_DIR, tarName);

        execSync(`tar -cf ${tarPath} -C ${TEMP_DIR} ${txtFiles.join(" ")}`);
        
        console.log("[StorageLogService] TAR archive created: ", tarName);

        // upis u bazu
        const entry = this.storageRepo.create({
            fileName: tarName,
            eventCount: eventsToArchive.length + correlationsToArchive.length
        });

        await this.storageRepo.save(entry);

        // brisanje temp fajlova
        for (const f of txtFiles){
            unlinkSync(path.join(TEMP_DIR, f));
        }

        // slanje delete zahtjeva drugim servisima
        await this.eventClient.delete(
            "neka ruta", // zamijeniti rutu kada se zavrsi event collector servis
            {data: eventsToArchive.map(e => e.id)}
        );

        await this.correlationClient.delete(
            "neka ruta", // zamijeniti rutu kada se zavrsi alert servis
            {data: correlationsToArchive.map(c => c.id)}
        );

        console.log("[StorageLogService] Archive process completed");

    }
}