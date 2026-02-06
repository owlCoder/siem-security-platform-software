import dotenv from "dotenv";
import { ILLMChatAPIService } from "../Domain/services/ILLMChatAPIService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { ChatMessage } from "../Domain/types/ChatMessage";
import { EventDTO } from "../Domain/types/EventDTO";
import { JsonObject } from "../Domain/types/JsonValue";
import { parseEventDTO } from "../Infrastructure/parsers/EventParser";
import { parseCorrelationCandidates } from "../Infrastructure/parsers/CorrelationParser";
import { EventResponseSchema } from "../Infrastructure/schemas/EventResponse.schema";
import { CorrelationResponseSchema } from "../Infrastructure/schemas/CorrelationResponse.schema";
import { NORMALIZATION_PROMPT } from "../Infrastructure/prompts/normalization.prompt";
import { CORRELATION_PROMPT } from "../Infrastructure/prompts/correlation.prompt";
import { CorrelationCandidate } from "../Domain/types/CorrelationCandidate";
import { Recommendation } from "../Domain/types/Recommendation";
import { RecommendationResponseSchema } from "../Infrastructure/schemas/RecommendationResponse.schema";
import { RecommendationContextDto } from "../Domain/types/recommendationContext/RecommendationContext";
import { RECOMMENDATIONS_PROMPT } from "../Infrastructure/prompts/recommendation.prompt";
import { parseRecommendations } from "../Infrastructure/parsers/RecommendationParser";
import { sendChatCompletion } from "../Infrastructure/helpers/sendChatCompletion";
import { emptyEvent } from "../Infrastructure/helpers/emptyEvent";
import { BusinessLLMInputDto } from "../Domain/types/businessInsights/BusinessDto";
import { BusinessResponseDto } from "../Domain/types/businessInsights/BusinessResponseDto";
import { BUSINESS_INSIGHTS_PROMPT } from "../Infrastructure/prompts/businessInsightsPrompt";
import { BusinessInsightsResponseSchema } from "../Infrastructure/schemas/BusinessInsightsResponse.schema";
import { parseBusinessInsights } from "../Infrastructure/parsers/BusinessInsightsParser";
import { ScanIncidentDto } from "../Domain/types/ScanIncidentDto";
import { SCAN_INCIDENT_PROMPT } from "../Infrastructure/prompts/scanIncidentPrompt";
import { ScanIncidentResponse } from "../Domain/types/ScanIncidentResponse";
import { parseScanIncident } from "../Infrastructure/parsers/ScanIncidentParser";

dotenv.config();

export class LLMChatAPIService implements ILLMChatAPIService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly normalizationModelId: string;
  private readonly correlationModelId: string;
  private readonly recommendationModelId: string;

  private readonly timeoutMs = 60000;
  private readonly maxRetries = 3;

  public constructor(private readonly loggerService: ILoggerService) {
    this.apiUrl = (process.env.LLM_API_URL ?? "").replace(/\/+$/, "");
    this.apiKey = process.env.GEMINI_API_KEY ?? "";
    this.normalizationModelId = process.env.GEMINI_NORMALIZATION_MODEL_ID ?? "";
    this.correlationModelId = process.env.GEMINI_CORRELATION_MODEL_ID ?? "";
    this.recommendationModelId = process.env.GEMINI_RECOMMENDATION_MODEL_ID ?? "";


    void this.loggerService.info("[LLM] Service initialized", {
      apiUrl: this.apiUrl,
      normalizationModelId: this.normalizationModelId,
      correlationModelId: this.correlationModelId,
      recommendationModelId: this.recommendationModelId,
    });
  }

  public async sendScanIncidentPrompt(incidentData: ScanIncidentDto): Promise<ScanIncidentResponse> {
    const json = JSON.stringify(incidentData);
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `${SCAN_INCIDENT_PROMPT}${json}`.trim(),
      },
    ];

    const raw = await sendChatCompletion(
      this.apiUrl,
      this.apiKey,
      this.recommendationModelId,
      messages,
      this.loggerService,
      this.timeoutMs,
      this.maxRetries,
    );

    if(!raw.ok){
      await this.loggerService.warn("[LLM] ScanIncident failed", { error: raw.error, modelId: this.recommendationModelId});
      return { summary: "Incident analysis temporarily unavailable" };
    }

    return parseScanIncident(raw.value);
  }

  public async sendBusinessInsightsPrompt(businessData: BusinessLLMInputDto): Promise<BusinessResponseDto> {
    const json = JSON.stringify(businessData);
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `${BUSINESS_INSIGHTS_PROMPT}${json}`.trim(),
      },
    ];

    const raw = await sendChatCompletion(
      this.apiUrl,
      this.apiKey,
      this.recommendationModelId,
      messages,
      this.loggerService,
      this.timeoutMs,
      this.maxRetries,
      BusinessInsightsResponseSchema as JsonObject
    );

    if (!raw.ok) {
      await this.loggerService.warn("[LLM] BusinessInsights failed: LLM request/parse error", {
        error: raw.error,
        modelId: this.recommendationModelId,
      });
      return { summary: "Business insights are temporarily unavalilable", recommendations: [], issues: [] };
    }

    return parseBusinessInsights(raw.value);
  }

  // =========================================================
  // RECOMMENDATIONS (Recommendation[])
  // =========================================================
  public async sendRecommendationsPrompt(
    context: RecommendationContextDto
  ): Promise<Recommendation[]> {
    const json = JSON.stringify(context);
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `${RECOMMENDATIONS_PROMPT}${json}`.trim(),
      },
    ];
    const raw = await sendChatCompletion(
      this.apiUrl,
      this.apiKey,
      this.recommendationModelId,
      messages,
      this.loggerService,
      this.timeoutMs,
      this.maxRetries,
      RecommendationResponseSchema as JsonObject
    );

    if (!raw.ok) {
      await this.loggerService.warn("[LLM] Recommendations failed: LLM request/parse error", {
        error: raw.error,
        modelId: this.recommendationModelId,
      });
      return [];
    }

    const parsed = parseRecommendations(raw.value);

    if (parsed.length === 0) {
      await this.loggerService.warn("[LLM] Recommendations failed: schema validation returned 0 items", {
        modelId: this.recommendationModelId,
        raw: raw.value,
      });
    }

    return parsed;
  }

  // =========================================================
  // NORMALIZATION (EventDTO)
  // =========================================================
  public async sendNormalizationPrompt(rawLog: string): Promise<EventDTO> {
    const input = typeof rawLog === "string" ? rawLog.trim() : "";
    if (input.length === 0) {
      await this.loggerService.warn("[LLM] Normalization skipped: empty input");
      return emptyEvent();
    }

    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `${NORMALIZATION_PROMPT}${input}`.trim(),
      },
    ];

    const raw = await sendChatCompletion(
      this.apiUrl,
      this.apiKey,
      this.normalizationModelId,
      messages,
      this.loggerService,
      this.timeoutMs,
      this.maxRetries,
      EventResponseSchema as JsonObject
    );

    if (!raw.ok) {
      await this.loggerService.warn("[LLM] Normalization failed: LLM request/parse error", {
        error: raw.error,
        modelId: this.normalizationModelId,
      });
      return emptyEvent();
    }

    const parsed = parseEventDTO(raw.value);
    if (!parsed.ok) {
      await this.loggerService.warn("[LLM] Normalization failed schema validation", {
        error: parsed.error,
        modelId: this.normalizationModelId,
        raw: raw.value,
      });
      return emptyEvent();
    }

    return parsed.value;
  }

  // =========================================================
  // CORRELATION (CorrelationDTO[])
  // =========================================================
  public async sendCorrelationPrompt(rawMessage: string): Promise<CorrelationCandidate[]> {
    const input = typeof rawMessage === "string" ? rawMessage.trim() : "";
    if (input.length === 0) {
      await this.loggerService.warn("[LLM] Correlation skipped: empty input");
      return [];
    }

    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `${CORRELATION_PROMPT}${input}`.trim(),
      },
    ];

    const raw = await sendChatCompletion(
      this.apiUrl,
      this.apiKey,
      this.correlationModelId,
      messages,
      this.loggerService,
      this.timeoutMs,
      this.maxRetries,
      CorrelationResponseSchema as JsonObject
    );

    if (!raw.ok) {
      await this.loggerService.warn("[LLM] Correlation failed: LLM request/parse error", {
        error: raw.error,
        modelId: this.correlationModelId,
      });
      return [];
    }

    return parseCorrelationCandidates(raw.value);
  }
}
