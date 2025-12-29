import { Response } from "express";
import { AlertDTO } from "../DTOs/AlertDTO";

export interface IAlertNotificationService {
  registerClient(clientId: string, res: Response): void;
  broadcastNewAlert(alert: AlertDTO): Promise<void>;
  broadcastAlertUpdate(alert: AlertDTO, updateType: string): Promise<void>;
  showAlert(correlationId: number): Promise<void>;
  sendHeartbeat(): void;
  getConnectedClientsCount(): number;
}
