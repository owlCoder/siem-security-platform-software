import { Router, Request, Response } from "express";
import { IAlertService } from "../../Domain/services/IAlertService";
import { IAlertNotificationService } from "../../Domain/services/IAlertNotificationService";
import { AlertSeverity } from "../../Domain/enums/AlertSeverity";
import { AlertStatus } from "../../Domain/enums/AlertStatus";
import { CreateAlertDTO } from "../../Domain/DTOs/CreateAlertDTO";
import { ResolveAlertDTO } from "../../Domain/DTOs/ResolveAlertDTO";
import { CreateAlertFromCorrelationDTO } from "../../Domain/DTOs/CreateAlertFromCorrelationDTO";

export class AlertController {
  private router: Router;

  constructor(
    private alertService: IAlertService,
    private notificationService: IAlertNotificationService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/alerts", this.createAlert.bind(this));
    this.router.get("/alerts", this.getAllAlerts.bind(this));
    this.router.get("/alerts/:id", this.getAlertById.bind(this));
    this.router.get("/alerts/severity/:severity", this.getAlertsBySeverity.bind(this));
    this.router.get("/alerts/status/:status", this.getAlertsByStatus.bind(this));
    this.router.put("/alerts/:id/resolve", this.resolveAlert.bind(this));
    this.router.put("/alerts/:id/status", this.updateAlertStatus.bind(this));
    this.router.delete("/alerts/:id", this.deleteAlert.bind(this));

    // Poziva ga AnalysisEngine
    this.router.post("/alerts/correlation", this.createAlertFromCorrelation.bind(this));
  }

  getRouter() {
    return this.router;
  }

  async createAlert(req: Request, res: Response) {
    try {
      const data: CreateAlertDTO = req.body;
      const result = await this.alertService.createAlert(data);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Poziva ga AnalysisEngine
  async createAlertFromCorrelation(req: Request, res: Response) {
    try {
      const data: CreateAlertFromCorrelationDTO = req.body;

      if (!data.correlationId || !data.description || !data.correlatedEventIds) {
        return res.status(400).json({
          error: "Missing required fields: correlationId, description, correlatedEventIds"
        });
      }

      const alertData: CreateAlertDTO = {
        title: `Security Correlation Detected #${data.correlationId}`,
        description: data.description,
        severity: data.severity || AlertSeverity.HIGH,
        correlatedEvents: data.correlatedEventIds,
        source: "AnalysisEngine"
      };

      const alert = await this.alertService.createAlert(alertData);

      // SAD KORISTIMO NOTIFICATION SERVIS, NE AlertService!
      await this.notificationService.showAlert(data.correlationId);

      console.log(
        `\x1b[32m[AlertController]\x1b[0m Alert created from correlation ${data.correlationId}`
      );

      return res.status(201).json(alert);
    } catch (err: any) {
      console.error(
        `\x1b[31m[AlertController]\x1b[0m Error creating alert from correlation:`,
        err.message
      );
      return res.status(500).json({ error: err.message });
    }
  }

  async getAllAlerts(req: Request, res: Response) {
    try {
      const alerts = await this.alertService.getAllAlerts();
      res.json(alerts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAlertById(req: Request, res: Response) {
    try {
      const alert = await this.alertService.getAlertById(Number(req.params.id));
      res.json(alert);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async getAlertsBySeverity(req: Request, res: Response) {
    try {
      const severity = req.params.severity.toUpperCase() as AlertSeverity;
      const results = await this.alertService.getAlertsBySeverity(severity);
      res.json(results);
    } catch {
      res.status(400).json({ error: "Invalid severity value" });
    }
  }

  async getAlertsByStatus(req: Request, res: Response) {
    try {
      const status = req.params.status.toUpperCase() as AlertStatus;
      const results = await this.alertService.getAlertsByStatus(status);
      res.json(results);
    } catch {
      res.status(400).json({ error: "Invalid status value" });
    }
  }

  async resolveAlert(req: Request, res: Response) {
    try {
      const data: ResolveAlertDTO = req.body;
      const updated = await this.alertService.resolveAlert(
        Number(req.params.id),
        data
      );
      res.json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async updateAlertStatus(req: Request, res: Response) {
    try {
      const status: AlertStatus = req.body.status;
      const updated = await this.alertService.updateAlertStatus(
        Number(req.params.id),
        status
      );
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteAlert(req: Request, res: Response) {
    try {
      const ok = await this.alertService.deleteAlert(Number(req.params.id));
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
