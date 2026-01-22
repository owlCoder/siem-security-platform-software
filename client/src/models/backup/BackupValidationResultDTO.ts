import { BackupValidationStatus } from "../enums/BackupValidationStatus";

export interface BackupValidationResultDTO {
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
    lastCheckAt: string | null;
    lastStatus: BackupValidationStatus | null;
}