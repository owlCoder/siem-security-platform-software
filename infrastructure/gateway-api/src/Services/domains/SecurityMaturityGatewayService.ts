import axios, { AxiosInstance } from "axios";
import { ISecurityMaturityGatewayService } from "../../Domain/services/ISecurityMaturityGatewayService";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { defaultAxiosClient } from "../../Domain/constants/AxiosClient";
import { SecuirtyMaturityCurrentDTO } from "../../Domain/DTOs/SecurityMaturityCurrentDTO";
import { SecurityMaturityTrendDTO } from "../../Domain/DTOs/SecurityMaturityTrendDTO";
import { SecuirtyMaturityIncidentsByCategoryDTO } from "../../Domain/DTOs/SecurityMaturityIncidentsByCategoryDTO";
import { SecurityMaturityRecommendationDTO } from "../../Domain/DTOs/SecurityMaturityRecommendationDTO";

export class SecurityMaturityGatewayService implements ISecurityMaturityGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.securityMaturity,
      ...defaultAxiosClient,
    });
  }

  async getCurrent(): Promise<SecuirtyMaturityCurrentDTO> {
    const response =
      await this.client.get<SecuirtyMaturityCurrentDTO>("/current");

    return response.data;
  }

  async getTrend(
    metric: string,
    period: string,
  ): Promise<SecurityMaturityTrendDTO[]> {
    const response = await this.client.get<SecurityMaturityTrendDTO[]>(
      "/trend",
      {
        params: { metric, period },
      },
    );

    return response.data;
  }

  async getIncidentsByCategory(
    period: string,
  ): Promise<SecuirtyMaturityIncidentsByCategoryDTO[]> {
    const response = await this.client.get<
      SecuirtyMaturityIncidentsByCategoryDTO[]
    >("/incidents-by-category", {
      params: { period },
    });

    return response.data;
  }

  async getRecommendations(): Promise<SecurityMaturityRecommendationDTO[]> {
    const response =
      await this.client.get<SecurityMaturityRecommendationDTO[]>(
        "/recommendations",
      );

    return response.data;
  }
}
