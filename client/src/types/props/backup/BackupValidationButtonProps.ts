import { IBackupValidationAPI } from "../../../api/backup/IBackupValdationAPI";

export interface BackupValidationButtonProps {
    backupApi: IBackupValidationAPI;
    onSuccess?: () => void;
}