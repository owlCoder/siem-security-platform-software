import { Request, RequestHandler, Response, Router } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { requireSysAdmin } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class SecurityMaturityGatewayController {
  private readonly router: Router;

  constructor(
    private readonly gatewayService: IGatewayService,
    private readonly authenticate: RequestHandler,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/security-maturity/current",
      this.authenticate,
      requireSysAdmin,
      this.getCurrent.bind(this),
    );

    this.router.get(
      "/security-maturity/trend",
      this.authenticate,
      requireSysAdmin,
      this.getTrend.bind(this),
    );

    this.router.get(
      "/security-maturity/incidents-by-category",
      this.authenticate,
      requireSysAdmin,
      this.getIncidentsByCategory.bind(this),
    );

    this.router.get(
      "/security-maturity/recommendations",
      this.authenticate,
      requireSysAdmin,
      this.getSecurityMaturityRecommendations.bind(this),
    );
  }

  private async getCurrent(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.gatewayService.getSecurityMaturityCurrent();
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getTrend(req: Request, res: Response): Promise<void> {
    try {
      const { metric, period } = req.query;

      const response = await this.gatewayService.getSecurityMaturityTrend(
        String(metric),
        String(period),
      );

      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getIncidentsByCategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { period } = req.query;

      const response =
        await this.gatewayService.getSecurityMaturityIncidentsByCategory(
          String(period),
        );

      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getSecurityMaturityRecommendations(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const response =
        await this.gatewayService.getSecurityMaturityRecommendations();
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
