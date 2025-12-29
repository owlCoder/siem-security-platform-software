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
      "/siem/query/search",
      // this.authenticate,     // TODO: DELETE COMMENTS AFTER TESTING!
      // requireSysAdmin,
      this.searchEvents.bind(this)
    );
    this.router.get(
      "/siem/query/oldEvents/:hours",
      // this.authenticate,
      // requireSysAdmin,
      this.getOldEvents.bind(this)
    );
    this.router.get(
      "/siem/query/lastThreeEvents",
      // this.authenticate,
      // requireSysAdmin,
      this.getLastThreeEvents.bind(this)
    );
    this.router.get(
      "/siem/query/events",
      // this.authenticate,
      // requireSysAdmin,
      this.getAllEvents.bind(this)
    );
    this.router.get(
      "/siem/query/eventsCount",
      // this.authenticate,
      // requireSysAdmin,
      this.getEventsCount.bind(this)
    );
    this.router.get(
      "/siem/query/infoCount",
      // this.authenticate,
      // requireSysAdmin,
      this.getInfoCount.bind(this)
    );
    this.router.get(
      "/siem/query/warningCount",
      // this.authenticate,
      // requireSysAdmin,
      this.getWarningCount.bind(this)
    );
    this.router.get(
      "/siem/query/errorCount",
      // this.authenticate,
      // requireSysAdmin,
      this.getErrorCount.bind(this)
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

  public getRouter(): Router {
    return this.router;
  }
}
