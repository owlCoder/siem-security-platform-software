import axios, { AxiosInstance, AxiosResponse } from "axios";
import { RiskEntityType } from "../../enums/RiskEntityType";
import { IRiskScoreAPI } from "./IRiskScoreAPI";

export class RiskScoreAPI implements IRiskScoreAPI {
    private readonly axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: import.meta.env.VITE_FIREWALL_URL,
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
        });
    }

    async calculateScore(token: string, entityType: RiskEntityType, entityId: string, hours: number): Promise<number> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: "riskScore/calculateScore",
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            data: { entityType, entityId, hours },
        });
        return response.data.response;
    }

    async getLatestScore(token: string, entityType: RiskEntityType, entityId: string): Promise<number | null> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: "riskScore/getLatestScore",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            params: { entityType, entityId },
        });
        return response.data.response;
    }

    async getScoreHistory(token: string, entityType: RiskEntityType, entityId: string, hours: number): Promise<{ score: number; createdAt: Date }[]> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: "riskScore/getScoreHistory",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            params: { entityType, entityId, hours },
        });
        return response.data.response;
    }

    async getGlobalScore(token: string): Promise<number> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: "riskScore/getGlobalScore",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.response;
    }
}