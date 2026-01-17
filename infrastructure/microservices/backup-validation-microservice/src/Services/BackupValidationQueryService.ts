import { Repository } from "typeorm";
import { BackupValidationLog } from "../Domain/models/BackupValidationLog";
import { BackupValidationResultDTO } from "../Domain/DTOs/BackupValidationResultDTO";
import { BackupValidationStatus } from "../Domain/enums/BackupValidationStatus";
import { IBackupValidationQueryService } from "../Domain/services/IBackupValidationQueryService";
import { ILogerService } from "../Domain/services/ILogerService";
import { BackupValidationLogDTO } from "../Domain/DTOs/BackupValidationLogDTO";

export class BackupValidationQueryService implements IBackupValidationQueryService {
    constructor(
        private readonly backupLogRepo: Repository<BackupValidationLog>,
        private readonly logger: ILogerService
    ) {}

    public async getAllLogs(): Promise<BackupValidationLogDTO[]> {
        await this.logger.log("Fetching backup logs...");
        const logs = await this.backupLogRepo.find({
            order: {
                createdAt: "DESC"
            }
        });

        return logs.map(l => ({
            backupValidationLogId: l.backupValidationLogId,
            status: l.status,
            errorMessage: l.errorMessage,
            createdAt: l.createdAt.toISOString()
        }));
    }

    public async getLastValidation(): Promise<BackupValidationLogDTO | null> {
        await this.logger.log("Fetching last backup...");
        const result = await this.backupLogRepo.find({
            order: {
                createdAt: "DESC"
            }, 
            take: 1
        });

        const last = result[0];
        if (!last)
            return null;

        return {
            backupValidationLogId: last.backupValidationLogId,
            status: last.status,
            errorMessage: last.errorMessage,
            createdAt: last.createdAt.toISOString()
        };
    }

    public async getSummary(): Promise<BackupValidationResultDTO> {
        const totalRuns = await this.backupLogRepo.count();

        const successRuns = await this.backupLogRepo.count({
            where: { status: BackupValidationStatus.SUCCESS }
        });

        const failedRuns = await this.backupLogRepo.count({
            where: { status: BackupValidationStatus.FAILED }
        });

        const lastLog = await this.getLastValidation();

        return{
            totalRuns,
            successRuns,
            failedRuns,
            lastCheckAt: lastLog ? lastLog.createdAt : null,
            lastStatus: lastLog ? lastLog.status : null
        };
    }

}