import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { ILLMChatAPIService } from "../Domain/Services/ILLMChatAPIService";
import { ChatMessage } from "../Domain/types/ChatMessage";
import { EventDTO } from "../Domain/types/EventDTO";
import { CorrelationDTO } from "../Domain/types/CorrelationDTO";
import { extractJson } from "../Infrastructure/parsers/extractJson";
import { parseEventDTO } from "../Infrastructure/parsers/EventParser";
import { parseCorrelationCandidates } from "../Infrastructure/parsers/CorrelationParser";
import { EventResponseSchema } from "../Infrastructure/schemas/EventResponse.schema";
import { CorrelationResponseSchema } from "../Infrastructure/schemas/CorrelationResponse.schema";
dotenv.config();

export class LLMChatAPIService implements ILLMChatAPIService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly normalizationModelId: string;
  private readonly correlationModelId: string;

  private readonly timeoutMs = 60000;
  private readonly maxRetries = 3;

  constructor() {
    this.apiUrl = (process.env.LLM_API_URL ?? "").replace(/\/+$/, "");
    this.apiKey = process.env.GEMINI_API_KEY ?? "";
    this.normalizationModelId = process.env.GEMINI_NORMALIZATION_MODEL_ID ?? "";
    this.correlationModelId = process.env.GEMINI_CORRELATION_MODEL_ID ?? "";

    console.info("[LLM] Service initialized", {
      apiUrl: this.apiUrl,
      normalizationModelId: this.normalizationModelId,
      correlationModelId: this.correlationModelId,
    });
  }

  // =========================================================
  // NORMALIZATION (EventDTO)
  // =========================================================
  async sendNormalizationPrompt(rawLog: string): Promise<EventDTO> {
    if (!rawLog || rawLog.trim().length === 0) {
      console.warn("[LLM] Normalization skipped: empty log");
      return this.emptyEvent();
    }

    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `
            You are a deterministic SIEM normalization engine.
            Return ONLY valid JSON aligned with schema.
            Rules:
            - No markdown
            - No explanations
            - Deterministic output
            - Do not invent data
            Log:
            ${rawLog}`.trim(),
      },
    ];

    const raw = await this.sendChatCompletion(
      this.normalizationModelId,
      messages,
      EventResponseSchema
    );
    const event = parseEventDTO(raw);

    if (!event) {
      console.warn("[LLM] Normalization failed schema validation", raw);
      return this.emptyEvent();
    }

    return event;
  }

  // =========================================================
  // CORRELATION (CorrelationDTO[])
  // =========================================================
  async sendCorrelationPrompt(rawMessage: string): Promise<CorrelationDTO[]> {
    if (!rawMessage || rawMessage.trim().length === 0) {
      console.warn("[LLM] Correlation skipped: empty input");
      return [];
    }

    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `
            You are a deterministic SIEM correlation analysis engine.

            Your task is to analyze the provided security events and propose 0..N potential correlations.

            === OUTPUT FORMAT (STRICT) ===
            Return ONLY raw JSON in ONE of the following forms:

            A) Array of correlations:
            [
            {
                "correlationDetected": boolean,
                "confidence": number,
                "description": string,
                "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
                "correlatedEventIds": number[]
            }
            ]

            B) Empty array if no meaningful correlation:
            []

            === HARD RULES ===
            - Output ONLY raw JSON
            - NO markdown
            - NO explanations
            - Deterministic output
            - confidence MUST be between 0 and 1
            - correlatedEventIds MUST contain ONLY integers from provided events

            === EVENTS ===
            ${rawMessage}`.trim(),
      },
    ];

    const raw = await this.sendChatCompletion(
      this.correlationModelId,
      messages,
      CorrelationResponseSchema
    );
    return parseCorrelationCandidates(raw);
  }

  // =========================================================
  // LLM CALL (Gemini)
  // =========================================================
  private async sendChatCompletion(
    modelId: string,
    messages: ChatMessage[],
    schema?: object
  ): Promise<unknown> {
    const url = `${this.apiUrl}/models/${modelId}:generateContent`;

    const generationConfig: any = { temperature: 0.0 };

    if (schema) {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = schema;
    }

    const payload = {
      contents: messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      generationConfig,
    };


    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await axios.post(url, payload, {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          timeout: this.timeoutMs,
        });

        const part = res.data?.candidates?.[0]?.content?.parts?.[0];
        if (!part) return null;

        // SCHEMA MODE)
        if (schema) {
          if (typeof part.text === "string") {
            return JSON.parse(part.text);
          }
          return part;
        }

        // FALLBACK MODE (no schema)
        if (typeof part.text !== "string") return null;

        const jsonText = extractJson(part.text);
        if (!jsonText) return null;

        return JSON.parse(jsonText);

      } catch (err) {
        const axErr = err as AxiosError;

        console.warn("[LLM] Request failed", {
          attempt,
          status: axErr.response?.status,
          message: axErr.message,
        });

        if (attempt === this.maxRetries) break;
        await this.sleep(400 * attempt);
      }
    }

    console.error("[LLM] All retries exhausted");
    return null;
  }

  // =========================================================
  // FALLBACKS
  // =========================================================
  private emptyEvent(): EventDTO {
    return {
      type: "INFO",
      description: "__NORMALIZATION_FAILED__",
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
