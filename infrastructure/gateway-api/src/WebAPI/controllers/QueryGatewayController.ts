import { Request, Response, Router } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { requireSysAdmin } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class QueryGatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService, private readonly authenticate: any) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/query/search",
      this.authenticate,
      requireSysAdmin,
      this.searchEvents.bind(this)
    );
    this.router.get(
      "/query/oldEvents/:hours",
      this.authenticate,
      requireSysAdmin,
      this.getOldEvents.bind(this)
    );
    this.router.get(
      "/query/lastThreeEvents",
      this.authenticate,
      requireSysAdmin,
      this.getLastThreeEvents.bind(this)
    );
    this.router.get(
      "/query/events",
      this.authenticate,
      requireSysAdmin,
      this.getAllEvents.bind(this)
    );
    this.router.get(
      "/query/eventsCount",
      this.authenticate,
      requireSysAdmin,
      this.getEventsCount.bind(this)
    );
    this.router.get(
      "/query/infoCount",
      this.authenticate,
      requireSysAdmin,
      this.getInfoCount.bind(this)
    );
    this.router.get(
      "/query/warningCount",
      this.authenticate,
      requireSysAdmin,
      this.getWarningCount.bind(this)
    );
    this.router.get(
      "/query/errorCount",
      this.authenticate,
      requireSysAdmin,
      this.getErrorCount.bind(this)
    );
    this.router.get(
      "/query/distribution",
      this.authenticate,
      requireSysAdmin,
      this.getEventDistribution.bind(this)
    );

    this.router.get(
      "/query/statistics/events",
      this.authenticate,
      requireSysAdmin,
      this.getEventStatistics.bind(this)
    );

    this.router.get(
      "/query/statistics/alerts",
      this.authenticate,
      requireSysAdmin,
      this.getAlertStatistics.bind(this)
    );

    this.router.get(
      "/query/totalEventCount",
      this.authenticate,
      requireSysAdmin,
      this.getTotalEventCount.bind(this)
    );

    this.router.get(
      "/query/errorEventCount",
      this.authenticate,
      requireSysAdmin,
      this.getErrorEventCount.bind(this)
    );

    this.router.get(
      "/query/eventRate",
      this.authenticate,
      requireSysAdmin,
      this.getEventRate.bind(this)
    );

    this.router.get(
      "/query/alertsCountBySeverity",
      this.authenticate,
      requireSysAdmin,
      this.getAlertsCountBySeverity.bind(this)
    );

    this.router.get(
      "/query/criticalAlertsCount",
      this.authenticate,
      requireSysAdmin,
      this.getCriticalAlertsCount.bind(this)
    );

    this.router.get(
      "/query/anomalyRate",
      this.authenticate,
      requireSysAdmin,
      this.getAnomalyRate.bind(this)
    );

    this.router.get(
      "/query/burstAnomaly",
      this.authenticate,
      requireSysAdmin,
      this.getBurstAnomaly.bind(this)
    );

    this.router.get(
      "/query/uniqueServicesCount",
      this.authenticate,
      requireSysAdmin,
      this.getUniqueServicesCount.bind(this)
    );

    this.router.get(
      "/query/uniqueIpsCount",
      this.authenticate,
      requireSysAdmin,
      this.getUniqueIpsCount.bind(this)
    );

    this.router.get(
      "/query/uniqueServices",
      this.authenticate,
      requireSysAdmin,
      this.getUniqueServices.bind(this)
    );

    this.router.get(
      "/query/uniqueIps",
      this.authenticate,
      requireSysAdmin,
      this.getUniqueIps.bind(this)
    );

    this.router.get(
      "/query/oldAlerts/:hours",
      this.authenticate,
      requireSysAdmin,
      this.getOldAlerts.bind(this)
    );

    this.router.get(
      "/query/alerts",
      this.authenticate,
      requireSysAdmin,
      this.getAllAlerts.bind(this)
    );

    this.router.post(
      "/query/searchAlerts",
      this.authenticate,
      requireSysAdmin,
      this.searchAlerts.bind(this)
    );

    this.router.get(
      "/query/alertsCount",
      this.authenticate,
      requireSysAdmin,
      this.getAlertsCount.bind(this)
    );
  }

  private async searchEvents(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.p as string) || 1;
      const limit = Number(req.query.l as string) || 50;
      const results = await this.gatewayService.searchEvents(query, page, limit);
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

  private async getAllEvents(req: Request, res: Response): Promise<void> {
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

  private async getEventDistribution(req: Request, res: Response): Promise<void> {
    try {
      const distribution = await this.gatewayService.getEventDistribution();
      res.status(200).json(distribution);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getEventStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.gatewayService.getEventStatistics();
      res.status(200).json(statistics);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAlertStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.gatewayService.getAlertStatistics();
      res.status(200).json(statistics);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getTotalEventCount(req: Request, res: Response): Promise<void> {
    try {
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as string;
      const count = await this.gatewayService.getTotalEventCount(entityType as any, entityId);
      res.status(200).json({ count });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getErrorEventCount(req: Request, res: Response): Promise<void> {
    try {
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as string;
      const hours = Number(req.query.hours);
      const count = await this.gatewayService.getErrorEventCount(entityType as any, entityId, hours);
      res.status(200).json({ count });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getEventRate(req: Request, res: Response): Promise<void> {
    try {
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as string;
      const hours = Number(req.query.hours);
      const rate = await this.gatewayService.getEventRate(entityType as any, entityId, hours);
      res.status(200).json({ rate });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAlertsCountBySeverity(req: Request, res: Response): Promise<void> {
    try {
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as string;
      const counts = await this.gatewayService.getAlertsCountBySeverity(entityType as any, entityId);
      res.status(200).json(Object.fromEntries(counts));
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getCriticalAlertsCount(req: Request, res: Response): Promise<void> {
    try {
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as string;
      const count = await this.gatewayService.getCriticalAlertsCount(entityType as any, entityId);
      res.status(200).json({ count });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAnomalyRate(req: Request, res: Response): Promise<void> {
    try {
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as string;
      const hours = Number(req.query.hours);
      const rate = await this.gatewayService.getAnomalyRate(entityType as any, entityId, hours);
      res.status(200).json({ rate });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getBurstAnomaly(req: Request, res: Response): Promise<void> {
    try {
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as string;
      const hours = Number(req.query.hours);
      const isBurst = await this.gatewayService.getBurstAnomaly(entityType as any, entityId, hours);
      res.status(200).json({ isBurst });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUniqueServicesCount(req: Request, res: Response): Promise<void> {
    try {
      const ipAddress = req.query.ipAddress as string;
      const count = await this.gatewayService.getUniqueServicesCount(ipAddress);
      res.status(200).json({ count });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUniqueIpsCount(req: Request, res: Response): Promise<void> {
    try {
      const serviceName = req.query.serviceName as string;
      const count = await this.gatewayService.getUniqueIpsCount(serviceName);
      res.status(200).json({ count });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUniqueServices(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getUniqueServices();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUniqueIps(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getUniqueIps();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getOldAlerts(req: Request, res: Response): Promise<void> {
    try {
      const hours = Number(req.params.hours);
      const results = await this.gatewayService.getOldAlerts(hours);
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAllAlerts(req: Request, res: Response): Promise<void> {
    try {
      const results = await this.gatewayService.getAllAlertsFromQuery();
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async searchAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alertQueryDTO = req.body;
      const results = await this.gatewayService.searchAlertsFromQuery(alertQueryDTO);
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAlertsCount(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getAlertsCountFromQuery();
      res.status(200).json({ count: result });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
