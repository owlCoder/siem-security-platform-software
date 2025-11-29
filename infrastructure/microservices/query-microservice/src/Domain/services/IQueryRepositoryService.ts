import { CacheEntry } from "../models/CacheEntry";

export interface IQueryRepositoryService {
    addEntry(entry : CacheEntry) : Promise<void>;
}