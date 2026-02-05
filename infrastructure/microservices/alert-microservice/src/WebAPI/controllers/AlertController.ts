import { Router, Request, Response } from "express";
import { IAlertService } from "../../Domain/services/IAlertService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { AlertNotificationService } from "../../Services/AlertNotificationService";
import { AlertSeverity } from "../../Domain/enums/AlertSeverity";
import { AlertStatus } from "../../Domain/enums/AlertStatus";
import { CreateAlertDTO } from "../../Domain/DTOs/CreateAlertDTO";
import { ResolveAlertDTO } from "../../Domain/DTOs/ResolveAlertDTO";
import { CreateAlertFromCorrelationDTO } from "../../Domain/DTOs/CreateAlertFromCorrelationDTO";
import { AlertQueryDTO } from "../../Domain/DTOs/AlertQueryDTO";
import { AlertForKpi } from "../../Domain/DTOs/AlertForKpiDTO";
import { toHourlyWindowStartUtc, formatWindowStartIsoUtc, formatWindowStartHumanUtc } from "../../Utils/Time/CorrelationWindow";
import {
  validateAlertId,
  validateCreateAlertDTO,
  validateAlertStatus,
  validateAlertSeverity,
  validateResolveAlertDTO,
  validateCreateAlertFromCorrelationDTO,
  validateAlertTimeWindow
} from "../validators/AlertValidators";

export class AlertController {
  private readonly router: Router;

  constructor(
    private readonly alertService: IAlertService,
    private readonly notificationService: AlertNotificationService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/alerts/notifications/stream", this.streamNotifications.bind(this));
    this.router.get("/alerts/search", this.searchAlerts.bind(this));
    this.router.post("/alerts/correlation", this.createAlertFromCorrelation.bind(this));
    this.router.get("/alerts", this.getAllAlerts.bind(this));
    this.router.get("/alerts/for-kpi", this.getAlertsForKpi.bind(this));
    this.router.get("/alerts/:id", this.getAlertById.bind(this));
    this.router.get("/alerts/severity/:severity", this.getAlertsBySeverity.bind(this));
    this.router.get("/alerts/status/:status", this.getAlertsByStatus.bind(this));
    this.router.put("/alerts/:id/resolve", this.resolveAlert.bind(this));
    this.router.put("/alerts/:id/status", this.updateAlertStatus.bind(this));
    this.router.delete("/alerts/deleteArchivedAlerts", this.deleteArchivedAlerts.bind(this));
  }

  public getRouter(): Router {
    return this.router;
  }

  private async streamNotifications(req: Request, res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.write(`: connected\n\n`);

    const clientId = req.query.clientId as string || `client_${Date.now()}`;
    this.notificationService.registerClient(clientId, res);

    await this.logger.log(`SSE client connected: ${clientId}`);

    const heartbeatInterval = setInterval(() => this.notificationService.sendHeartbeat(), 30000);

    req.on("close", () => {
      clearInterval(heartbeatInterval);
      this.logger.log(`SSE client disconnected: ${clientId}`);
    });
  }

  private async createAlertFromCorrelation(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateAlertFromCorrelationDTO = req.body;

      const validation = validateCreateAlertFromCorrelationDTO(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const oldestEventTimestamp = new Date(data.oldestEventTimestamp);

      const windowStartUtc = toHourlyWindowStartUtc(oldestEventTimestamp);
      const windowLabel = formatWindowStartHumanUtc(windowStartUtc);
      const windowIso = formatWindowStartIsoUtc(windowStartUtc);


      const windowKey = windowIso.replace(/[:.]/g, "-");

      const alertData: CreateAlertDTO = {
        title: `Security Correlation Detected (${data.category}) - window ${windowLabel}`,
        description: data.description,
        severity: data.severity || AlertSeverity.HIGH,
        correlatedEvents: data.correlatedEventIds,
        source: "AnalysisEngine",
        detectionRule: `correlation_${data.category}_${windowKey}`,
        ipAddress: data.ipAddress,
        userId: data.userId,
        userRole: data.userRole,
        category: data.category,
        oldestEventTimestamp
      };

      const alertValidation = validateCreateAlertDTO(alertData);
      if (!alertValidation.success) {
        res.status(400).json({ success: false, message: alertValidation.message });
        return;
      }

      await this.logger.log(`Creating alert from correlation category=${data.category} window=${windowIso}`);

      const alert = await this.alertService.createAlert(alertData);

      if (alert.id === -1) {
        await this.logger.log("Correlation alert creation failed (repo error). Not broadcasting.");
        res.status(500).json({ message: "Service error: Failed to create alert from correlation." });
        return;
      }
      await this.notificationService.broadcastNewAlert(alert);

      res.status(201).json({ success: true, alert });
    } catch (err: any) {
      await this.logger.log(`Error creating alert from correlation: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to create alert from correlation." });
    }
  }

  private async searchAlerts(req: Request, res: Response): Promise<void> {
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

      await this.logger.log(`Searching alerts with filters`);

      const result = await this.alertService.getAlertsWithFilters(query);
      res.status(200).json(result);
    } catch (err: any) {
      await this.logger.log(`Error searching alerts: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to search alerts." });
    }
  }

  private async getAllAlerts(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log("Fetching all alerts");

      const alerts = await this.alertService.getAllAlerts();
      res.status(200).json(alerts);
    } catch (err: any) {
      await this.logger.log(`Error fetching all alerts: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch alerts." });
    }
  }

  private async getAlertsForKpi(req: Request, res: Response): Promise<void> {
    try {
      const fromRaw = req.query.from as string | undefined;
      const toRaw = req.query.to as string | undefined;

      if (!fromRaw || !toRaw) {
        res.status(400).json({ success: false, message: "Invalid time window parameters" });
        return;
      }

      const from = new Date(fromRaw);
      const to = new Date(toRaw);

      const validation = validateAlertTimeWindow(from, to);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(
        `Fetching alerts for KPI from ${from.toISOString()} to ${to.toISOString()}`
      );

      const alerts = await this.alertService.getAlertsForKpi(from, to);

      res.status(200).json(alerts);
    } catch (err: any) {
      await this.logger.log(`Error fetching alerts for KPI: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch alerts for KPI." });
    }
  }

  private async getAlertById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const validation = validateAlertId(id);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Fetching alert with ID: ${id}`);

      const alert = await this.alertService.getAlertById(id);

      if (alert.id === -1) {
        res.status(404).json({ message: `Alert with id=${id} not found` });
        return;
      }

      res.status(200).json(alert);
    } catch (err: any) {
      await this.logger.log(`Error fetching alert by ID: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch alert." });
    }
  }

  private async getAlertsBySeverity(req: Request, res: Response): Promise<void> {
    try {
const severity = String(req.params.severity).toUpperCase();
      const validation = validateAlertSeverity(severity);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Fetching alerts with severity: ${severity}`);

      const alerts = await this.alertService.getAlertsBySeverity(severity as AlertSeverity);
      res.status(200).json(alerts);
    } catch (err: any) {
      await this.logger.log(`Error fetching alerts by severity: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch alerts by severity." });
    }
  }

  private async getAlertsByStatus(req: Request, res: Response): Promise<void> {
    try {
const status = String(req.params.status).toUpperCase();
      const validation = validateAlertStatus(status);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Fetching alerts with status: ${status}`);

      const alerts = await this.alertService.getAlertsByStatus(status as AlertStatus);
      res.status(200).json(alerts);
    } catch (err: any) {
      await this.logger.log(`Error fetching alerts by status: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch alerts by status." });
    }
  }

  private async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const validation = validateAlertId(id);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const resolveData: ResolveAlertDTO = req.body;
      const resolveValidation = validateResolveAlertDTO(resolveData);
      if (!resolveValidation.success) {
        res.status(400).json({ success: false, message: resolveValidation.message });
        return;
      }

      await this.logger.log(`Resolving alert ${id}`);

      const updated = await this.alertService.resolveAlert(id, resolveData);

      if (updated.id === -1) {
        res.status(404).json({ message: `Alert with id=${id} not found` });
        return;
      }

      await this.notificationService.broadcastAlertUpdate(updated, "RESOLVED");
      res.status(200).json(updated);
    } catch (err: any) {
      await this.logger.log(`Error resolving alert: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to resolve alert." });
    }
  }

  private async updateAlertStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const validation = validateAlertId(id);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const { status } = req.body;

      const statusValidation = validateAlertStatus(status);
      if (!statusValidation.success) {
        res.status(400).json({ success: false, message: statusValidation.message });
        return;
      }

      await this.logger.log(`Updating alert ${id} status to ${status}`);

      const updated = await this.alertService.updateAlertStatus(id, status as AlertStatus);

      if (updated.id === -1) {
        res.status(404).json({ message: `Alert with id=${id} not found` });
        return;
      }

      await this.notificationService.broadcastAlertUpdate(updated, "STATUS_CHANGED");
      res.status(200).json(updated);
    } catch (err: any) {
      await this.logger.log(`Error updating alert status: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to update alert status." });
    }
  }

  private async deleteArchivedAlerts(req: Request, res: Response): Promise<void> {
    try{
      const alertIds: number[] = req.body || [];
      if(!Array.isArray(alertIds) || alertIds.length == 0){
        await this.logger.log(`No alert IDs provided.`);
        res.status(400).json({ message: "No alert IDs provided."});
        return;
      }

      await this.alertService.deleteArchivedAlerts(alertIds);
      res.status(200).json({ message: "Alerts deleted successfully."});
    }catch(err: any){
      await this.logger.log(`Error while updating alert status: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to delete archived alerts. "});
    }
  }
}