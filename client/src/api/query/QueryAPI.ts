import axios, { AxiosInstance } from "axios";
import { EventDTO } from "../../models/events/EventDTO";
import { IQueryAPI } from "./IQueryAPI";
import { EventStatisticsDTO } from "../../models/query/EventStatisticsDTO";
import { AlertStatisticsDTO } from "../../models/query/AlertStatisticsDTO";
import { DistributionDTO } from "../../models/query/DistributionDTO";
import { CountResponseDTO } from "../../models/query/CountResponseDTO";
import { TopSourceDTO } from "../../models/events/TopSourceDTO";

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

  async getEventsByQuery(query: string, token: string): Promise<EventDTO[]> {
    const response = await this.client.get<EventDTO[]>("/siem/query/search", {
      params: { q: query },
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
  async getEventStatistics(token: string): Promise<EventStatisticsDTO[]> {
    const response = await this.client.get<EventStatisticsDTO[]>(
      "/query/statistics/events",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  }

  async getAlertStatistics(token: string): Promise<AlertStatisticsDTO[]> {
    const response = await this.client.get<AlertStatisticsDTO[]>(
      "/query/statistics/alert",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  }

  async getEventDistribution(token: string): Promise<DistributionDTO> {
    const response = await this.client.get<DistributionDTO>("/query/distribution", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  }
}
