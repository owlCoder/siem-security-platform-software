import { BackupValidationStatus } from "../enums/BackupValidationStatus";

export interface BackupHealthDTO {
    lastStatus: BackupValidationStatus | null;
    lastCheckAt: string | null;
}