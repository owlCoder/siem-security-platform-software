import { IAlertNotificationService } from "../Domain/services/IAlertNotificationService";
import { Response } from "express";
import { AlertDTO } from "../Domain/DTOs/AlertDTO";

export class AlertNotificationService implements IAlertNotificationService {
  private sseClients: Map<string, Response> = new Map();

  /** Registruje SSE klijenta (SIEM Gateway) */
  registerClient(clientId: string, res: Response): void {
    this.sseClients.set(clientId, res);

    res.on("close", () => {
      this.sseClients.delete(clientId);
    });
  }

  /** Broadcast novog alert-a svim povezanim klijentima */
  async broadcastNewAlert(alert: AlertDTO): Promise<void> {
    this.broadcast(JSON.stringify({
      type: "NEW_ALERT",
      data: alert,
      timestamp: new Date().toISOString()
    }));
  }

  /** Broadcast azuriranog alert-a */
  async broadcastAlertUpdate(alert: AlertDTO, updateType: string): Promise<void> {
    this.broadcast(JSON.stringify({
      type: "ALERT_UPDATED",
      updateType,
      data: alert,
      timestamp: new Date().toISOString()
    }));
  }

  /** Samo loguje poziv Analysis Engine-a */
  async showAlert(correlationId: number): Promise<void> {
    console.log(`Analysis Engine triggered alert for correlation #${correlationId}`);
  }

  /** Interni broadcast metod */
  private broadcast(message: string): void {
    this.sseClients.forEach((client, clientId) => {
      try {
        client.write(`data: ${message}\n\n`);
      } catch {
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
    this.sseClients.forEach(client => client.write(`: heartbeat\n\n`));
  }
}
