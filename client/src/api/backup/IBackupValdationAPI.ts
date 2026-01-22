import { BackupValidationLogDTO } from "../../models/backup/BackupValidationLogDTO";
import { BackupValidationResultDTO } from "../../models/backup/BackupValidationResultDTO";

export interface IBackupValidationAPI {
    getAllLogs(/*token: string*/): Promise<BackupValidationLogDTO[]>;
    getLastValidation(/*token: string*/): Promise<BackupValidationLogDTO | null>;
    getSummary(/*token: string*/): Promise<BackupValidationResultDTO>;
}