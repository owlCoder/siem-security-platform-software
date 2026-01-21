import axios, { AxiosInstance } from "axios";
import { RiskEntityType } from "../../enums/RiskEntityType";
import { IRiskScoreAPI } from "./IRiskScoreAPI";

export class RiskScoreAPI implements IRiskScoreAPI {
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

    async calculateScore(token: string, entityType: RiskEntityType, entityId: string, hours: number): Promise<number> {
        const response = await this.client.post<number>("/siem/riskScore/calculateScore", {
            entityType, entityId, hours,
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
    
    async getLatestScore(token: string, entityType: RiskEntityType, entityId: string): Promise<number | null> {
        const response = await this.client.get<number | null>("/siem/riskScore/getLatestScore", {
            params: { entityType: entityType, entityId: entityId},
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
    
    async getScoreHistory(token: string, entityType: RiskEntityType, entityId: string, hours: number): Promise<{ score: number; createdAt: Date; }[]> {
         const response = await this.client.get<{score: number; createdAt: Date;}[]>("/siem/riskScore/getScoreHistory", {
            params: { entityType: entityType, entityId: entityId, hours: hours},
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
    
    async getGlobalScore(token: string): Promise<number> {
         const response = await this.client.get<number>("/siem/riskScore/getGlobalScore", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
}