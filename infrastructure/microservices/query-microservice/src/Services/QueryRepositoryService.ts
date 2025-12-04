import { Int32, MongoRepository } from "typeorm";
import { CacheEntry } from "../Domain/models/CacheEntry";
import { IQueryRepositoryService } from "../Domain/services/IQueryRepositoryService";
import axios, { AxiosInstance } from "axios";
import { Event } from "../Domain/models/Event";
import { CacheEntryDTO } from "../Domain/DTOs/CacheEntryDTO";

export class QueryRepositoryService implements IQueryRepositoryService {
    private readonly eventClient : AxiosInstance;

    constructor(
        private readonly cacheRepository: MongoRepository<CacheEntry>,
        
    ) {
        const eventUrl = process.env.EVENT_SERVICE_API;

        this.eventClient = axios.create({
            baseURL: eventUrl,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });
    }
    
    async addEntry(entry: CacheEntryDTO): Promise<CacheEntry> {
        const newEntry = new CacheEntry();
        newEntry.key = entry.key;
        newEntry.result = entry.result;
        newEntry.cachedAt = new Date(); 
        // postavljamo trenutno vreme kao vreme kesiranja
        return await this.cacheRepository.save(entry);
    }

    async getAllEvents(): Promise<Event[]> {
        const response = await this.eventClient.get("/events");
        return response.data;
    }

    async getOldEvents(hours : number): Promise<Event[]> {
        const allEvents = await this.getAllEvents();
        const xHoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
        return allEvents.filter(event => new Date(event.timestamp) < xHoursAgo);
    }
}