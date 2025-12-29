import { IAlertNotificationService } from "../Domain/services/IAlertNotificationService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { Response } from "express";
import { AlertDTO } from "../Domain/DTOs/AlertDTO";

export class AlertNotificationService implements IAlertNotificationService {
  private sseClients: Map<string, Response> = new Map();

  constructor(private readonly logger: ILoggerService) {}

  /** Registruje SSE klijenta (SIEM Gateway) */
  registerClient(clientId: string, res: Response): void {
    this.sseClients.set(clientId, res);
    this.logger.log(`SSE client registered: ${clientId}`);

    res.on("close", () => {
      this.sseClients.delete(clientId);
      this.logger.log(`SSE client disconnected: ${clientId}`);
    });
  }

  /** Broadcast novog alert-a svim povezanim klijentima */
  async broadcastNewAlert(alert: AlertDTO): Promise<void> {
    await this.logger.log(`Broadcasting new alert #${alert.id} to ${this.sseClients.size} clients`);
    this.broadcast(JSON.stringify({
      type: "NEW_ALERT",
      data: alert,
      timestamp: new Date().toISOString()
    }));
  }

  /** Broadcast azuriranog alert-a */
  async broadcastAlertUpdate(alert: AlertDTO, updateType: string): Promise<void> {
    await this.logger.log(`Broadcasting alert update #${alert.id} (${updateType}) to ${this.sseClients.size} clients`);
    this.broadcast(JSON.stringify({
      type: "ALERT_UPDATED",
      updateType,
      data: alert,
      timestamp: new Date().toISOString()
    }));
  }

  /** Samo loguje poziv Analysis Engine-a */
  async showAlert(correlationId: number): Promise<void> {
    await this.logger.log(`Analysis Engine triggered alert for correlation #${correlationId}`);
  }

  /** Interni broadcast metod */
  private broadcast(message: string): void {
    this.sseClients.forEach((client, clientId) => {
      try {
        client.write(`data: ${message}\n\n`);
      } catch (error) {
        this.logger.log(`Failed to send to client ${clientId}, removing from pool`);
        this.sseClients.delete(clientId);
      }
    });
  }

  /** Broj trenutno povezanih klijenata */
  getConnectedClientsCount(): number {
    return this.sseClients.size;
  }

  /** Heartbeat za sve klijente */
  sendHeartbeat(): void {
    this.sseClients.forEach(client => {
      try {
        client.write(`: heartbeat\n\n`);
      } catch {
        // Klijent će biti uklonjen prilikom sledećeg broadcast-a
      }
    });
  }
}
