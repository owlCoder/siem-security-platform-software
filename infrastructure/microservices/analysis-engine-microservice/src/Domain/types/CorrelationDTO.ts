export interface CorrelationDTO {
    id: number;
    correlationDetected: boolean;
    description: string;
    timestamp: Date;
    confidence: number;
    severity: "HIGH" | "MEDIUM" | "LOW";
    correlatedEventIds: number[];
}