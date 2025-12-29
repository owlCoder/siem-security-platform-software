import axios, { AxiosInstance } from "axios";
import { IAlertAPI } from "./IAlertAPI";
import { AlertDTO } from "../../models/alerts/AlertDTO";
import { AlertQueryDTO, PaginatedAlertsDTO } from "../../models/alerts/AlertQueryDTO";

export class AlertAPI implements IAlertAPI {
  private readonly client: AxiosInstance;
  private readonly basePath = "/siem/alerts";

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 30000, // sprečava beskonačne requeste
    });
  }

  async getAllAlerts(token: string): Promise<AlertDTO[]> {
    const response = await this.client.get<AlertDTO[]>(this.basePath, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async getAlertById(id: number, token: string): Promise<AlertDTO> {
    const response = await this.client.get<AlertDTO>(`${this.basePath}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  async searchAlerts(query: AlertQueryDTO, token: string): Promise<PaginatedAlertsDTO> {
    const response = await this.client.get<PaginatedAlertsDTO>(`${this.basePath}/search`, {
      headers: { Authorization: `Bearer ${token}` },
      params: this.sanitizeQuery(query),
    });
    return response.data;
  }

  async resolveAlert(id: number, resolvedBy: string, status: string, token: string): Promise<AlertDTO> {
    const response = await this.client.put<AlertDTO>(`${this.basePath}/${id}/resolve`, 
      { resolvedBy, status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async updateAlertStatus(id: number, status: string, token: string): Promise<AlertDTO> {
    const response = await this.client.put<AlertDTO>(`${this.basePath}/${id}/status`, 
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
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