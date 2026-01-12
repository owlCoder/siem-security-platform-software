import { CacheEntryDTO } from "../DTOs/CacheEntryDTO";
import { Alert } from "../models/Alert";
import { CacheAlertEntry } from "../models/CacheAlertEntry";

export interface IQueryAlertRepositoryService{
    getAllAlerts(): Promise<Alert[]>
    getMaxId(): Promise<number>;
    getAlertsFromId1ToId2(fromId: number, toId: number): Promise<Alert[]>
    addEntry(entry : CacheEntryDTO) : Promise<CacheAlertEntry>;      
    getOldAlerts(hours: number): Promise<Alert[]>;
    findAlerts(query: string): Set<number>;
    findByKey(key: string): Promise<CacheAlertEntry>;
    deleteByKey(key: string): Promise<boolean>;
    getLastThreeAlerts(): Promise<Alert[]>;
    getAlertsCount(): number;
    getLastProcessedId(): number;    
   getFilteredAlerts(
        severity: string, 
        status?: string, 
        source?: string, 
        dateFrom?: string, 
        dateTo?: string
    ): Promise<Alert[]>;
}