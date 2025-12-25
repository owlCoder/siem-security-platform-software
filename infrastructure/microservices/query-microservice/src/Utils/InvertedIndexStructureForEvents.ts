import { loadQueryState } from "./StateManager";
import { Event } from "../Domain/models/Event";
import { QueryRepositoryService } from "../Services/QueryRepositoryService";
import { tokenize } from "./EventToTokensParser";

export class InvertedIndexStructureForEvents {
    private invertedIndex: Map<string, Set<number>> = new Map();
    private eventIdToTokens: Map<number, string[]> = new Map();
    private lastProcessedId: number = 0;
    private eventCount: number = 0;
    private infoCount: number = 0;
    private warningCount: number = 0;
    private errorCount: number = 0;
    
    private indexingInProgress: boolean = false;
    constructor(private readonly queryRepositoryService: QueryRepositoryService){
        const savedState = loadQueryState();
        this.lastProcessedId = savedState.lastProcessedId;
        this.invertedIndex = savedState.invertedIndex;
        this.eventIdToTokens = savedState.eventTokenMap;
        this.eventCount = savedState.eventCount;
        this.infoCount = savedState.infoCount;
        this.warningCount = savedState.warningCount;
        this.errorCount = savedState.errorCount;
        
        if (this.invertedIndex.size === 0 || this.eventIdToTokens.size === 0 || this.lastProcessedId === 0
            || this.eventCount === 0)
        {
            // pravi indeks od nule
            this.bootstrapIndex();
        }

        this.startIndexingWorker();
    }

    // pokrece se na 10 sekundi
    public startIndexingWorker(intervalMs: number = 10000): void {
        setInterval(async () => {
            if (this.indexingInProgress) return;
            this.indexingInProgress = true;

            try {
                const maxId = await this.queryRepositoryService.getMaxId();
                if (maxId === 0) {
                    this.indexingInProgress = false;
                    return;
                }

                if (maxId > this.lastProcessedId) {
                    const newEvents = await this.queryRepositoryService.getEventsFromId1ToId2(this.lastProcessedId + 1, maxId);
                    
                    newEvents.forEach(event => this.addEventToIndex(event));
                    
                    this.lastProcessedId = maxId;
                    //this.loggerService.log(`Indexed ${newEvents.length} new events up to id ${maxId}`);
                }
            } catch (err) {
                //this.loggerService.log(`Indexing worker error: ${err}`);
            } finally {
                this.indexingInProgress = false;
            }
        }, intervalMs);
    }

    private async bootstrapIndex(): Promise<void> {
        const allEvents = await this.queryRepositoryService.getAllEvents();

        if (allEvents.length === 0) return;

        allEvents.forEach(event => this.addEventToIndex(event));

        this.lastProcessedId = Math.max(...allEvents.map(e => e.id));

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

        this.lastProcessedId = event.id;
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
            const trimmedToken = token.trim().toLowerCase();
            const ids = this.invertedIndex.get(trimmedToken);
            if (ids) {
                ids.forEach(id => resultIds.add(id));
            }
        }
        return resultIds;
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
}