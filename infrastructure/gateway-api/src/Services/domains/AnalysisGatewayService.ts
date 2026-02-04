import axios, { AxiosInstance } from "axios";
import { NormalizedEventDTO } from "../../Domain/DTOs/NormalizedEventDTO";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { defaultAxiosClient } from "../../Domain/constants/AxiosClient";
import { IAnalysisGatewayService } from "../../Domain/services/IAnalysisGatewayService";
import { BusinessLLMInputDto } from "../../Domain/DTOs/businessInsights/BusinessLLMInputDto";
import { BusinessResponseDto } from "../../Domain/DTOs/businessInsights/BusinessResponseDto";

export class AnalysisGatewayService implements IAnalysisGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.analysisEngine,
      ...defaultAxiosClient
    });
  }

  async normalize(rawMessage: string): Promise<NormalizedEventDTO> {
    const response = await this.client.post<{ eventData: NormalizedEventDTO }>(
      "/AnalysisEngine/processEvent",
      { message: rawMessage },
    );
    return response.data.eventData;
  }

  async deleteCorrelationsByEventIds(eventIds: number[]): Promise<number> {
    const response = await this.client.post<{ deletedCount: number }>(
      "/AnalysisEngine/correlations/deleteByEventIds",
      { eventIds },
    );
    const data = response.data;

    if (!data || typeof data.deletedCount !== "number") {
      console.error("Invalid response from correlation service");
    }

    return data.deletedCount;
  }

  async analysisEngineGenerateBusinessInsights(businessLLMInput: BusinessLLMInputDto): Promise<BusinessResponseDto>{
    const response = await this.client.post<BusinessResponseDto>(
      "/AnalysisEngine/generateBusinessInsights", businessLLMInput, { timeout: 60000 } );

      return response.data;
  }
}