import { Router, Request, Response } from "express";
import { TrendMetricType } from "../../Domain/enums/TrendMetricType";
import { TrendPeriod } from "../../Domain/enums/TrendPeriod";
import { KpiSnapshotQuery } from "../../Application/queries/KpiSnapshotQuery";

export class SecurityMaturityController {
  private readonly router: Router;

  constructor(private readonly query: KpiSnapshotQuery) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/current", this.getCurrent.bind(this));
    this.router.get(
      "/incidents-by-category",
      this.getIncidentsByCategory.bind(this),
    );
    this.router.get("/trend", this.getTrend.bind(this));
  }

  private async getCurrent(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.query.getCurrent();
      res.status(200).json(result);
    } catch (err) {
      console.error("[SecurityMatuirtyController]: getCurrent failed", err);
      res.status(500).json({ message: "Service error" });
    }
  }

  private async getIncidentsByCategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const period = req.query.period as TrendPeriod;
      const result = await this.query.getIncidentsByCategory(period);
      res.status(200).json(result);
    } catch (err) {
      console.error(
        "[SecurityMaturityController]: getIncidentsByCategory failed",
        err,
      );
      res.status(500).json({ message: "Service error" });
    }
  }

  private async getTrend(req: Request, res: Response): Promise<void> {
    try {
      const metric = req.query.metric as TrendMetricType;
      const period = req.query.period as TrendPeriod;

      const result = await this.query.getTrend(metric, period);
      res.status(200).json(result);
    } catch (err) {
      console.error("[SecurityMaturityController]: getTrend failed", err);
      res.status(500).json({ message: "Service error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
