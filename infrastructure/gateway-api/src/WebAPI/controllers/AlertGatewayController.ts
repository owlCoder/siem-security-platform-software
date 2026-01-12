import { Request, Response, Router } from "express";
import axios from "axios";
import { AlertQueryDTO } from "../../Domain/DTOs/AlertQueryDTO";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { requireSysAdmin } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { ILogerService } from "../../Domain/services/ILogerService";
import { ReqParams } from "../../Domain/types/ReqParams";

export class AlertGatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService, 
              private readonly authenticate: any,
              private readonly loggerService:ILogerService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // SSE Stream za real-time notifikacije
    this.router.get(
      "/siem/alerts/notifications/stream",
      /*this.authenticate,
      requireSysAdmin,*/
      this.streamAlertNotifications.bind(this)
    );

    // Alert CRUD operacije
    this.router.get(
      "/siem/alerts/search",
      /*this.authenticate,
      requireSysAdmin,*/
      this.searchAlerts.bind(this)
    );
    this.router.get(
      "/siem/alerts",
      /*this.authenticate,
      requireSysAdmin,*/
      this.getAllAlerts.bind(this)
    );
    this.router.get(
      "/siem/alerts/:id",
      /*this.authenticate,
      requireSysAdmin,*/
      this.getAlertById.bind(this)
    );
    this.router.put(
      "/siem/alerts/:id/resolve",
      /*this.authenticate,
      requireSysAdmin,*/
      this.resolveAlert.bind(this)
    );
    this.router.put(
      "/siem/alerts/:id/status",
      /*this.authenticate,
      requireSysAdmin,*/
      this.updateAlertStatus.bind(this)
    );
  }

  private async streamAlertNotifications(req: Request, res: Response): Promise<void> {
    const alertServiceURL = process.env.ALERT_SERVICE_API;

    if (!alertServiceURL) {
      res.status(500).json({ error: "Alert service URL not configured" });
      return;
    }

    try {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const userId = req.user?.user_id || "unknown";
      const username = req.user?.username || "unknown";

      this.loggerService.log(`\x1b[36m[Gateway]\x1b[0m SSE connection established for SysAdmin: ${username}`);

      const response = await axios.get(`${alertServiceURL}/alerts/notifications/stream`, {
        params: { clientId: `sysadmin_${userId}` },
        responseType: "stream",
        timeout: 0,
      });

      response.data.pipe(res);

      req.on("close", () => {
        this.loggerService.log(`\x1b[36m[Gateway]\x1b[0m SSE connection closed for ${username}`);
        response.data.destroy();
      });
    } catch (err) {
      this.loggerService.error(`\x1b[31m[Gateway]\x1b[0m SSE proxy error:${err}`);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to connect to alert service" });
      }
    }
  }

  private async getAllAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await this.gatewayService.getAllAlerts();
      res.status(200).json(alerts);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAlertById(req: Request<ReqParams<'id'>>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const alert = await this.gatewayService.getAlertById(id);
      res.status(200).json(alert);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async searchAlerts(req: Request, res: Response): Promise<void> {
    try {
      const query: AlertQueryDTO = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        severity: req.query.severity as any,
        status: req.query.status as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        source: req.query.source as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await this.gatewayService.searchAlerts(query);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async resolveAlert(req: Request<ReqParams<'id'>>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const resolvedBy = req.user?.username || "Unknown";
      const status = req.body.status || "RESOLVED";

      const result = await this.gatewayService.resolveAlert(id, resolvedBy, status);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async updateAlertStatus(req: Request<ReqParams<'id'>>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ message: "Status is required" });
        return;
      }

      const result = await this.gatewayService.updateAlertStatus(id, status);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
