import { Between, In, MongoRepository, Repository } from "typeorm";
import { CacheEntry } from "../Domain/models/CacheEntry";
import { IQueryRepositoryService } from "../Domain/services/IQueryRepositoryService";
import { Event } from "../Domain/models/Event";
import { CacheEntryDTO } from "../Domain/DTOs/CacheEntryDTO";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { InvertedIndexStructureForEvents } from "../Utils/InvertedIndexStructureForEvents";

// princip pretrage:
// imamo recnik koji mapira reci iz eventa na event id-eve
// npr. "error" => [1, 5, 7]
// npr. "server1" => [2, 3, 6]
// prilikom pretrage se parsira query string i za svaku rec iz query stringa se dobijaju id-evi iz recnika
// kao rezultat pretrage se vracaju id-evi koji se pojavljuju u barem jednom skupu za svaku rec iz query stringa
// promenljiva lastProcessedId cuva id event-a koji je poslednji procesiran
// kada se pokrene pretraga, prvo se od EventCollector servisa trazi da vrati najveci id eventa koji je sacuvan
// ukoliko je veci od lastProcessedId, znaci da ima novih event-a
// onda se ti event-i uzimaju i azurira se recnik sa njihovim podacima
// na 15 minuta se brisu eventi koji su stariji od 72h, i tada se brisu i njihovi podaci iz recnika
// imamo i mapu koja mapira event id na reci iz eventa za lakse brisanje

const emptyCacheEntry: CacheEntry = {
    _id: "",
    key: "NOT_FOUND",
    result: [],
    cachedAt: new Date(0),
    lastProcessedId: 0
};

export class QueryRepositoryService implements IQueryRepositoryService {    
    public readonly invertedIndexStructureForEvents: InvertedIndexStructureForEvents;
    constructor(private readonly cacheRepository: MongoRepository<CacheEntry>, 
                private readonly loggerService: ILoggerService,
                private readonly eventRepository: Repository<Event>
            ) 
    {
        this.invertedIndexStructureForEvents = new InvertedIndexStructureForEvents(this);
        this.loggerService.log("QueryRepositoryService initialized.");
        this.loggerService.log("Inverted index structure for events initialized and " + this.invertedIndexStructureForEvents.getEventsCount() + " events indexed.");
    }

    async findByKey(key: string): Promise<CacheEntry> {
        const response = await this.cacheRepository.findOne({ where: { key } });
        if(!response) return emptyCacheEntry;
        return response;
    }

    async deleteByKey(key: string): Promise<boolean> {
        const response = await this.cacheRepository.deleteOne({key});
        return response.deletedCount === 1;
    }
    
    async addEntry(entry: CacheEntryDTO): Promise<CacheEntry> {
        const newEntry = new CacheEntry();
        newEntry.key = entry.key;
        newEntry.result = entry.result;
        newEntry.cachedAt = new Date(); 
        newEntry.lastProcessedId = entry.lastProcessedId;
        // postavljamo trenutno vreme kao vreme kesiranja
        return await this.cacheRepository.save(newEntry);
    }

    async getAllEvents(): Promise<Event[]> {
        return this.eventRepository.find();
    }

    async getOldEvents(hours : number): Promise<Event[]> {
        const allEvents = await this.getAllEvents();
        const xHoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
        
        const oldEvents = allEvents.filter(event => new Date(event.timestamp) < xHoursAgo);
        oldEvents.forEach(event => {
            this.invertedIndexStructureForEvents.removeEventFromIndex(event.id);
        });
        
        if (oldEvents.length > 0)
        {
            this.cacheRepository.clear();
            this.loggerService.log("Deleted old events and cleared cache.");
        }
        return oldEvents;
    }

    public findEvents(query: string): Set<number> {
        const resultIds = this.invertedIndexStructureForEvents.getIdsForTokens(query);
        return resultIds;
    }

    public async getMaxId(): Promise<number> {
        const result = await this.eventRepository.find({
            select: ["id"],
            order: { id: "DESC" },
            take: 1
        });

        return result.length ? result[0].id : 0;
    }

    public async getEventsFromId1ToId2(fromId: number, toId: number): Promise<Event[]> {
        return await this.eventRepository.find({where: {id: Between(fromId, toId)}, order: { id: "ASC" }});
    }

    public getEventsCount(): number {
        return this.invertedIndexStructureForEvents.getEventsCount();
    }

    public getInfoCount(): number {
        return this.invertedIndexStructureForEvents.getInfoCount();
    }

    public getWarningCount(): number {
        return this.invertedIndexStructureForEvents.getWarningCount();
    }

    public getErrorCount(): number {
        return this.invertedIndexStructureForEvents.getErrorCount();
    }

    public async getLastThreeEvents(): Promise<Event[]> {
        const events = await this.eventRepository.find({
            order: { timestamp: "DESC" },
            take: 3
        });
        return events;
    }

    public getLastProcessedId(): number {
        return this.invertedIndexStructureForEvents.getLastProcessedId();
    }

    public async getFilteredEvents(dateFrom: string, dateTo: string, eventType: string): Promise<Event[]> {
        const where: any = {};

        if (dateFrom && dateTo) {
            where.timestamp = Between(new Date(dateFrom), new Date(dateTo));
        }

        if (eventType && eventType !== 'all') {
            where.severity = eventType.toUpperCase();
        }

        return await this.eventRepository.find({
            where,
            order: { timestamp: "DESC" }
        });
    }
}