import axios, { AxiosInstance } from "axios";
import { EventDTO } from "../../models/events/EventDTO";
import { IQueryAPI } from "./IQueryAPI";
import { EventStatisticsDTO } from "../../models/query/EventStatisticsDTO";
import { AlertStatisticsDTO } from "../../models/query/AlertStatisticsDTO";
import { DistributionDTO } from "../../models/query/DistributionDTO";

export class QueryAPI implements IQueryAPI {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getAllEvents(): Promise<EventDTO[]> {
    const response = await this.client.get<EventDTO[]>("/query/events");
    return response.data;
  }

  async getEventsByQuery(query: string): Promise<EventDTO[]> {
    const response = await this.client.get<EventDTO[]>("/query/events/search", {
      params: { q: query },
    });
    return response.data;
  }

  async getLastThreeEvents(): Promise<EventDTO[]> {
    const response = await this.client.get<EventDTO[]>(
      "/query/events/lastThree"
    );
    return response.data;
  }

  async getEventsCount(): Promise<number> {
    const response = await this.client.get<number>("/query/events/count");
    return response.data;
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
    const response = await this.client.get<DistributionDTO>(
      "query/distribution",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  }
}
