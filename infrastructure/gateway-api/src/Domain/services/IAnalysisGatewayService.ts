import { BusinessLLMInputDto } from "../DTOs/businessInsights/BusinessLLMInputDto";
import { BusinessResponseDto } from "../DTOs/businessInsights/BusinessResponseDto";
import { NormalizedEventDTO } from "../DTOs/NormalizedEventDTO";

export interface IAnalysisGatewayService {
  normalize(rawMessage: string): Promise<NormalizedEventDTO>;
  deleteCorrelationsByEventIds(eventIds: number[]): Promise<number>;
  analysisEngineGenerateBusinessInsights(businessLLMInput: BusinessLLMInputDto): Promise<BusinessResponseDto>;
}