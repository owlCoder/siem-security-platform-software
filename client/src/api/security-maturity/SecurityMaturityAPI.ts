import axios, { AxiosInstance, AxiosResponse } from "axios";
import { SecuirtyMaturityCurrentDTO } from "../../models/security-maturity/SecurityMaturityCurrentDTO";
import { SecuirtyMaturityIncidentsByCategoryDTO } from "../../models/security-maturity/SecurityMaturityIncidentsByCategory";
import { SecurityMaturityTrendDTO } from "../../models/security-maturity/SecurityMaturityTrendDTO";
import { ISecurityMaturityAPI } from "./ISecurityMaturityAPI";
import { SecurityMaturityRecommendationDTO } from "../../models/security-maturity/SecurityMaturityRecommendationDTO";

export class SecurityMaturityAPI implements ISecurityMaturityAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_FIREWALL_PROXY_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  async getCurrent(token: string): Promise<SecuirtyMaturityCurrentDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "security-maturity/current",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.response;
  }

  async getTrend(
    token: string,
    metric: string,
    period: string,
  ): Promise<SecurityMaturityTrendDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "security-maturity/trend",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      params: { metric, period },
    });

    return response.data.response;
  }

  async getIncidentsByCategory(
    token: string,
    period: string,
  ): Promise<SecuirtyMaturityIncidentsByCategoryDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "security-maturity/incidents-by-category",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      params: { period },
    });

    return response.data.response;
  }

  async getRecommendations(
    token: string,
  ): Promise<SecurityMaturityRecommendationDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: "security-maturity/recommendations",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.response;
  }
}
