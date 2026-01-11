import { Between, MongoRepository, Repository } from "typeorm";
import { Alert } from "../Domain/models/Alert";
import { IQueryAlertRepositoryService } from "../Domain/services/IQueryAlertRepositoryService";
import { CacheAlertEntry } from "../Domain/models/CacheAlertEntry";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { InvertedIndexStructureForAlerts } from "../Utils/InvertedIndexStructureForAlerts";
import { CacheEntryDTO } from "../Domain/DTOs/CacheEntryDTO";

const emptyCacheEntry: CacheAlertEntry = {
    _id: "",
    key: "NOT_FOUND",
    result: [],
    cachedAt: new Date(0),
    lastProcessedId: 0
};

export class QueryAlertRepositoryService implements IQueryAlertRepositoryService {
    public readonly invertedIndexStructureForAlerts: InvertedIndexStructureForAlerts;
    constructor(private readonly cacheAlertRepository : MongoRepository<CacheAlertEntry>,
                private readonly loggerService: ILoggerService,
                private readonly alertRepository: Repository<Alert>)
    {
        this.invertedIndexStructureForAlerts = new InvertedIndexStructureForAlerts(this);
        this.loggerService.log("QueryAlertRepositoryService initialized.");
        this.loggerService.log("Inverted index structure for alerts initialized and " + this.invertedIndexStructureForAlerts.getAlertsCount() + " alerts indexed.");
        
    }
    async addEntry(entry: CacheEntryDTO): Promise<CacheAlertEntry> {
       const newEntry = new CacheAlertEntry();
               newEntry.key = entry.key;
               newEntry.result = entry.result;
               newEntry.cachedAt = new Date(); 
               newEntry.lastProcessedId = entry.lastProcessedId;
               // postavljamo trenutno vreme kao vreme kesiranja
               return await this.cacheAlertRepository.save(newEntry);
    }
    getOldAlerts(hours: number): Promise<Alert[]> {
        throw new Error("Method not implemented.");
    }
    findAlerts(query: string): Set<number> {
        throw new Error("Method not implemented.");
    }
    async findByKey(key: string): Promise<CacheAlertEntry> {
        const response = await this.cacheAlertRepository.findOne({ where: { key } });
        if(!response) return emptyCacheEntry;
        return response;
    }
    async deleteByKey(key: string): Promise<boolean> {
        const response = await this.cacheAlertRepository.deleteOne({key});
        return response.deletedCount === 1;
    }
    getLastThreeAlerts(): Promise<Alert[]> {
        throw new Error("Method not implemented.");
    }
    getAlertsCount(): number {
        throw new Error("Method not implemented.");
    }
    getLastProcessedId(): number {
        throw new Error("Method not implemented.");
    }
    public async getMaxId(): Promise<number> {
        const result = await this.alertRepository.find({
            select: ["id"],
            order: { id: "DESC" },
            take: 1
        });

        return result.length ? result[0].id : 0;
    }
    public async getAlertsFromId1ToId2(fromId: number, toId: number): Promise<Alert[]> {
        return await this.alertRepository.find({where: {id: Between(fromId, toId)}, order: { id: "ASC" }});
    }

    async getAllAlerts(): Promise<Alert[]> {
        return this.alertRepository.find();
    } 
    
}   