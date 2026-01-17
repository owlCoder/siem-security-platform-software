import { BackupValidationStatus } from "../enums/BackupValidationStatus";

export interface BackupValidationLogDTO {
    backupValidationLogId: number;
    status: BackupValidationStatus;
    errorMessage: string | null;
    createdAt: string;
}