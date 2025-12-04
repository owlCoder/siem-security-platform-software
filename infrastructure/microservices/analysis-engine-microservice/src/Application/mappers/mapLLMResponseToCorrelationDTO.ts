import { CorrelationDTO } from "../../Domain/types/CorrelationDTO";

export function mapLLMResponseToCorrelationDTO(llmResponse: any): CorrelationDTO {
    return {
        id: 0, //will be set manually after saving to DB
        correlationDetected: llmResponse.correlation_detected ?? false,
        description: llmResponse.description ?? "",
        timestamp: new Date(),
        confidence: llmResponse.confidence ?? 0,
        severity: llmResponse.severity ?? "LOW",
        correlatedEventIds: llmResponse.related_event_ids ?? [],
    };
}