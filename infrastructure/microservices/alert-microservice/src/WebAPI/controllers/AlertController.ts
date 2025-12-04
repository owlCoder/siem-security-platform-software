import { Router, Request, Response } from "express";
import { IAlertService } from "../../Domain/services/IAlertService";
import { AlertNotificationService } from "../../Services/AlertNotificationService";
import { AlertSeverity } from "../../Domain/enums/AlertSeverity";
import { AlertStatus } from "../../Domain/enums/AlertStatus";
import { CreateAlertDTO } from "../../Domain/DTOs/CreateAlertDTO";
import { ResolveAlertDTO } from "../../Domain/DTOs/ResolveAlertDTO";
import { CreateAlertFromCorrelationDTO } from "../../Domain/DTOs/CreateAlertFromCorrelationDTO";
import { AlertQueryDTO } from "../../Domain/DTOs/AlertQueryDTO";

export class AlertController {
  private router: Router;

  constructor(
    private alertService: IAlertService,
    private notificationService: AlertNotificationService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/alerts/notifications/stream", this.streamNotifications.bind(this));
    this.router.get("/alerts/search", this.searchAlerts.bind(this));
    this.router.get("/alerts", this.getAllAlerts.bind(this));
    this.router.get("/alerts/:id", this.getAlertById.bind(this));
    this.router.get("/alerts/severity/:severity", this.getAlertsBySeverity.bind(this));
    this.router.get("/alerts/status/:status", this.getAlertsByStatus.bind(this));
    this.router.put("/alerts/:id/resolve", this.resolveAlert.bind(this));
    this.router.put("/alerts/:id/status", this.updateAlertStatus.bind(this));
    this.router.post("/alerts/correlation", this.createAlertFromCorrelation.bind(this));
  }

  getRouter() {
    return this.router;
  }

  async streamNotifications(req: Request, res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.write(`: connected\n\n`);

    const clientId = req.query.clientId as string || `client_${Date.now()}`;
    this.notificationService.registerClient(clientId, res);

    const heartbeatInterval = setInterval(() => this.notificationService.sendHeartbeat(), 30000);

    req.on("close", () => clearInterval(heartbeatInterval));
  }

  async createAlertFromCorrelation(req: Request, res: Response) {
    try {
      const data: CreateAlertFromCorrelationDTO = req.body;
      if (!data.correlationId || !data.description || !data.correlatedEventIds) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const alertData: CreateAlertDTO = {
        title: `Security Correlation Detected #${data.correlationId}`,
        description: data.description,
        severity: data.severity || AlertSeverity.HIGH,
        correlatedEvents: data.correlatedEventIds,
        source: "AnalysisEngine"
      };

      const alert = await this.alertService.createAlert(alertData);
      await this.notificationService.broadcastNewAlert(alert);

      res.status(201).json({ success: true, alert });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async searchAlerts(req: Request, res: Response) {
    try {
      const query: AlertQueryDTO = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        severity: req.query.severity as AlertSeverity,
        status: req.query.status as AlertStatus,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        source: req.query.source as string,
        sortBy: req.query.sortBy as 'createdAt' | 'severity' | 'status',
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC'
      };
      res.json(await this.alertService.getAlertsWithFilters(query));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAllAlerts(req: Request, res: Response) {
    try { res.json(await this.alertService.getAllAlerts()); }
    catch (err: any) { res.status(500).json({ error: err.message }); }
  }

  async getAlertById(req: Request, res: Response) {
    try { res.json(await this.alertService.getAlertById(Number(req.params.id))); }
    catch (err: any) { res.status(404).json({ error: err.message }); }
  }

  async getAlertsBySeverity(req: Request, res: Response) {
    try {
      const severity = req.params.severity.toUpperCase() as AlertSeverity;
      res.json(await this.alertService.getAlertsBySeverity(severity));
    } catch { res.status(400).json({ error: "Invalid severity value" }); }
  }

  async getAlertsByStatus(req: Request, res: Response) {
    try {
      const status = req.params.status.toUpperCase() as AlertStatus;
      res.json(await this.alertService.getAlertsByStatus(status));
    } catch { res.status(400).json({ error: "Invalid status value" }); }
  }

  async resolveAlert(req: Request, res: Response) {
    try {
      const updated = await this.alertService.resolveAlert(Number(req.params.id), req.body);
      await this.notificationService.broadcastAlertUpdate(updated, "RESOLVED");
      res.json(updated);
    } catch (err: any) { res.status(404).json({ error: err.message }); }
  }

  async updateAlertStatus(req: Request, res: Response) {
    try {
      const updated = await this.alertService.updateAlertStatus(Number(req.params.id), req.body.status);
      await this.notificationService.broadcastAlertUpdate(updated, "STATUS_CHANGED");
      res.json(updated);
    } catch (err: any) { res.status(400).json({ error: err.message }); }
  }
}
