import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IQueryAPI } from "./IQueryAPI";
import { EventDTO } from "../../models/events/EventDTO";
import { DistributionDTO } from "../../models/query/DistributionDTO";
import { TopSourceDTO } from "../../models/events/TopSourceDTO";
import { EventsResultDTO } from "../../models/events/EventsResultDTO";
import { HourlyStatisticsDTO } from "../../models/query/HourlyStatisticsDTO";

export class QueryAPI implements IQueryAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_FIREWALL_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async getTopEventSource(token: string): Promise<TopSourceDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "events/topSource",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getAllEvents(token: string): Promise<EventDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/events",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getEventsByQuery(query: string, token: string, targetPage: number, limit: number): Promise<EventsResultDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/search",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, p: targetPage, l: limit },
    });
    return response.data.response;
  }

  async getLastThreeEvents(token: string): Promise<EventDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/lastThreeEvents",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getEventsCount(token: string): Promise<number> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/eventsCount",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response.count;
  }

  async getInfoCount(token: string): Promise<number> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/infoCount",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response.count;
  }

  async getWarningCount(token: string): Promise<number> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/warningCount",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response.count;
  }

  async getErrorCount(token: string): Promise<number> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/errorCount",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response.count;
  }

  async getEventStatistics(token: string): Promise<HourlyStatisticsDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/statistics/events",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getAlertStatistics(token: string): Promise<HourlyStatisticsDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/statistics/alerts",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getEventDistribution(token: string): Promise<DistributionDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/distribution",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response.distribution;
  }

  async getUniqueServices(token: string): Promise<string[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/uniqueServices",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getUniqueIps(token: string): Promise<string[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/uniqueIps",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }
}