import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AlertQueryDTO } from "../Domain/DTOs/AlertQueryDTO";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";
import axios from "axios";

export class GatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));

    // Users
    this.router.get("/users", authenticate, authorize("admin"), this.getAllUsers.bind(this));
    this.router.get("/users/:id", authenticate, authorize("admin", "seller"), this.getUserById.bind(this));

    // Alert
    
    // SSE Stream za real-time notifikacije
    this.router.get("/siem/alerts/notifications/stream", authenticate,authorize("sysadmin"),this.streamAlertNotifications.bind(this));

    // Alert CRUD operacije
    this.router.get("/siem/alerts/search", authenticate, authorize("sysadmin"), this.searchAlerts.bind(this));
    this.router.get("/siem/alerts",authenticate,authorize("sysadmin"),this.getAllAlerts.bind(this));
    this.router.get("/siem/alerts/:id",authenticate,authorize("sysadmin"),this.getAlertById.bind(this));
    this.router.put("/siem/alerts/:id/resolve",authenticate,authorize("sysadmin"),this.resolveAlert.bind(this));
    this.router.put("/siem/alerts/:id/status",authenticate,authorize("sysadmin"),this.updateAlertStatus.bind(this));

    // Query
    this.router.get("/siem/query/search", authenticate, authorize("sysadmin"), this.searchEvents.bind(this));
    this.router.get("/siem/query/oldEvents/:hours", authenticate, authorize("sysadmin"), this.getOldEvents.bind(this));
  }

  private async login(req: Request, res: Response): Promise<void> {
      const data: LoginUserDTO = req.body;
      const result = await this.gatewayService.login(data);
      res.status(200).json(result);
  }

  private async register(req: Request, res: Response): Promise<void> {
      const data: RegistrationUserDTO = req.body;
      const result = await this.gatewayService.register(data);
      res.status(200).json(result);
  }

  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10); 
      if (!req.user || req.user.id !== id) {
        res.status(401).json({ message: "You can only access your own data!" });
        return;
      }

      const user = await this.gatewayService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  // Alert

  private async streamAlertNotifications(req: Request, res: Response): Promise<void> {
    const alertServiceURL = process.env.ALERT_SERVICE_API;
    
    if (!alertServiceURL) {
      res.status(500).json({ error: "Alert service URL not configured" });
      return;
    }

    try {
      // Setup SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

      const userId = req.user?.id || "unknown";
      const username = req.user?.username || "unknown";

      console.log(`\x1b[36m[Gateway]\x1b[0m SSE connection established for SysAdmin: ${username}`);

      const response = await axios.get(
        `${alertServiceURL}/alerts/notifications/stream`,
        {
          params: { clientId: `sysadmin_${userId}` },
          responseType: "stream",
          timeout: 0, // No timeout for SSE
        }
      );

      // Proxy stream ka klijentu
      response.data.pipe(res);

      // Cleanup kada se klijent diskonektuje
      req.on("close", () => {
        console.log(`\x1b[36m[Gateway]\x1b[0m SSE connection closed for ${username}`);
        response.data.destroy();
      });

    } catch (err) {
      console.error(`\x1b[31m[Gateway]\x1b[0m SSE proxy error:`, err);
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

  private async getAlertById(req: Request, res: Response): Promise<void> {
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
        sortOrder: req.query.sortOrder as any
      };

      const result = await this.gatewayService.searchAlerts(query);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async resolveAlert(req: Request, res: Response): Promise<void> {
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

  private async updateAlertStatus(req: Request, res: Response): Promise<void> {
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

  private async searchEvents(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.query as string;
      const results = await this.gatewayService.searchEvents(query);
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getOldEvents(req: Request, res: Response): Promise<void> {
    try {
      const hours = Number(req.params.hours);
      const results = await this.gatewayService.getOldEvents(hours);
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
