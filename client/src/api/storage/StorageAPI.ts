import { StorageLogResponseDTO } from "../../models/storage/StorageLogResponseDTO";
import { ArchiveStatsDTO } from "../../models/storage/ArchiveStatsDTO";
import { ArchiveVolumeDTO } from "../../models/storage/ArchiveVolumeDTO";
import { LargestArchiveDTO } from "../../models/storage/LargestArchiveDTO";
import { TopArchiveDTO } from "../../models/storage/TopArchiveDTO";
import { IStorageAPI } from "./IStorageAPI";
import axios, { AxiosInstance, AxiosResponse } from "axios";

export class StorageAPI implements IStorageAPI {
    private readonly axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: import.meta.env.VITE_FIREWALL_PROXY_URL,
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
        });
    }

    async getAllArchives(token: string): Promise<StorageLogResponseDTO[]> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: "storageLog",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.response;
    }

    async getStats(token: string): Promise<ArchiveStatsDTO> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: "storageLog/stats",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.response;
    }

    async downloadArchive(token: string, id: number): Promise<ArrayBuffer> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: `storageLog/file/${id}`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            responseType: "arraybuffer",
        });
        return response.data.response;
    }

    async getTopArchives(token: string, type: "events" | "alerts", limit: number): Promise<TopArchiveDTO[]> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: "storageLog/top",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            params: { type, limit },
        });
        return response.data.response;
    }


    async getArchiveVolume(token: string, period: "daily" | "monthly" | "yearly"): Promise<ArchiveVolumeDTO[]> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: "storageLog/volume",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            params: { period },
        });
        return response.data.response;
    }

    async getLargestArchive(token: string): Promise<LargestArchiveDTO> {
        const response: AxiosResponse = await this.axiosInstance.post("", {
            url: "storageLog/largest",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.response;
    }
}