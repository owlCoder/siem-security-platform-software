import { AlertDTO } from "../DTOs/AlertDTO";
import { CreateAlertDTO } from "../DTOs/CreateAlertDTO";
import { ResolveAlertDTO } from "../DTOs/ResolveAlertDTO";
import { AlertSeverity } from "../enums/AlertSeverity";
import { AlertStatus } from "../enums/AlertStatus";

export interface IAlertService {
  createAlert(data: CreateAlertDTO): Promise<AlertDTO>;
  getAllAlerts(): Promise<AlertDTO[]>;
  getAlertById(id: number): Promise<AlertDTO>;
  getAlertsBySeverity(severity: AlertSeverity): Promise<AlertDTO[]>;
  getAlertsByStatus(status: AlertStatus): Promise<AlertDTO[]>;
  resolveAlert(id: number, data: ResolveAlertDTO): Promise<AlertDTO>;
  updateAlertStatus(id: number, status: AlertStatus): Promise<AlertDTO>;
  deleteAlert(id: number): Promise<boolean>;
}
