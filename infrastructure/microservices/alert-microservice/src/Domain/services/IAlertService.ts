import { AlertDTO } from "../DTOs/AlertDTO";
import { CreateAlertDTO } from "../DTOs/CreateAlertDTO";
import { CreateSystemAlertDTO } from "../DTOs/CreateSystemAlertDTO";
import { ResolveAlertDTO } from "../DTOs/ResolveAlertDTO";
import { AlertSeverity } from "../enums/AlertSeverity";
import { AlertStatus } from "../enums/AlertStatus";
import { AlertQueryDTO, PaginatedAlertsDTO } from "../DTOs/AlertQueryDTO";
import { AlertForKpi } from "../DTOs/AlertForKpiDTO";

export interface IAlertService {
  createAlert(data: CreateAlertDTO): Promise<AlertDTO>;
  createSystemAlert(data: CreateSystemAlertDTO): Promise<AlertDTO>;
  getAllAlerts(): Promise<AlertDTO[]>;
  getAlertById(id: number): Promise<AlertDTO>;
  getAlertsBySeverity(severity: AlertSeverity): Promise<AlertDTO[]>;
  getAlertsByStatus(status: AlertStatus): Promise<AlertDTO[]>;
  resolveAlert(id: number, data: ResolveAlertDTO): Promise<AlertDTO>;
  updateAlertStatus(id: number, status: AlertStatus): Promise<AlertDTO>;
  getAlertsForKpi(from: Date, to: Date): Promise<AlertForKpi[]>;
  getAlertsWithFilters(query: AlertQueryDTO): Promise<PaginatedAlertsDTO>;
  deleteArchivedAlerts(alertIds: number[]): Promise<void>;
}
  