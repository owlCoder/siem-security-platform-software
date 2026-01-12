import axios, { AxiosInstance } from "axios";
import { EventDTO } from "../../models/events/EventDTO";
import { IQueryAPI } from "./IQueryAPI";
import { DistributionDTO } from "../../models/query/DistributionDTO";
import { CountResponseDTO } from "../../models/query/CountResponseDTO";
import { TopSourceDTO } from "../../models/events/TopSourceDTO";
import { EventsResultDTO } from "../../models/events/EventsResultDTO";
import { HourlyStatisticsDTO } from "../../models/query/HourlyStatisticsDTO";
import { DistributionResponse } from "../../models/query/DistributionResponse";

export class QueryAPI implements IQueryAPI {
  private readonly client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    this.client =
      client ??
      axios.create({
        baseURL: import.meta.env.VITE_GATEWAY_URL,
        headers: {
          "Content-Type": "application/json",
        },
      });
  }
  async getTopEventSource(token: string): Promise<TopSourceDTO> {
    const response = await this.client.get<TopSourceDTO>("/siem/events/topSource", { //CHANGE ROUTE WITH QUERY 
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async getAllEvents(token: string): Promise<EventDTO[]> {
    const response = await this.client.get<EventDTO[]>("/siem/query/events", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async getEventsByQuery(query: string, token: string, targetPage: number, limit: number): Promise<EventsResultDTO> {
    const response = await this.client.get<EventsResultDTO>("/siem/query/search", {
      params: { q: query, p: targetPage, l: limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async getLastThreeEvents(token: string): Promise<EventDTO[]> {
    const response = await this.client.get<EventDTO[]>(
      "/siem/query/lastThreeEvents",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  async getEventsCount(token: string): Promise<number> {
    const response = await this.client.get<CountResponseDTO>("/siem/query/eventsCount", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.count;
  }

  async getInfoCount(token: string): Promise<number> {
    const response = await this.client.get<CountResponseDTO>("/siem/query/infoCount", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.count;
  }

  async getWarningCount(token: string): Promise<number> {
    const response = await this.client.get<CountResponseDTO>("/siem/query/warningCount", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.count;
  }

  async getErrorCount(token: string): Promise<number> {
    const response = await this.client.get<CountResponseDTO>("/siem/query/errorCount", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.count;
  }

  //statistics:
  async getEventStatistics(token: string): Promise<HourlyStatisticsDTO[]> {
    const response = await this.client.get<HourlyStatisticsDTO[]>(
      "/siem/query/statistics/events",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  }

  async getAlertStatistics(token: string): Promise<HourlyStatisticsDTO[]> {
    const response = await this.client.get<HourlyStatisticsDTO[]>(
      "/siem/query/statistics/alerts",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  }

  async getEventDistribution(token: string): Promise<DistributionDTO> {
    const response = await this.client.get<DistributionResponse>("/siem/query/distribution", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.distribution;
  }
}
