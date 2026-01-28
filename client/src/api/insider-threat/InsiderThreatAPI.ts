import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IInsiderThreatAPI } from "./IInsiderThreatAPI";
import { InsiderThreatDTO } from "../../models/insider-threat/InsiderThreatDTO";
import { PaginatedThreatsDTO, ThreatQueryDTO } from "../../models/insider-threat/ThreatQueryDTO";
import { UserRiskProfileDTO } from "../../models/insider-threat/UserRiskProfileDTO";
import { UserRiskAnalysisDTO } from "../../models/insider-threat/UserRiskAnalysisDTO";

export class InsiderThreatAPI implements IInsiderThreatAPI {
  private readonly axiosInstance: AxiosInstance;
  private readonly basePath = "api/v1/threats"; 
  private readonly riskPath = "api/v1/user-risk-profiles"; 

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_FIREWALL_PROXY_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
  }

  // =============== THREAT METHODS ===============

  async getAllThreats(token: string): Promise<InsiderThreatDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: this.basePath,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getThreatById(id: number, token: string): Promise<InsiderThreatDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.basePath}/${id}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getThreatsByUserId(userId: string, token: string): Promise<InsiderThreatDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.basePath}/user/${userId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getUnresolvedThreats(token: string): Promise<InsiderThreatDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.basePath}/unresolved`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async searchThreats(query: ThreatQueryDTO, token: string): Promise<PaginatedThreatsDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.basePath}/search`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      params: this.sanitizeQuery(query),
    });
    return response.data.response;
  }

  async resolveThreat(
    id: number,
    resolvedBy: string,
    resolutionNotes: string | undefined,
    token: string
  ): Promise<InsiderThreatDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.basePath}/${id}/resolve`,
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      data: { resolvedBy, resolutionNotes },
    });
    return response.data.response;
  }

  // =============== USER RISK METHODS ===============

  async getAllUserRiskProfiles(token: string): Promise<UserRiskProfileDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: this.riskPath, 
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getHighRiskUsers(token: string): Promise<UserRiskProfileDTO[]> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.riskPath}/high-risk`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getUserRiskProfile(userId: string, token: string): Promise<UserRiskProfileDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.riskPath}/${userId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async getUserRiskAnalysis(userId: string, token: string): Promise<UserRiskAnalysisDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.riskPath}/${userId}/analysis`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.response;
  }

  async recalculateUserRisk(userId: string, token: string): Promise<UserRiskProfileDTO> {
    const response: AxiosResponse = await this.axiosInstance.post("", {
      url: `${this.riskPath}/${userId}/recalculate`,
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });
    return response.data.response;
  }

  // =============== HELPER ===============

  private sanitizeQuery(query: ThreatQueryDTO): Record<string, any> {
    const sanitized: Record<string, any> = {};
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        sanitized[key] = value;
      }
    });
    return sanitized;
  }
}