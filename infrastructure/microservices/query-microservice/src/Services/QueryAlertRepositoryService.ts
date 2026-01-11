import { Between, Repository } from "typeorm";
import { Alert } from "../Domain/models/Alert";
import { IQueryAlertRepositoryService } from "../Domain/services/IQueryAlertRepositoryService";
import { CacheAlertEntry } from "../Domain/models/CacheAlertEntry";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { InvertedIndexStructureForAlerts } from "../Utils/InvertedIndexStructureForAlerts";

const emptyCacheEntry: CacheAlertEntry = {
    _id: "",
    key: "NOT_FOUND",
    result: [],
    cachedAt: new Date(0),
    lastProcessedId: 0
};

export class QueryAlertRepositoryService implements IQueryAlertRepositoryService {
    public readonly invertedIndexStructureForAlerts: InvertedIndexStructureForAlerts;
    constructor(private readonly cacheAlertRepository : Repository<CacheAlertEntry>,
                private readonly loggerService: ILoggerService,
                private readonly alertRepository: Repository<Alert>)
    {
        this.invertedIndexStructureForAlerts = new InvertedIndexStructureForAlerts(this);
        this.loggerService.log("QueryAlertRepositoryService initialized.");
        this.loggerService.log("Inverted index structure for alerts initialized and " + this.invertedIndexStructureForAlerts.getAlertsCount() + " events indexed.");
        
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