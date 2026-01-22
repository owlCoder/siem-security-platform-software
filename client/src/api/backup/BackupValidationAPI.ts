import axios, { AxiosInstance } from "axios";
import { IBackupValidationAPI } from "./IBackupValdationAPI";
import { BackupValidationLogDTO } from "../../models/backup/BackupValidationLogDTO";
import { BackupValidationResultDTO } from "../../models/backup/BackupValidationResultDTO";

export class BackupValidationAPI implements IBackupValidationAPI {
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_GATEWAY_URL,
            headers: {
                "Content-Type": "application/json"
            },
        });
    }

    async getAllLogs(/*token: string*/): Promise<BackupValidationLogDTO[]> {
        const response = await this.client.get<BackupValidationLogDTO[]>("/backup/logs", {
            //headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async getLastValidation(/*token: string*/): Promise<BackupValidationLogDTO | null> {
        const response = await this.client.get<BackupValidationLogDTO>("/backup/stats", {
            //headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
    
    async getSummary(/*token: string*/): Promise<BackupValidationResultDTO> {
        const response = await this.client.get<BackupValidationResultDTO>("/backup/summary", {
            //headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    
}