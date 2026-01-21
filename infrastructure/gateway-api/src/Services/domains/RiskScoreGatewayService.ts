import axios, { AxiosInstance } from "axios";
import { RiskEntityType } from "../../Domain/enums/RiskEntityType";
import { IRiskScoreGatewayService } from "../../Domain/services/IRiskScoreGatewayService";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { defaultAxiosClient } from "../../Domain/constants/AxiosClient";

export class RiskScoreGatewayService implements IRiskScoreGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.riskScore,
      ...defaultAxiosClient
    });
  }

    async calculateScore(entityType: RiskEntityType, entityId: string, hours: number): Promise<number> {
        const response = await this.client.post<number>("/riskScore/calculate", {
            entityType, entityId, hours
        });
        return response.data;
    }

    async getLatestScore(entityType: RiskEntityType, entityId: string): Promise<number | null> {
        const response = await this.client.get<number | null>("/riskScore/getLatestScore", {
            params: { entityType: entityType, entityId: entityId},
        });
        return response.data;
    }

    async getScoreHistory(entityType: RiskEntityType, entityId: string, hours: number): Promise<{ score: number; createdAt: Date; }[]> {
        const response = await this.client.get<{score: number; createdAt: Date;}[]>("/riskScore/getScoreHistory", {
            params: { entityType: entityType, entityId: entityId, hours: hours},
        });
        return response.data;
    }

    async getGlobalScore(): Promise<number> {
        const response = await this.client.get<number>("/riskScore/getGlobalScore", {});
        return response.data;
    }
}
