export interface BackupValidationLog {
    backupValidationLogId: number;
    status: "SUCCESS" | "FAILED";
    errorMessage: string | null;
    createdAt: string;
}