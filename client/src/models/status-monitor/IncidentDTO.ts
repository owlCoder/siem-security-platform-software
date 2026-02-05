export interface IncidentDTO {
    id: number;
    serviceName: string;
    startTime: string;
    endTime: string | null;
    reason: string;
    correlationSummary: string | null; 
    correlationRefs: string | null;
}