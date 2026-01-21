import { DistributionDTO } from "../DTOs/DistributionDTO";
import { EventDTO } from "../DTOs/EventDTO";
import { EventsResultDTO } from "../DTOs/EventsResultDTO";
import { HourlyStatisticsDTO } from "../DTOs/HourlyStatisticsDTO";
import { RiskEntityType } from "../enums/RiskEntityType";

export interface IQueryGatewayService {
  searchEvents(query: string, page: number, limit: number): Promise<EventsResultDTO>;
  getOldEvents(hours: number): Promise<EventDTO[]>;
  getLastThreeEvents(): Promise<EventDTO[]>;
  getAllEvents(): Promise<EventDTO[]>;
  getEventsCount(): Promise<number>;
  getInfoCount(): Promise<number>;
  getWarningCount(): Promise<number>;
  getErrorCount(): Promise<number>;
  getEventDistribution(): Promise<DistributionDTO>;
  getEventStatistics(): Promise<HourlyStatisticsDTO[]>;
  getAlertStatistics(): Promise<HourlyStatisticsDTO[]>;

  getTotalEventCount(entityType: RiskEntityType, entityId: string): Promise<number>;
  getErrorEventCount(entityType: RiskEntityType, entityId: string, hours: number): Promise<number>;
  getEventRate(entityType: RiskEntityType, entityId: string, hours: number): Promise<number>;
  getAlertsCountBySeverity(entityType: RiskEntityType, entityId: string): Promise<Map<string, number>>;
  getCriticalAlertsCount(entityType: RiskEntityType, entityId: string): Promise<number>;
  getAnomalyRate(entityType: RiskEntityType, entityId: string, hours: number): Promise<number>;
  getBurstAnomaly(entityType: RiskEntityType, entityId: string, hours: number): Promise<boolean>;
  getUniqueServicesCount(ipAddress: string): Promise<number>;
  getUniqueIpsCount(serviceName: string): Promise<number>;
  getUniqueServices(): Promise<string[]>;
  getUniqueIps(): Promise<string[]>;
}