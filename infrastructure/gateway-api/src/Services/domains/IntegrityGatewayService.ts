import axios, { AxiosInstance } from "axios";
import { IIntegrityGatewayService } from "../../Domain/services/IIntegrityGatewayService";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { defaultAxiosClient } from "../../Domain/constants/AxiosClient";

export class IntegrityGatewayService implements IIntegrityGatewayService {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
      baseURL: serviceConfig.query,
      ...defaultAxiosClient
    });
        //this.apiUrl = process.env.INTEGRITY_SERVICE_API || "http://localhost:3005/api/v1";
    }

    async getStatus(): Promise<any> {
        const response = await this.client.get<any[]>(`/integrity/status`);
        return response.data;
    }

    async getCompromised(): Promise<any> {
        const response = await this.client.get<any[]>(`/integrity/compromised`);
        return response.data;
    }

    async verify(): Promise<any> {
        const response = await this.client.get<any[]>(`/integrity/verify`);
        return response.data;
    }
}