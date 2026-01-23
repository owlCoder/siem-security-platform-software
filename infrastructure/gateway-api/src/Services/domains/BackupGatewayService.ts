import axios, { AxiosInstance } from "axios";
import { IBackupGatewayService } from "../../Domain/services/IBackupGatewayService";
import { serviceConfig } from "../../Domain/constants/ServiceConfig";
import { defaultAxiosClient } from "../../Domain/constants/AxiosClient";
import { BackupValidationLogDTO } from "../../Domain/DTOs/BackupValidationLogDTO";
import { BackupValidationResultDTO } from "../../Domain/DTOs/BackupValidationResultDTO";
import { BackupHealthDTO } from "../../Domain/DTOs/BackupHealthDTO";
import { BackupStatsDTO } from "../../Domain/DTOs/BackupStatsDTO";

export class BackupGatewayService implements IBackupGatewayService {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: serviceConfig.backup,
            ...defaultAxiosClient
        });
    }

    async runValidation(): Promise<boolean> {
        const response = await this.client.post<boolean>("/backup/validate");
        return response.data;
    }

    async getAllLogs(): Promise<BackupValidationLogDTO[]> {
        const response = await this.client.get<BackupValidationLogDTO[]>("/backup/logs");
        return response.data;
    }

    async getLastValidation(): Promise<BackupValidationLogDTO | null> {
        const response = await this.client.get<BackupValidationLogDTO | null>("/backup/last");
        return response.data;
    }

    async getSummary(): Promise<BackupValidationResultDTO> {
        const response = await this.client.get<BackupValidationResultDTO>("/backup/summary");
        return response.data;
    }

    async getHealth(): Promise<BackupHealthDTO> {
        const response = await this.client.get<BackupHealthDTO>("/backup/health");
        return response.data;
    }

    async getStats(rangeDays: number): Promise<BackupStatsDTO[]> {
        const response = await this.client.get<BackupStatsDTO[]>("/backup/stats");
        return response.data;
    }
}