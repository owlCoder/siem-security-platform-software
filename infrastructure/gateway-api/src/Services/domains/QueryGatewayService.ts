import axios, { AxiosInstance } from "axios";
import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { defaultAxiosClient } from "../../Domain/constants/AxiosClient";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { IQueryGatewayService } from "../../Domain/services/IQueryGatewayService";
import { EventsResultDTO } from "../../Domain/DTOs/EventsResultDTO";
import { DistributionDTO } from "../../Domain/DTOs/DistributionDTO";
import { HourlyStatisticsDTO } from "../../Domain/DTOs/HourlyStatisticsDTO";
import { RiskEntityType } from "../../Domain/enums/RiskEntityType";


export class QueryGatewayService implements IQueryGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.query,
      ...defaultAxiosClient
    });
  }

  async searchEvents(query: string, targetPage: number, limit: number): Promise<EventsResultDTO> {
    const response = await this.client.get<EventsResultDTO>("/query/search", {
      params: { q: query, p: targetPage, l: limit },
    });
    return response.data;
  }

  async getOldEvents(hours: number): Promise<EventDTO[]> {
    const response = await this.client.get<any[]>(`/query/oldEvents/${hours}`);
    return response.data;
  }

  async getLastThreeEvents(): Promise<EventDTO[]> {
    const response = await this.client.get<any[]>(`/query/lastThreeEvents`);
    return response.data;
  }

  async getAllEvents(): Promise<EventDTO[]> {
    const response = await this.client.get<any[]>("/query/events");
    return response.data;
  }

  async getEventsCount(): Promise<number> {
    const response = await this.client.get<{ count: number }>("/query/eventsCount");
    return response.data.count;
  }

  async getInfoCount(): Promise<number> {
    const response = await this.client.get<{ count: number }>("/query/infoCount");
    return response.data.count;
  }

  async getWarningCount(): Promise<number> {
    const response = await this.client.get<{ count: number }>("/query/warningCount");
    return response.data.count;
  }

  async getErrorCount(): Promise<number> {
    const response = await this.client.get<{ count: number }>("/query/errorCount");
    return response.data.count;
  }

  async getEventDistribution(): Promise<DistributionDTO> {
    const response = await this.client.get<DistributionDTO>("/query/eventDistribution");
    return response.data;
  }

  async getEventStatistics(): Promise<HourlyStatisticsDTO[]> {
    const response = await this.client.get<HourlyStatisticsDTO[]>("/query/statistics/events");
    return response.data;
  }

  async getAlertStatistics(): Promise<HourlyStatisticsDTO[]> {
    const response = await this.client.get<HourlyStatisticsDTO[]>("/query/statistics/alerts");
    return response.data;
  }

  async getTotalEventCount(entityType: RiskEntityType, entityId: string): Promise<number> {
    const response = await this.client.get<number>("/query/statistics/totalEventCount", {
      params: { entityType: entityType, entityId: entityId },
    });
    return response.data;
  }

  async getErrorEventCount(entityType: RiskEntityType, entityId: string, hours: number): Promise<number> {
    const response = await this.client.get<number>("/query/statistics/errorEventCount", {
      params: { entityType: entityType, entityId: entityId, hours: hours },
    });
    return response.data;
  }
  
  async getEventRate(entityType: RiskEntityType, entityId: string, hours: number): Promise<number> {
    const response = await this.client.get<number>("/query/statistics/eventRate", {
      params: { entityType: entityType, entityId: entityId, hours: hours },
    });
    return response.data;
  }
  
  async getAlertsCountBySeverity(entityType: RiskEntityType, entityId: string): Promise<Map<string, number>> {
    const response = await this.client.get<Map<string, number>>("/query/statistics/alertsCountBySeverity", {
      params: { entityType: entityType, entityId: entityId },
    });
    const obj = response.data;
    return new Map(Object.entries(obj));;
  }
  
  async getCriticalAlertsCount(entityType: RiskEntityType, entityId: string): Promise<number> {
    const response = await this.client.get<number>("/query/statistics/criticalAlertsCount", {
      params: { entityType: entityType, entityId: entityId },
    });
    return response.data;
  }
  
  async getAnomalyRate(entityType: RiskEntityType, entityId: string, hours: number): Promise<number> {
    const response = await this.client.get<number>("/query/statistics/anomalyRate", {
      params: { entityType: entityType, entityId: entityId, hours: hours },
    });
    return response.data;
  }
  
  async getBurstAnomaly(entityType: RiskEntityType, entityId: string, hours: number): Promise<boolean> {
    const response = await this.client.get<boolean>("/query/statistics/burstAnomaly", {
      params: { entityType: entityType, entityId: entityId, hours: hours },
    });
    return response.data;
  }
  
  async getUniqueServicesCount(ipAddress: string): Promise<number> {
    const response = await this.client.get<number>("/query/statistics/uniqueServicesCount", {
      params: { ipAddress: ipAddress },
    });
    return response.data;
  }
  
  async getUniqueIpsCount(serviceName: string): Promise<number> {
    const response = await this.client.get<number>("/query/statistics/uniqueIpsCount", {
      params: { serviceName: serviceName },
    });
    return response.data;
  }

  async getUniqueServices(): Promise<string[]> {
    const response = await this.client.get<string[]>("/query/statistics/uniqueServices", {});
    return response.data;
  }
  
  async getUniqueIps(): Promise<string[]> {
    const response = await this.client.get<string[]>("/query/statistics/uniqueIps", {});
    return response.data;
  }
}