export interface IntegrityStatusDTO {
    isChainValid: boolean;
    lastChecked: Date;
    totalLogsChecked: number;
    compromisedSegmentsCount: number;
}