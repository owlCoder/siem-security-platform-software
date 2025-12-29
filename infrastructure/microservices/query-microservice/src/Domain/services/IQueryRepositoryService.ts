import { Int32 } from "typeorm";
import { CacheEntryDTO } from "../DTOs/CacheEntryDTO";
import { CacheEntry } from "../models/CacheEntry";
import { Event } from "../models/Event";

export interface IQueryRepositoryService {
    addEntry(entry : CacheEntryDTO) : Promise<CacheEntry>;
    getAllEvents(): Promise<Event[]>
    getOldEvents(hours: number): Promise<Event[]>;
    findEvents(query: string): Set<number>;
    getMaxId(): Promise<number>;
    getEventsFromId1ToId2(fromId: number, toId: number): Promise<Event[]>;
    findByKey(key: string): Promise<CacheEntry>;
    deleteByKey(key: string): Promise<boolean>;
    //saveEvent(event: Event): Promise<Event>;
    //searchEvents(query: string): Promise<Event[]>;
    getLastThreeEvents(): Promise<Event[]>;
    getEventsCount(): number;
    getInfoCount(): number;
    getWarningCount(): number;
    getErrorCount(): number;
    getLastProcessedId(): number;
    getFilteredEvents(dateFrom: string, dateTo: string, eventType: string): Promise<any[]>;
}