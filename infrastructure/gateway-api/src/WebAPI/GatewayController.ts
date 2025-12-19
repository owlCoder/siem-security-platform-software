import { raw, Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AlertQueryDTO } from "../Domain/DTOs/AlertQueryDTO";
import { createAuthMiddleware } from "../Middlewares/authentification/AuthMiddleware";
import {
  authorize,
  requireSysAdmin,
  ROLES,
} from "../Middlewares/authorization/AuthorizeMiddleware";
import axios from "axios";

export class GatewayController {
  private readonly router: Router;
  private readonly authenticate: any;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.authenticate = createAuthMiddleware(gatewayService);
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));

    // Users
    this.router.get(
      "/users",
      this.authenticate,
      authorize(ROLES.ADMIN),
      this.getAllUsers.bind(this)
    );
    this.router.get(
      "/users/:id",
      this.authenticate,
      authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
      this.getUserById.bind(this)
    );

    // Alert

    // SSE Stream za real-time notifikacije
    this.router.get(
      "/siem/alerts/notifications/stream",
      this.authenticate,
      requireSysAdmin,
      this.streamAlertNotifications.bind(this)
    );

    // Alert CRUD operacije
    this.router.get(
      "/siem/alerts/search",
      this.authenticate,
      requireSysAdmin,
      this.searchAlerts.bind(this)
    );
    this.router.get(
      "/siem/alerts",
      this.authenticate,
      requireSysAdmin,
      this.getAllAlerts.bind(this)
    );
    this.router.get(
      "/siem/alerts/:id",
      this.authenticate,
      requireSysAdmin,
      this.getAlertById.bind(this)
    );
    this.router.put(
      "/siem/alerts/:id/resolve",
      this.authenticate,
      requireSysAdmin,
      this.resolveAlert.bind(this)
    );
    this.router.put(
      "/siem/alerts/:id/status",
      this.authenticate,
      requireSysAdmin,
      this.updateAlertStatus.bind(this)
    );

    // Query
    this.router.get(
      "/siem/query/search",
      this.authenticate,
      requireSysAdmin,
      this.searchEvents.bind(this)
    );
    this.router.get(
      "/siem/query/oldEvents/:hours",
      this.authenticate,
      requireSysAdmin,
      this.getOldEvents.bind(this)
    );
    this.router.get(
      "/siem/query/lastThreeEvents",
      this.authenticate,
      requireSysAdmin,
      this.getLastThreeEvents.bind(this)
    );
    this.router.get(
      "/siem/query/events",
      this.authenticate,
      requireSysAdmin,
      this.getAllEvents.bind(this)
    );
    this.router.get(
      "/siem/query/eventsCount",
      this.authenticate,
      requireSysAdmin,
      this.getEventsCount.bind(this)
    );
    this.router.get(
      "/siem/query/infoCount",
      this.authenticate,
      requireSysAdmin,
      this.getInfoCount.bind(this)
    );
    this.router.get( 
      "/siem/query/warningCount",
      this.authenticate,
      requireSysAdmin,
      this.getWarningCount.bind(this)
    );  
    this.router.get(
      "/siem/query/errorCount",
      this.authenticate,
      requireSysAdmin,
      this.getErrorCount.bind(this)
    );

    // Storage
    this.router.get(
      "/storageLog",
      this.authenticate,
      this.getAllArchives.bind(this)
    );

    this.router.get(
      "/storageLog/search",
      this.authenticate,
      this.searchArchives.bind(this)
    );

    this.router.get(
      "/storageLog/sort",
      this.authenticate,
      this.sortArchives.bind(this)
    );

    this.router.get(
      "/storageLog/stats",
      this.authenticate,
      this.getArchiveStats.bind(this)
    );

    this.router.get(
      "/storageLog/file/:id",
      this.authenticate,
      this.downloadArchive.bind(this)
    );

    this.router.post(
      "/storageLog/run",
      this.authenticate,
      this.runArchiveProcess.bind(this)
    );

    this.router.get(
      "/storageLog/top",
      this.authenticate,
      this.getTopArchives.bind(this)
    );

    this.router.get(
      "/storageLog/volume",
      this.authenticate,
      this.getArchiveVolume.bind(this)
    );

    //Parser
    this.router.get("/parserEvents", this.authenticate, requireSysAdmin, this.getAllParserEvents.bind(this));
    this.router.get("/parserEvents/:id", this.authenticate, requireSysAdmin, this.getParserEvent.bind(this));
    this.router.post("/parserEvents/log", this.authenticate, requireSysAdmin, this.log.bind(this));
    this.router.delete("/parserEvents/:id", this.authenticate, requireSysAdmin, this.deleteParserEvent.bind(this));

    //Analysis Engine
    this.router.get(
      "/analysis-engine/normalize",
      this.authenticate,
      requireSysAdmin,
       this.gatewayService.analysisEngineNormalize.bind(this));

    this.router.get(
      "/analysis-engine/deleteCorrelationsByEventIds",
      this.authenticate,
      requireSysAdmin,
       this.gatewayService.analysisEngineDeleteCorrelationsByEventIds.bind(this));
  }

  //Parser

  private async getAllParserEvents(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.gatewayService.getAllParserEvents();
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getParserEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const response = await this.gatewayService.getParserEventById(id);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async log(req: Request, res: Response): Promise<void> {
    try {
      const rawMessage = req.body.message as string;
      const source = req.body.source as string;
      const response = await this.gatewayService.log(rawMessage, source);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async deleteParserEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const response = await this.gatewayService.deleteById(id);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
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
      if (!req.user || req.user.user_id !== id) {
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

  private async streamAlertNotifications(
    req: Request,
    res: Response
  ): Promise<void> {
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

      const userId = req.user?.user_id || "unknown";
      const username = req.user?.username || "unknown";

      console.log(
        `\x1b[36m[Gateway]\x1b[0m SSE connection established for SysAdmin: ${username}`
      );

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
        console.log(
          `\x1b[36m[Gateway]\x1b[0m SSE connection closed for ${username}`
        );
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
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
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

  private async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const resolvedBy = req.user?.username || "Unknown";
      const status = req.body.status || "RESOLVED";

      const result = await this.gatewayService.resolveAlert(
        id,
        resolvedBy,
        status
      );
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

  // Query
  private async searchEvents(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
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

  private async getLastThreeEvents(req: Request, res: Response): Promise<void> {
    try {
      const results = await this.gatewayService.getLastThreeEvents();
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAllEvents(rew: Request, res: Response): Promise<void> {
    try {
      const results = await this.gatewayService.getAllEvents();
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getEventsCount(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getEventsCount();
      res.status(200).json({ count: result });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getInfoCount(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getInfoCount();
      res.status(200).json({ count: result });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getWarningCount(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getWarningCount();
      res.status(200).json({ count: result });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getErrorCount(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getErrorCount();
      res.status(200).json({ count: result });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    } 
  }

  // Storage
  private async getAllArchives(req: Request, res: Response) {
    try {
      const archives = await this.gatewayService.getAllArchives();
      res.status(200).json(archives);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async searchArchives(req: Request, res: Response) {
    try {
      const archives = await this.gatewayService.searchArchives(req.query.q as string);
      res.status(200).json(archives);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async sortArchives(req: Request, res: Response) {
    try {
      const { by, order } = req.query;
      const archives = await this.gatewayService.sortArchives(by as any, order as any);
      res.status(200).json(archives);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getArchiveStats(req: Request, res: Response) {
    try {
      const stats = await this.gatewayService.getArchiveStats();
      res.status(200).json(stats);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async runArchiveProcess(req: Request, res: Response) {
    try {
      const result = await this.gatewayService.runArchiveProcess();
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async downloadArchive(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const fileBuffer = await this.gatewayService.downloadArchive(id);

      res.setHeader("Content-Type", "application/x-tar"); //obavestavamo browsera da je to tar fajl
      res.setHeader("Content-Disposition", `attachment; filename="archive_${id}.tar"`); //iz ovoga zna browser da treba da skine taj fajl

      res.status(200).send(fileBuffer); //ovde saljemo binarni sadrzaj fajla klijentu
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getTopArchives(req: Request, res: Response) {
    try {
      const type = req.query.type as "events" | "alerts";
      const limit = Number(req.query.limit) || 5;
      const result = await this.gatewayService.getTopArchives(type, limit);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getArchiveVolume(req: Request, res: Response) {
    try {
      const period = req.query.period as "daily" | "monthly" | "yearly";
      const result = await this.gatewayService.getArchiveVolume(period);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  //Analysis Engine
  private async analysisEngineNormalize(req: Request, res: Response): Promise<void> {
    try {
      const rawMessage = req.body.message as string;

      if(!rawMessage){
        res.status(400).json({ message: "Raw message is required" });
        return;
      }
      
      const result = await this.gatewayService.analysisEngineNormalize(rawMessage);

      
      res.status(200).json(result);
    } catch (err) {
        console.error("[AnalysisEngineErorr]", err);
        res.status(500).json({ message: "Internal server error" });
    }

  }

  private async analysisEngineDeleteCorrelationsByEventIds(req: Request, res: Response): Promise<void> {
    try {
      const eventIds: number[] = req.body.eventIds;
      
      if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
        res.status(400).json({
           message: "Event IDs are required" 
          });
        return;
      }
      const deletedCount = await this.gatewayService.analysisEngineDeleteCorrelationsByEventIds(eventIds);

      if(deletedCount === 0){
        res.status(204).send();
        return;
      }

      res.status(200).json({ 
        deletedCount: deletedCount
       });

    } catch (err) {
        console.error("[AnalysisEngineError]", err);
        res.status(500).json({ message: "Internal server error" });
    }
  }


  public getRouter(): Router {
    return this.router;
  }
}
