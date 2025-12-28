import axios, { AxiosInstance } from "axios";
import { AlertDTO } from "../../Domain/DTOs/AlertDTO";
import { AlertQueryDTO } from "../../Domain/DTOs/AlertQueryDTO";
import { PaginatedAlertsDTO } from "../../Domain/DTOs/PaginatedAlertsDTO";
import { defaultAxiosClient } from "../../Infrastructure/config/AxiosClient";
import { serviceConfig } from "../../Infrastructure/config/ServiceConfig";
import { IAlertGatewayService } from "../interfaces/IAlertGatewayService";

export class AlertGatewayService implements IAlertGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.alert,
      ...defaultAxiosClient
    });
  }

  async getAllAlerts(): Promise<AlertDTO[]> {
    const response = await this.client.get<AlertDTO[]>("/alerts");
    return response.data;
  }

  async getAlertById(id: number): Promise<AlertDTO> {
    const response = await this.client.get<AlertDTO>(`/alerts/${id}`);
    return response.data;
  }

  async searchAlerts(query: AlertQueryDTO): Promise<PaginatedAlertsDTO> {
    const response = await this.client.get<PaginatedAlertsDTO>("/alerts/search", {
      params: query,
    });
    return response.data;
  }

  async resolveAlert(id: number, resolvedBy: string, status: string): Promise<AlertDTO> {
    const response = await this.client.put<AlertDTO>(`/alerts/${id}/resolve`, {
      resolvedBy,
      status,
    });
    return response.data;
  }

  async updateAlertStatus(id: number, status: string): Promise<AlertDTO> {
    const response = await this.client.put<AlertDTO>(`/alerts/${id}/status`, { status });
    return response.data;
  }
}