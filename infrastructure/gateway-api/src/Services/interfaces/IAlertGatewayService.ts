import { AlertDTO } from "../../Domain/DTOs/AlertDTO";
import { AlertQueryDTO } from "../../Domain/DTOs/AlertQueryDTO";
import { PaginatedAlertsDTO } from "../../Domain/DTOs/PaginatedAlertsDTO";

export interface IAlertGatewayService {
  getAllAlerts(): Promise<AlertDTO[]>;
  getAlertById(id: number): Promise<AlertDTO>;
  searchAlerts(query: AlertQueryDTO): Promise<PaginatedAlertsDTO>;
  resolveAlert(id: number, resolvedBy: string, status: string): Promise<AlertDTO>;
  updateAlertStatus(id: number, status: string): Promise<AlertDTO>;
}