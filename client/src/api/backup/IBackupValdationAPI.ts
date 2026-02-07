import { BackupHealthDTO } from "../../models/backup/BackupHealthDTO";
import { BackupStatsDTO } from "../../models/backup/BackupStatsDTO";
import { BackupValidationLogDTO } from "../../models/backup/BackupValidationLogDTO";
import { BackupValidationResultDTO } from "../../models/backup/BackupValidationResultDTO";

export interface IBackupValidationAPI {
    runValidation(token: string): Promise<boolean>;
    getAllLogs(token: string): Promise<BackupValidationLogDTO[]>;
    getLastValidation(token: string): Promise<BackupValidationLogDTO | null>;
    getSummary(token: string): Promise<BackupValidationResultDTO>;
    getHealth(token: string): Promise<BackupHealthDTO>;
    getStats(token: string, rangeDays: number): Promise<BackupStatsDTO[]>;
}