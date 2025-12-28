import axios, { AxiosInstance } from "axios";
import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { defaultAxiosClient } from "../../Infrastructure/config/AxiosClient";
import { serviceConfig } from "../../Infrastructure/config/ServiceConfig";
import { IQueryGatewayService } from "../interfaces/IQueryGatewayService";

export class QueryGatewayService implements IQueryGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.query,
      ...defaultAxiosClient
    });
  }

  async searchEvents(query: string): Promise<EventDTO[]> {
    const response = await this.client.get<any[]>("/query/search", {
      params: { q: query },
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
}