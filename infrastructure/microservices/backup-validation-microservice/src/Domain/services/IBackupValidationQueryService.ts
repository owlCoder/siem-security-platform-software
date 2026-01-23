import { BackupHealthDTO } from "../DTOs/BackupHealthDTO";
import { BackupStatsDTO } from "../DTOs/BackupStatsDTO";
import { BackupValidationLogDTO } from "../DTOs/BackupValidationLogDTO";
import { BackupValidationResultDTO } from "../DTOs/BackupValidationResultDTO";

export interface IBackupValidationQueryService {
    getAllLogs(): Promise<BackupValidationLogDTO[]>;
    getLastValidation(): Promise<BackupValidationLogDTO | null>;
    getSummary(): Promise<BackupValidationResultDTO>;
    getHealth(): Promise<BackupHealthDTO>;
    getStats(rangeDays: number): Promise<BackupStatsDTO[]>;
}