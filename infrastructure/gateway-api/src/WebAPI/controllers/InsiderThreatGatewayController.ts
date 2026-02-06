import { Request, Response, Router } from "express";
import { ThreatQueryDTO } from "../../Domain/DTOs/ThreatQueryDTO";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { requireSysAdmin } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { ILogerService } from "../../Domain/services/ILogerService";
import { ReqParams } from "../../Domain/types/ReqParams";

export class InsiderThreatGatewayController {
  private readonly router: Router;

  constructor(
    private readonly gatewayService: IGatewayService,
    private readonly authenticate: any,
    private readonly loggerService: ILogerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Threat endpoints
    this.router.get(
      "/insider-threats/search",
      this.authenticate,
      this.searchThreats.bind(this)
    );
    this.router.get(
      "/insider-threats/unresolved",
      this.authenticate,
      this.getUnresolvedThreats.bind(this)
    );
    this.router.get(
      "/insider-threats",
      this.authenticate,
      this.getAllThreats.bind(this)
    );
    this.router.get(
      "/insider-threats/:id",
      this.authenticate,
      this.getThreatById.bind(this)
    );
    this.router.get(
      "/insider-threats/user/:userId",
      this.authenticate,
      this.getThreatsByUserId.bind(this)
    );
    this.router.put(
      "/insider-threats/:id/resolve",
      this.authenticate,
      requireSysAdmin,
      this.resolveThreat.bind(this)
    );

    // User risk endpoints
    this.router.get(
      "/siem/user-risk/profiles",
      this.authenticate,
      this.getAllUserRiskProfiles.bind(this)
    );
    this.router.get(
      "/siem/user-risk/high-risk",
      this.authenticate,
      this.getHighRiskUsers.bind(this)
    );
    this.router.get(
      "/siem/user-risk/:userId",
      this.authenticate,
      this.getUserRiskProfile.bind(this)
    );
    this.router.get(
      "/siem/user-risk/:userId/analysis",
      this.authenticate,
      this.getUserRiskAnalysis.bind(this)
    );
    this.router.post(
      "/siem/user-risk/:userId/recalculate",
      this.authenticate,
      requireSysAdmin,
      this.recalculateUserRisk.bind(this)
    );
  }

  // =============== THREAT ENDPOINTS ===============

  private async getAllThreats(req: Request, res: Response): Promise<void> {
    try {
      const threats = await this.gatewayService.getAllInsiderThreats();
      res.status(200).json(threats);
    } catch (err) {
      this.loggerService.log(`Error fetching threats: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getThreatById(req: Request<ReqParams<"id">>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const threat = await this.gatewayService.getInsiderThreatById(id);
      res.status(200).json(threat);
    } catch (err) {
      this.loggerService.log(`Error fetching threat: ${(err as Error).message}`);
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async getThreatsByUserId(req: Request<ReqParams<"userId">>, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      const threats = await this.gatewayService.getInsiderThreatsByUserId(userId);
      res.status(200).json(threats);
    } catch (err) {
      this.loggerService.log(`Error fetching user threats: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUnresolvedThreats(req: Request, res: Response): Promise<void> {
    try {
      const threats = await this.gatewayService.getUnresolvedInsiderThreats();
      res.status(200).json(threats);
    } catch (err) {
      this.loggerService.log(`Error fetching unresolved threats: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async searchThreats(req: Request, res: Response): Promise<void> {
    try {
      const query: ThreatQueryDTO = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        threatType: req.query.threatType as ThreatQueryDTO["threatType"],
        riskLevel: req.query.riskLevel as ThreatQueryDTO["riskLevel"],
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        isResolved: req.query.isResolved === "true" ? true : req.query.isResolved === "false" ? false : undefined,
        sortBy: req.query.sortBy as ThreatQueryDTO["sortBy"],
        sortOrder: req.query.sortOrder as ThreatQueryDTO["sortOrder"],
      };

      const result = await this.gatewayService.searchInsiderThreats(query);
      res.status(200).json(result);
    } catch (err) {
      this.loggerService.log(`Error searching threats: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async resolveThreat(req: Request<ReqParams<"id">>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { resolvedBy, resolutionNotes } = req.body;

      if (!resolvedBy) {
        res.status(400).json({ message: "resolvedBy is required" });
        return;
      }

      const result = await this.gatewayService.resolveInsiderThreat(id, resolvedBy, resolutionNotes);
      res.status(200).json(result);
    } catch (err) {
      this.loggerService.log(`Error resolving threat: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =============== USER RISK ENDPOINTS ===============

  private async getAllUserRiskProfiles(req: Request, res: Response): Promise<void> {
    try {
      const profiles = await this.gatewayService.getAllUserRiskProfiles();
      res.status(200).json(profiles);
    } catch (err) {
      this.loggerService.log(`Error fetching risk profiles: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getHighRiskUsers(req: Request, res: Response): Promise<void> {
    try {
      const profiles = await this.gatewayService.getHighRiskUsers();
      res.status(200).json(profiles);
    } catch (err) {
      this.loggerService.log(`Error fetching high-risk users: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserRiskProfile(req: Request<ReqParams<"userId">>, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      const profile = await this.gatewayService.getUserRiskProfile(userId);
      res.status(200).json(profile);
    } catch (err) {
      this.loggerService.log(`Error fetching user risk profile: ${(err as Error).message}`);
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async getUserRiskAnalysis(req: Request<ReqParams<"userId">>, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      const analysis = await this.gatewayService.getUserRiskAnalysis(userId);
      res.status(200).json(analysis);
    } catch (err) {
      this.loggerService.log(`Error fetching risk analysis: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async recalculateUserRisk(req: Request<ReqParams<"userId">>, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      const profile = await this.gatewayService.recalculateUserRisk(userId);
      res.status(200).json(profile);
    } catch (err) {
      this.loggerService.log(`Error recalculating risk: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}