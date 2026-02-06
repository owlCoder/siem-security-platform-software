import { CorrelationCategory } from "../enums/CorrelationCategory";

export interface CorrelationDTO {
    correlationDetected: boolean;
    description: string;
    timestamp: Date;
    oldestEventTimestamp: Date;
    category: CorrelationCategory
    confidence: number;
    severity: "CRITICAL"|"HIGH" | "MEDIUM" | "LOW";
    correlatedEventIds: number[];
    ipAddress?: string;
    userId?: number;
    userRole?: string;
}

