import axios, { AxiosInstance } from "axios";
import { InsiderThreatDTO } from "../../Domain/DTOs/InsiderThreatDTO";
import { UserRiskProfileDTO } from "../../Domain/DTOs/UserRiskProfileDTO";
import { UserRiskAnalysisDTO } from "../../Domain/DTOs/UserRiskAnalysisDTO";
import { ThreatQueryDTO, PaginatedThreatsDTO } from "../../Domain/DTOs/ThreatQueryDTO";
import { defaultAxiosClient } from "../../Domain/constants/AxiosClient";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { IInsiderThreatGatewayService } from "../../Domain/services/IInsiderThreatGatewayService";

export class InsiderThreatGatewayService implements IInsiderThreatGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.insiderThreat,
      ...defaultAxiosClient
    });
  }

  // =============== THREAT OPERATIONS ===============

  async getAllThreats(): Promise<InsiderThreatDTO[]> {
    const response = await this.client.get<InsiderThreatDTO[]>("/threats");
    return response.data;
  }

  async getThreatById(id: number): Promise<InsiderThreatDTO> {
    const response = await this.client.get<InsiderThreatDTO>(`/threats/${id}`);
    return response.data;
  }

  async getThreatsByUserId(userId: string): Promise<InsiderThreatDTO[]> {
    const response = await this.client.get<InsiderThreatDTO[]>(`/threats/user/${userId}`);
    return response.data;
  }

  async getUnresolvedThreats(): Promise<InsiderThreatDTO[]> {
    const response = await this.client.get<InsiderThreatDTO[]>("/threats/unresolved");
    return response.data;
  }

  async searchThreats(query: ThreatQueryDTO): Promise<PaginatedThreatsDTO> {
    const response = await this.client.get<PaginatedThreatsDTO>("/threats/search", {
      params: query,
    });
    return response.data;
  }

  async resolveThreat(id: number, resolvedBy: string, resolutionNotes?: string): Promise<InsiderThreatDTO> {
    const response = await this.client.put<InsiderThreatDTO>(`/threats/${id}/resolve`, {
      resolvedBy,
      resolutionNotes
    });
    return response.data;
  }

  // =============== USER RISK OPERATIONS ===============

  async getAllUserRiskProfiles(): Promise<UserRiskProfileDTO[]> {
    const response = await this.client.get<UserRiskProfileDTO[]>("/risk/users");
    return response.data;
  }

  async getHighRiskUsers(): Promise<UserRiskProfileDTO[]> {
    const response = await this.client.get<UserRiskProfileDTO[]>("/risk/users/high-risk");
    return response.data;
  }

  async getUserRiskProfile(userId: string): Promise<UserRiskProfileDTO> {
    const response = await this.client.get<UserRiskProfileDTO>(`/risk/users/${userId}`);
    return response.data;
  }

  async getUserRiskAnalysis(userId: string): Promise<UserRiskAnalysisDTO> {
    const response = await this.client.get<UserRiskAnalysisDTO>(`/risk/users/${userId}/analysis`);
    return response.data;
  }

  async recalculateUserRisk(userId: string): Promise<UserRiskProfileDTO> {
    const response = await this.client.post<UserRiskProfileDTO>(`/risk/users/${userId}/recalculate`);
    return response.data;
  }
}