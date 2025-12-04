import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { AlertDTO } from "../Domain/DTOs/AlertDTO";
import { AlertQueryDTO} from "../Domain/DTOs/AlertQueryDTO";
import { PaginatedAlertsDTO } from "../Domain/DTOs/PaginatedAlertsDTO";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly alertClient: AxiosInstance;
  private readonly queryClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const alertBaseURL = process.env.ALERT_SERVICE_API;
    const queryBaseURL = process.env.QUERY_SERVICE_API;

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
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch {
      return { authenificated: false };
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
    const response = await this.alertClient.get<PaginatedAlertsDTO>("/alerts/search", {
      params: query
    });
    return response.data;
  }

  async resolveAlert(id: number, resolvedBy: string, status: string): Promise<AlertDTO> {
    const response = await this.alertClient.put<AlertDTO>(`/alerts/${id}/resolve`, {
      resolvedBy,
      status
    });
    return response.data;
  }

  async updateAlertStatus(id: number, status: string): Promise<AlertDTO> {
    const response = await this.alertClient.put<AlertDTO>(`/alerts/${id}/status`, { status });
    return response.data;
  }

  // Query Service
  async searchEvents(query: string): Promise<any[]> {
    const response = await this.queryClient.get<any[]>("/query/search", {
      params: { query }
    });
    return response.data;
  }

  async getOldEvents(hours: number): Promise<any[]> {
    const response = await this.queryClient.get<any[]>(`/query/oldEvents/${hours}`);
    return response.data;
  }
}
