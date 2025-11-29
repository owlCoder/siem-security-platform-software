import { Router, Request, Response } from "express";
import { IAlertService } from "../../Domain/services/IAlertService";
import { AlertSeverity } from "../../Domain/enums/AlertSeverity";
import { AlertStatus } from "../../Domain/enums/AlertStatus";

export class AlertController {

  private router: Router;

  constructor(private alertService: IAlertService) {
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
  }

  getRouter() {
    return this.router;
  }

  async createAlert(req: Request, res: Response) {
    try {
      const result = await this.alertService.createAlert(req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  async getAllAlerts(req: Request, res: Response) {
    const alerts = await this.alertService.getAllAlerts();
    res.json(alerts);
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
    const severity = req.params.severity as AlertSeverity;
    const results = await this.alertService.getAlertsBySeverity(severity);
    res.json(results);
  }

  async getAlertsByStatus(req: Request, res: Response) {
    const status = req.params.status as AlertStatus;
    const results = await this.alertService.getAlertsByStatus(status);
    res.json(results);
  }

  async resolveAlert(req: Request, res: Response) {
    try {
      const updated = await this.alertService.resolveAlert(Number(req.params.id), req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async updateAlertStatus(req: Request, res: Response) {
    try {
      const updated = await this.alertService.updateAlertStatus(Number(req.params.id), req.body.status);
      res.json(updated);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async deleteAlert(req: Request, res: Response) {
    const ok = await this.alertService.deleteAlert(Number(req.params.id));
    res.json({ success: ok });
  }
}
