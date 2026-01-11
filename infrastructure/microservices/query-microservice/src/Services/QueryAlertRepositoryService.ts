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
    
    async getOldAlerts(hours: number): Promise<Alert[]> {
        const allAlerts = await this.getAllAlerts();
        const xHoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
        
        const oldEvents = allAlerts.filter(alert => new Date(alert.createdAt) < xHoursAgo);
        oldEvents.forEach(event => {
            this.invertedIndexStructureForAlerts.removeAlertFromIndex(event.id);
        });
        
        if (oldEvents.length > 0)
        {
            this.cacheAlertRepository.clear();
            this.loggerService.log("Deleted old events and cleared cache.");
        }
        return oldEvents;
    }
    findAlerts(query: string): Set<number> {
        const resultIds = this.invertedIndexStructureForAlerts.getIdsForTokens(query);
        return resultIds;
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
    async getLastThreeAlerts(): Promise<Alert[]> {
        const alerts = await this.alertRepository.find({
            order: { createdAt: "DESC" },
            take: 3
        });
        return alerts;
    }
    public getAlertsCount(): number {
        return this.invertedIndexStructureForAlerts.getAlertsCount();
    }
    public getLastProcessedId(): number {
        return this.invertedIndexStructureForAlerts.getLastProcessedId();
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