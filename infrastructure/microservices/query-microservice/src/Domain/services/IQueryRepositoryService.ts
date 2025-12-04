import { Int32 } from "typeorm";
import { CacheEntryDTO } from "../DTOs/CacheEntryDTO";
import { CacheEntry } from "../models/CacheEntry";
import { Event } from "../models/Event";

export interface IQueryRepositoryService {
    addEntry(entry : CacheEntryDTO) : Promise<CacheEntry>;
    getAllEvents(): Promise<Event[]>
    getOldEvents(hours: number): Promise<Event[]>;
}