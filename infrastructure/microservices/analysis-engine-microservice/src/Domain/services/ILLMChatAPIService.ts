import { BusinessLLMInputDto } from "../types/businessInsights/BusinessDto";
import { BusinessResponseDto } from "../types/businessInsights/BusinessResponseDto";
import { CorrelationCandidate } from "../types/CorrelationCandidate";
import { EventDTO } from "../types/EventDTO";
import { Recommendation } from "../types/Recommendation";
import { RecommendationContextDto } from "../types/recommendationContext/RecommendationContext";
import { ScanIncidentDto } from "../types/ScanIncidentDto";
import { ScanIncidentResponse } from "../types/ScanIncidentResponse";

export interface ILLMChatAPIService {
  sendNormalizationPrompt(rawMessage: string): Promise<EventDTO>;
  sendCorrelationPrompt(rawMessage: string): Promise<CorrelationCandidate[]>;
  sendRecommendationsPrompt(context: RecommendationContextDto): Promise<Recommendation[]>;
  sendBusinessInsightsPrompt(businessData: BusinessLLMInputDto): Promise<BusinessResponseDto>;
  sendScanIncidentPrompt(incidentData: ScanIncidentDto): Promise<ScanIncidentResponse>;
}