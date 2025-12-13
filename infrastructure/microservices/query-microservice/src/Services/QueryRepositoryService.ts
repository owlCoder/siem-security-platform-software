import { MongoRepository } from "typeorm";
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

export class QueryRepositoryService implements IQueryRepositoryService {
    private invertedIndex: Map<string, Set<number>> = new Map();
    private eventIdToTokens: Map<number, string[]> = new Map();
    private lastProcessedId: number = 0;
    
    private indexingInProgress: boolean = false;

    private readonly eventClient : AxiosInstance;

    constructor(private readonly cacheRepository: MongoRepository<CacheEntry>, private readonly loggerService: ILoggerService) 
    {
        const eventUrl = process.env.EVENT_SERVICE_API;

        this.eventClient = axios.create({
            baseURL: eventUrl,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });

        const savedState = loadQueryState();
        this.lastProcessedId = savedState.lastProcessedId;
        this.invertedIndex = savedState.invertedIndex;
        this.eventIdToTokens = savedState.eventTokenMap;

        this.startIndexingWorker();
    }

    async findById(id: number): Promise<Event> {
        //ovo ne treba ovako ispraviti!!

        // TODO!!!!!
        // treba da trazi iz NoSQL baze a ne od event servisa
        // id je string a ne broj
            const response = await this.eventClient.get(`/events/${id}`);
            if(!response){
                 this.loggerService.log(`findById error fetching id ${id}`);
                 return new Event();
                 }
            return response.data;
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
            const ids = this.invertedIndex.get(token);
            if (ids) {
                ids.forEach(id => resultIds.add(id));
            }
        }
        return resultIds;
    }

    public async getMaxId(): Promise<number> {
        const response = await this.eventClient.get("/events/maxId");   // izmeni kad dodaju metodu!!!
        return response.data.maxId; 
    }

    public async getEventsFromId1ToId2(fromId: number, toId: number): Promise<Event[]> {
        const response = await this.eventClient.get(`/events?from=${fromId}&to=${toId}`);   // izmeni kad dodaju metodu!!!
        return response.data;
    }

    // pokrece se na 10 sekundi
    public startIndexingWorker(intervalMs: number = 10000): void {
        setInterval(async () => {
            if (this.indexingInProgress) return;
            this.indexingInProgress = true;

            try {
                const maxId = await this.getMaxId();

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

    // brze je da se trazi iz baze
    // proveriti!!!
    public async getLastThreeEvents(): Promise<Event[]> {
        const allEvents = await this.getAllEvents();
        const sortedEvents = allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sortedEvents.slice(0, 3);
    }

    public async getEventsCount(): Promise<number> {
        const maxId = await this.getMaxId();
        if (maxId === 0) return 0;
        return maxId;
    }
}