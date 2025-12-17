import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { AlertDTO } from "../Domain/DTOs/AlertDTO";
import { AlertQueryDTO } from "../Domain/DTOs/AlertQueryDTO";
import { PaginatedAlertsDTO } from "../Domain/DTOs/PaginatedAlertsDTO";
import { ArchiveDTO } from "../Domain/DTOs/ArchiveDTO";
import { ArchiveStatsDTO } from "../Domain/DTOs/ArchiveStatsDTO";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { TopArchiveDTO } from "../Domain/DTOs/TopArchiveDTO";
import { ParserEventDto } from "../Domain/DTOs/ParserEventDTO";
import { ArchiveVolumeDTO } from "../Domain/DTOs/ArchiveVolumeDTO";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly alertClient: AxiosInstance;
  private readonly queryClient: AxiosInstance;
  private readonly siemAuthClient: AxiosInstance;
  private readonly storageLogClient: AxiosInstance;
  private readonly parserEventClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const alertBaseURL = process.env.ALERT_SERVICE_API;
    const queryBaseURL = process.env.QUERY_SERVICE_API;
    const siemAuthBaseURL = process.env.SIEM_AUTH_SERVICE_API;
    const storageAuthBaseURL = process.env.STORAGE_LOG_SERVICE_API;
    const parserEventURL = process.env.PARSER_SERVICE_API;

    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    // TODO: ADD MORE CLIENTS
    this.alertClient = axios.create({
      baseURL: alertBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    this.queryClient = axios.create({
      baseURL: queryBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.siemAuthClient = axios.create({
      baseURL: siemAuthBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.storageLogClient = axios.create({
      baseURL: storageAuthBaseURL,
      headers: { "Content-Type": "application/json"},
      timeout: 5000,
    });
    
    this.parserEventClient = axios.create({
      baseURL: parserEventURL,
      headers: { "Content-Type": "application/json"},
      timeout: 5000,
    });
  }
  async log(eventMessage: string, eventSource: string): Promise<EventDTO> {
    const response = await this.parserEventClient.post<EventDTO>("/parserEvents/log",{
        eventMessage,
        eventSource,
      });
    return response.data;
  }
  async getAllParserEvents(): Promise<ParserEventDto[]> {
    console.log("aaaaaaaaaaaa\n");
    const response = await this.parserEventClient.get<ParserEventDto[]>("/parserEvents");
    return response.data;
  }
   async getParserEventById(id: number): Promise<ParserEventDto> {
    const response = await this.parserEventClient.get<ParserEventDto>(`/parserEvents/${id}`);
    return response.data;
  }
  async deleteById(id: number): Promise<boolean> {
    const response = await this.parserEventClient.delete<boolean>(`/parserEvents/${id}`);
    return response.data;
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>(
        "/auth/login",
        data
      );
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>(
        "/auth/register",
        data
      );
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
    isSysAdmin?: boolean;
    error?: string;
  }> {
    try {
      const response = await this.siemAuthClient.post<{
        success: boolean;
        valid: boolean;
        isSysAdmin: boolean;
        user: { user_id: number; username: string; role: number };
      }>("auth/validate");

      if (!response.data.success || !response.data.valid) {
        return { valid: false, error: "Token validation failed." };
      }

      return {
        valid: true,
        payload: response.data.user,
        isSysAdmin: response.data.isSysAdmin,
      };
    } catch (error: any) {
      return { valid: false, error: error };
    }
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    const response = await this.userClient.get<UserDTO[]>("/users");
    return response.data;
  }

  async getUserById(id: number): Promise<UserDTO> {
    const response = await this.userClient.get<UserDTO>(`/users/${id}`);
    return response.data;
  }

  // TODO: ADD MORE API CALLS

  // Alert Service
  async getAllAlerts(): Promise<AlertDTO[]> {
    const response = await this.alertClient.get<AlertDTO[]>("/alerts");
    return response.data;
  }

  async getAlertById(id: number): Promise<AlertDTO> {
    const response = await this.alertClient.get<AlertDTO>(`/alerts/${id}`);
    return response.data;
  }

  async searchAlerts(query: AlertQueryDTO): Promise<PaginatedAlertsDTO> {
    const response = await this.alertClient.get<PaginatedAlertsDTO>(
      "/alerts/search",
      {
        params: query,
      }
    );
    return response.data;
  }

  async resolveAlert(
    id: number,
    resolvedBy: string,
    status: string
  ): Promise<AlertDTO> {
    const response = await this.alertClient.put<AlertDTO>(
      `/alerts/${id}/resolve`,
      {
        resolvedBy,
        status,
      }
    );
    return response.data;
  }

  async updateAlertStatus(id: number, status: string): Promise<AlertDTO> {
    const response = await this.alertClient.put<AlertDTO>(
      `/alerts/${id}/status`,
      { status }
    );
    return response.data;
  }

  // Query Service
  async searchEvents(query: string): Promise<EventDTO[]> {
    const response = await this.queryClient.get<any[]>("/query/search", {
      params: { query },
    });
    return response.data;
  }

  async getOldEvents(hours: number): Promise<EventDTO[]> {
    const response = await this.queryClient.get<any[]>(
      `/query/oldEvents/${hours}`
    );
    return response.data;
  }

  async getLastThreeEvents(): Promise<EventDTO[]> {
    const response = await this.queryClient.get<any[]>(
      `/query/lastThreeEvents`
    );
    return response.data;
  }

  async getAllEvents(): Promise<EventDTO[]> {
    const response = await this.queryClient.get<any[]>(
      "/query/events"
    );
    return response.data;
  }

  async getEventsCount(): Promise<number> {
    const response = await this.queryClient.get<{ count: number }>(
      "/query/eventsCount"
    );
    return response.data.count;
  }


  // Storage 
  async getAllArchives(): Promise<ArchiveDTO[]> {
    const response = await this.storageLogClient.get<ArchiveDTO[]>("/storageLog");
    return response.data;
  }

  async searchArchives(query: string): Promise<ArchiveDTO[]> {
    const response = await this.storageLogClient.get<ArchiveDTO[]>("/storageLog/search", {
      params: {q: query},
    });
    return response.data;
  }

  async sortArchives(by: "date" | "size" | "name", order: "asc" | "desc"): Promise<ArchiveDTO[]> {
    const response = await this.storageLogClient.get<ArchiveDTO[]>("/storageLog/sort", {
      params: {by, order},
    });
    return response.data;
  }

  async runArchiveProcess(): Promise<ArchiveDTO> {
    const response = await this.storageLogClient.post<ArchiveDTO>("/storageLog/run");
    return response.data;
  }

  async getArchiveStats(): Promise<ArchiveStatsDTO> {
    const response = await this.storageLogClient.get<ArchiveStatsDTO>("/storageLog/stats");
    return response.data;
  }

  async downloadArchive(id: string): Promise<ArrayBuffer> {
    const response = await this.storageLogClient.get(`/storageLog/file/${id}`, {
      responseType: "arraybuffer"
    });
    return response.data;
  }

  async getTopArchives(type: "events" | "alerts", limit: number): Promise<TopArchiveDTO[]>{
    const response = await this.storageLogClient.get<TopArchiveDTO[]>("/storageLove/top", {
      params: {type, limit}
    });
    return response.data;
  }

  async getArchiveVolume(period: "daily" | "monthly" | "yearly"): Promise<ArchiveVolumeDTO[]>{
    const response = await this.storageLogClient.get<ArchiveVolumeDTO[]>("/storageLog/volume", {
      params: {period}
    });
    return response.data;
  }

}
