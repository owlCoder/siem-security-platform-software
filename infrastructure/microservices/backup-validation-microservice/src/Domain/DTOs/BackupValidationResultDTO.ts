export interface BackupValidationResultDTO {
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
    lastCheckAt: string | null;
    lastStatus: "SUCCESS" | "FAILED" | null;
}