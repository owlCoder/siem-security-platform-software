import { AlertCategory } from "../enums/AlertCategory";
import { AlertSeverity } from "../enums/AlertSeverity";

export interface CreateAlertFromCorrelationDTO {
    correlationId: number;
    description: string;
    severity: AlertSeverity;
    correlatedEventIds: number[];
    category: AlertCategory;
    oldestEventTimestamp: string;
    ipAddress?: string;
    userId?: number;    
    userRole?: string;
}