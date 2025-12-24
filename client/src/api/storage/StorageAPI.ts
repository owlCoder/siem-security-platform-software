import { ArchiveDTO } from "../../models/storage/ArchiveDTO";
import { ArchiveStatsDTO } from "../../models/storage/ArchiveStatsDTO";
import { ArchiveVolumeDTO } from "../../models/storage/ArchiveVolumeDTO";
import { LargestArchiveDTO } from "../../models/storage/LargestArchiveDTO";
import { TopArchiveDTO } from "../../models/storage/TopArchiveDTO";
import { IStorageAPI } from "./IStorageAPI";
import axios, { AxiosInstance } from "axios";

export class StorageAPI implements IStorageAPI {
    private readonly client: AxiosInstance;

    constructor(){
        this.client = axios.create({
            baseURL: import.meta.env.VITE_GATEWAY_URL,
            headers: {
                "Content-Type": "application/json"
            },
        });
    }
    async getLargestArchive(token: string): Promise<LargestArchiveDTO> {
        const response = await this.client.get(`/storageLog/largest`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    async getAllArchives(): Promise<ArchiveDTO[]> {
        const response = await this.client.get<ArchiveDTO[]>("/storageLog");
        return response.data;
    }

    async searchArchives(query: string): Promise<ArchiveDTO[]> {
        const response = await this.client.get<ArchiveDTO[]>("/storageLog/search", {
            params: {q: query}
        });
        return response.data;
    }

    async sortArchives(by: "date" | "size" | "name", order: "asc" | "desc"): Promise<ArchiveDTO[]> {
        const response = await this.client.get<ArchiveDTO[]>("/storageLog/sort", {
            params: {by, order}
        });
        return response.data;
    }

    async getStats(): Promise<ArchiveStatsDTO> {
        const response = await this.client.get<ArchiveStatsDTO>("/storageLog/stats");
        return response.data;
    }

    async downloadArchive(id: number, token: string): Promise<ArrayBuffer> {
        const response = await this.client.get(`/storageLog/file/${id}`, {
            responseType: "blob",
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }


    //STATISTICS METODA
    async getTopArchives(type: "events" | "alerts", limit: number, token: string): Promise<TopArchiveDTO[]> {
        const response = await this.client.get<TopArchiveDTO[]>("/storageLog/top", {
            params: {type, limit},
            headers: {Authorization: `Bearer ${token}`}
        });
        return response.data;
    }

    //STATISTICS METODA
    async getArchiveVolume(period: "daily" | "monthly" | "yearly", token: string): Promise<ArchiveVolumeDTO[]>{
       const response = await this.client.get<ArchiveVolumeDTO[]>("/storageLog/volume", {
            params: {period},
            headers: {Authorization: `Bearer ${token}`}
       });

       return response.data;
    }
}