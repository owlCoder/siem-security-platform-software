import { AlertDTO } from "../DTOs/AlertDTO";
import { AlertQueryDTO} from "../DTOs/AlertQueryDTO";
import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { PaginatedAlertsDTO } from "../DTOs/PaginatedAlertsDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AuthResponseType } from "../types/AuthResponse";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;

  // Alerts
  getAllAlerts(): Promise<AlertDTO[]>;
  getAlertById(id: number): Promise<AlertDTO>;
  searchAlerts(query: AlertQueryDTO): Promise<PaginatedAlertsDTO>;
  resolveAlert(id: number, resolvedBy: string, status: string): Promise<AlertDTO>;
  updateAlertStatus(id: number, status: string): Promise<AlertDTO>;

  // Query
  searchEvents(query: string): Promise<any>;
  getOldEvents(hours: number): Promise<any>;
}
