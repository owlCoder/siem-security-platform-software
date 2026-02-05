import axios, { AxiosInstance } from "axios";
import { IStatusMonitorAPI } from "./IStatusMonitorAPI";
import { ServiceStatusDTO } from "../../models/status-monitor/ServiceStatusDTO";
import { IncidentDTO } from "../../models/status-monitor/IncidentDTO";
import { ServiceStatsDTO } from "../../models/status-monitor/ServiceStatsDTO";

export class StatusMonitorAPI implements IStatusMonitorAPI {
    private readonly client: AxiosInstance;

    constructor(baseUrl: string) {
        this.client = axios.create({ baseURL: baseUrl });
    }

    private getHeaders(token: string) {
        return {
            headers: { Authorization: `Bearer ${token}` }
        };
    }

    async getOverallStatus(token: string): Promise<ServiceStatusDTO[]> {
        const response = await this.client.get<ServiceStatusDTO[]>("/status", this.getHeaders(token));
        return response.data;
    }

    async getAllIncidents(token: string): Promise<IncidentDTO[]> {
        const response = await this.client.get<IncidentDTO[]>("/incidents", this.getHeaders(token));
        return response.data;
    }

    async getServiceStats(serviceName: string, hours: number, token: string): Promise<ServiceStatsDTO> {
        const response = await this.client.get<ServiceStatsDTO>(`/stats/${serviceName}`, {
            ...this.getHeaders(token),
            params: { hours }
        });
        return response.data;
    }
}