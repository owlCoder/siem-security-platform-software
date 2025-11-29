import { MongoRepository } from "typeorm";
import { CacheEntry } from "../Domain/models/CacheEntry";
import { IQueryRepositoryService } from "../Domain/services/IQueryRepositoryService";

export class QueryService implements IQueryRepositoryService {
    constructor(
        private readonly cacheRepository: MongoRepository<CacheEntry>,
    ) {}
    
    async addEntry(entry: CacheEntry): Promise<void> {
        entry.cachedAt = new Date(); 
        // postavljamo trenutno vreme kao vreme kesiranja
        await this.cacheRepository.save(entry);
    }
}