import { Between, MongoRepository, Repository } from "typeorm";
import { CacheEntry } from "../Domain/models/CacheEntry";
import { IQueryRepositoryService } from "../Domain/services/IQueryRepositoryService";
import axios, { all, AxiosInstance } from "axios";
import { Event } from "../Domain/models/Event";
import { CacheEntryDTO } from "../Domain/DTOs/CacheEntryDTO";
import { tokenize } from "../Utils/EventToTokensParser";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { loadQueryState, saveQueryState } from "../Utils/StateManager";

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
    cachedAt: new Date(0)
};

export class QueryRepositoryService implements IQueryRepositoryService {
    private invertedIndex: Map<string, Set<number>> = new Map();
    private eventIdToTokens: Map<number, string[]> = new Map();
    private lastProcessedId: number = 0;
    private eventCount: number = 0;
    private infoCount: number = 0;
    private warningCount: number = 0;
    private errorCount: number = 0;
    
    private indexingInProgress: boolean = false;

    //private readonly eventClient : AxiosInstance;

    constructor(private readonly cacheRepository: MongoRepository<CacheEntry>, 
                private readonly loggerService: ILoggerService,
                private readonly eventRepository: Repository<Event>) 
    {
        /*
        const eventUrl = process.env.EVENT_SERVICE_API;

        this.eventClient = axios.create({
            baseURL: eventUrl,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });
        */
        const savedState = loadQueryState();
        this.lastProcessedId = savedState.lastProcessedId;
        this.invertedIndex = savedState.invertedIndex;
        this.eventIdToTokens = savedState.eventTokenMap;
        this.eventCount = savedState.eventCount;
        this.infoCount = savedState.infoCount;
        this.warningCount = savedState.warningCount;
        this.errorCount = savedState.errorCount;

        this.loggerService.log("Loaded query service state from file. Last processed ID: " + this.lastProcessedId);
        //console.log("Inverted index size:", this.invertedIndex.size);
        //console.log("Event ID to tokens map size:", this.eventIdToTokens.size);

        if (this.invertedIndex.size === 0 || this.eventIdToTokens.size === 0 || this.lastProcessedId === 0
            || this.eventCount === 0)
        {
            // pravi indeks od nule
            this.bootstrapIndex();
        }

        this.startIndexingWorker();
    }

    async findByKey(key: string): Promise<CacheEntry> {
        const response = await this.cacheRepository.findOne({ where: { key } });
        if(!response) return emptyCacheEntry;
        return response;
    }
    
    async addEntry(entry: CacheEntryDTO): Promise<CacheEntry> {
        const newEntry = new CacheEntry();
        newEntry.key = entry.key;
        newEntry.result = entry.result;
        newEntry.cachedAt = new Date(); 
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
            this.removeEventFromIndex(event.id);
        });
        
        return oldEvents;
    }

    public addEventToIndex(event: Event): void {
        const tokens = [
            ...tokenize(event.description),
            ...tokenize(event.source),
            ...tokenize(event.type)
        ];

        this.eventIdToTokens.set(event.id, tokens);

        for (const token of tokens) {
            if (!this.invertedIndex.has(token)) {
                this.invertedIndex.set(token, new Set());
            }
            this.invertedIndex.get(token)!.add(event.id);
        }

        this.eventCount += 1;
        switch (event.type) {
            case "INFO":
                this.infoCount += 1;
                break;
            case "WARNING":
                this.warningCount += 1;
                break;
            case "ERROR":
                this.errorCount += 1;
                break;
        }
    }

    public removeEventFromIndex(eventId: number): void {
        const tokens = this.eventIdToTokens.get(eventId);
        if (!tokens) return;

        for (const token of tokens) {
            const idSet = this.invertedIndex.get(token);
            if (idSet) {
                idSet.delete(eventId);
                if (idSet.size === 0) {
                    this.invertedIndex.delete(token);
                }
            }
        }
        this.eventIdToTokens.delete(eventId);
    }

    public getIdsForTokens(query: string): Set<number> {
        const tokens = tokenize(query);
        const resultIds: Set<number> = new Set();

        for (const token of tokens) {
            token.trim().toLowerCase();
            const ids = this.invertedIndex.get(token);
            if (ids) {
                ids.forEach(id => resultIds.add(id));
            }
        }
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

    // pokrece se na 10 sekundi
    public startIndexingWorker(intervalMs: number = 10000): void {
        setInterval(async () => {
            if (this.indexingInProgress) return;
            this.indexingInProgress = true;

            try {
                const maxId = await this.getMaxId();
                if (maxId === 0) {
                    this.indexingInProgress = false;
                    return;
                }

                if (maxId > this.lastProcessedId) {
                    const newEvents = await this.getEventsFromId1ToId2(this.lastProcessedId + 1, maxId);
                    
                    newEvents.forEach(event => this.addEventToIndex(event));
                    
                    this.lastProcessedId = maxId;
                    this.loggerService.log(`Indexed ${newEvents.length} new events up to id ${maxId}`);
                }
            } catch (err) {
                 this.loggerService.log(`Indexing worker error: ${err}`);
            } finally {
                this.indexingInProgress = false;
            }
        }, intervalMs);
    }

    public getInvertedIndex(): Map<string, Set<number>> {
        return this.invertedIndex;
    }

    public getEventIdToTokens(): Map<number, string[]> {
        return this.eventIdToTokens;
    }

    public getLastProcessedId(): number {
        return this.lastProcessedId;
    }

    public isIndexingInProgress(): boolean {
        return this.indexingInProgress;
    }

    public getEventsCount(): number {
        return this.eventCount;
    }

    public getInfoCount(): number {
        return this.infoCount;
    }

    public getWarningCount(): number {
        return this.warningCount;
    }

    public getErrorCount(): number {
        return this.errorCount;
    }

    public async getLastThreeEvents(): Promise<Event[]> {
        const events = await this.eventRepository.find({
            order: { timestamp: "DESC" },
            take: 3
        });
        return events;
    }

    private async bootstrapIndex(): Promise<void> {
        const allEvents = await this.eventRepository.find();

        if (allEvents.length === 0) return;

        allEvents.forEach(event => this.addEventToIndex(event));

        this.lastProcessedId = Math.max(...allEvents.map(e => e.id));

        this.loggerService.log(
            `Bootstrap indexing completed. Indexed ${allEvents.length} events.`
        );

        /*
        saveQueryState({
            lastProcessedId: this.lastProcessedId,
            invertedIndex: this.invertedIndex,
            eventTokenMap: this.eventIdToTokens
        });
        */
    }
}