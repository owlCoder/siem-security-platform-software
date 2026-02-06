import { Router, Request, Response } from "express";
import { IsNull, Repository } from "typeorm";

import { ServiceCheck } from "../../Domain/models/ServiceCheck";
import { ServiceIncident } from "../../Domain/models/ServiceIncident";
import { ServiceThreshold } from "../../Domain/models/ServiceThreshold";

import { IMonitoringService } from "../../Domain/services/IMonitoringService";
import { IIncidentService } from "../../Domain/services/IIncidentService";
import { IAnalyticsService } from "../../Domain/services/IAnalyticsService";

export class StatusMonitorController {
  private readonly router: Router;

  constructor(
    private readonly monitoringService: IMonitoringService,
    private readonly incidentService: IIncidentService, //obrisi ako ne budes koristio
    private readonly analyticsService: IAnalyticsService,
    private readonly checkRepo: Repository<ServiceCheck>,
    private readonly incidentRepo: Repository<ServiceIncident>,
    private readonly thresholdRepo: Repository<ServiceThreshold>
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/status", this.getStatus.bind(this));
    this.router.get("/checks", this.getChecks.bind(this));
    this.router.get("/incidents", this.getIncidents.bind(this));
    this.router.get("/stats/:serviceName", this.getStats.bind(this));
  }

  /* ========================
     STATUS
  ======================== */
  private async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const services = await this.thresholdRepo.find();
      const result = [];

      for (const s of services) {
        const lastCheck = await this.checkRepo.findOne({
          where: { serviceName: s.serviceName },
          order: { checkedAt: "DESC" },
        });

        const activeIncident = await this.incidentRepo.findOne({
                where: { serviceName: s.serviceName, endTime: IsNull() }
            });

            // POZIVAMO NOVU METODU
            const history = await this.analyticsService.get30DayHistory(s.serviceName);

        result.push({
                serviceName: s.serviceName,
                pingUrl: s.pingUrl,
                lastCheck: lastCheck ?? null,
                isDown: !!activeIncident,
                incidentId: activeIncident ? activeIncident.id : null,
                history: history 
        });
      }

      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch status" });
    }
  }

  /* ========================
     CHECKS
  ======================== */
  private async getChecks(req: Request, res: Response): Promise<void> {
    try {
      const service = String(req.query.service || "");
      if (!service) {
        res.status(400).json({ message: "Missing service query param" });
        return;
      }

      const limit = Math.min(Number(req.query.limit || 50), 200);

      const checks = await this.checkRepo.find({
        where: { serviceName: service },
        order: { checkedAt: "DESC" },
        take: limit,
      });

      res.status(200).json(checks);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch checks" });
    }
  }

  /* ========================
     INCIDENTS
  ======================== */
  private async getIncidents(req: Request, res: Response): Promise<void> {
    try {
      const service = req.query.service as string | undefined;

      const where = service ? { serviceName: service } : {};

      const incidents = await this.incidentRepo.find({
        where,
        order: { startTime: "DESC" },
      });

      res.status(200).json(incidents);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  }

  private async getStats(req: Request, res: Response): Promise<void> {
  try {
    const serviceName = String(req.params.serviceName);
    const hours = Number(req.query.hours || 24);

    const stats = await this.analyticsService.calculateStats(serviceName, hours);
    
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate stats" });
  }
}

  public getRouter(): Router {
    return this.router;
  }
}
