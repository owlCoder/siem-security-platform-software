import { RiskEntityType } from "../enums/RiskEntityType";

export interface IQueryStatisticsService {
    getTotalEventCount(entityType: RiskEntityType, entityId: string): Promise<number>;
    getErrorEventCount(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<number>;
    getEventRate(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<number>;

    getAlertsCountBySeverity(entityType: RiskEntityType, entityId: string): Promise<Map<string, number>>;
    getCriticalAlertsCount(entityType: RiskEntityType, entityId: string): Promise<number>;

    getAnomalyRate(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<number>;
    getBurstAnomaly(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<boolean>;

    getUniqueServicesCount(ipAddress: string): Promise<number>;
    getUniqueIpsCount(serviceName: string): Promise<number>;
}