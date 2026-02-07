import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IAlertAPI } from "./IAlertAPI";
import { AlertDTO } from "../../models/alerts/AlertDTO";
import { AlertQueryDTO, PaginatedAlertsDTO } from "../../models/alerts/AlertQueryDTO";

export class AlertAPI implements IAlertAPI {
  private readonly axiosInstance: AxiosInstance;
  private readonly basePath = "alerts";
  private readonly baseSearchPath = "query/searchAlerts";
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_FIREWALL_PROXY_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async getAllAlerts(token: string): Promise<AlertDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.basePath}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.response;
  }

  async getAlertById(id: number, token: string): Promise<AlertDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.basePath}/${id}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.response;
  }

  async searchAlerts(query: AlertQueryDTO, token: string): Promise<PaginatedAlertsDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "query/searchAlerts",
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data: this.sanitizeQuery(query),
    });

    return response.data.response;
  }

  async resolveAlert(id: number, resolvedBy: string, status: string, token: string): Promise<AlertDTO> {

    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.basePath}/${id}/resolve`,
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      data: { resolvedBy, status },
    });

    return response.data.response;
  }

  async updateAlertStatus(id: number, status: string, token: string): Promise<AlertDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.basePath}/${id}/status`,
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      data: { status },
    });

    return response.data.response;
  }

  /** Uklanja undefined, null ili prazne vrednosti iz query parametara */
  private sanitizeQuery(query: AlertQueryDTO): Record<string, any> {
    const sanitized: Record<string, any> = {};
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        sanitized[key] = value;
      }
    });
    return sanitized;
  }
  


}