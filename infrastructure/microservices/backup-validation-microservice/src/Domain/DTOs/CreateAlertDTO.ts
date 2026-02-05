import { AlertCategory } from "../enums/AlertCategory";
import { AlertSeverity } from "../enums/AlertSeverity";

export interface CreateAlertDTO {
    title: string;
    description: string;
    severity: AlertSeverity;
    source: string;
    detectionRule: string;
    category: AlertCategory;
    correlatedEvents: number[];
    oldestEventTimestamp: Date;
}