import { Alert } from "../models/Alert";
import { AlertStatus } from "../enums/AlertStatus";
import { AlertSeverity } from "../enums/AlertSeverity";
import { AlertQueryDTO } from "../DTOs/AlertQueryDTO";

export interface IAlertRepositoryService {
  create(data: Partial<Alert>): Promise<Alert>;
  save(alert: Alert): Promise<Alert>;
  findAll(): Promise<Alert[]>;
  findById(id: number): Promise<Alert | null>;
  findBySeverity(severity: AlertSeverity): Promise<Alert[]>;
  findByStatus(status: AlertStatus): Promise<Alert[]>;
  delete(id: number): Promise<boolean>;

  findWithFilters(query: AlertQueryDTO): Promise<{ alerts: Alert[], total: number }>;

}
