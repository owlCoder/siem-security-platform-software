import axios, { AxiosInstance } from "axios";
import { ArchiveStatsDTO } from "../../Domain/DTOs/ArchiveStatsDTO";
import { TopArchiveDTO } from "../../Domain/DTOs/TopArchiveDTO";
import { ArchiveVolumeDTO } from "../../Domain/DTOs/ArchiveVolumeDTO";
import { defaultAxiosClient } from "../../Infrastructure/config/AxiosClient";
import { serviceConfig } from "../../Infrastructure/config/ServiceConfig";
import { LargestArchiveDTO } from "../../Domain/DTOs/LargestArchiveDTO";
import { StorageLogResponseDTO } from "../../Domain/DTOs/StorageLogResponseDTO";
import { IStorageGatewayService } from "../interfaces/IStorageGatewayService";

export class StorageGatewayService implements IStorageGatewayService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: serviceConfig.storage,
      ...defaultAxiosClient
    });
  }

  async getAllArchives(): Promise<StorageLogResponseDTO[]> {
    const response = await this.client.get<StorageLogResponseDTO[]>("/storageLog");
    return response.data;
  }

  async searchArchives(query: string): Promise<StorageLogResponseDTO[]> {
    const response = await this.client.get<StorageLogResponseDTO[]>("/storageLog/search", {
      params: { q: query },
    });
    return response.data;
  }

  async sortArchives(by: "date" | "size" | "name", order: "asc" | "desc"): Promise<StorageLogResponseDTO[]> {
    const response = await this.client.get<StorageLogResponseDTO[]>("/storageLog/sort", {
      params: { by, order },
    });
    return response.data;
  }

  async runArchiveProcess(): Promise<StorageLogResponseDTO> {
    const response = await this.client.post<StorageLogResponseDTO>("/storageLog/run");
    return response.data;
  }

  async getArchiveStats(): Promise<ArchiveStatsDTO> {
    const response = await this.client.get<ArchiveStatsDTO>("/storageLog/stats");
    return response.data;
  }

  async downloadArchive(id: string): Promise<ArrayBuffer> {
    const response = await this.client.get(`/storageLog/file/${id}`, {
      responseType: "arraybuffer",
    });
    return response.data;
  }

  async getTopArchives(type: "events" | "alerts", limit: number): Promise<TopArchiveDTO[]> {
    const response = await this.client.get<TopArchiveDTO[]>("/storageLog/top", {
      params: { type, limit },
    });
    return response.data;
  }

  async getArchiveVolume(period: "daily" | "monthly" | "yearly"): Promise<ArchiveVolumeDTO[]> {
    const response = await this.client.get<ArchiveVolumeDTO[]>("/storageLog/volume", {
      params: { period },
    });
    return response.data;
  }

  async getLargestArchive(): Promise<LargestArchiveDTO|null> {
    const response = await this.client.get<LargestArchiveDTO|null>("/storageLog/largest");
    return response.data;
  }
}