import { Router, Request, Response } from "express";
import { IInsiderThreatService } from "../../Domain/services/IInsiderThreatService";
import { IUserRiskAnalysisService } from "../../Domain/services/IUserRiskAnalysisService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { ThreatQueryDTO } from "../../Domain/DTOs/ThreatQueryDTO";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";

export class InsiderThreatController {
  private readonly router: Router;

  constructor(
    private readonly threatService: IInsiderThreatService,
    private readonly riskService: IUserRiskAnalysisService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get("/threats", this.getAllThreats.bind(this));
    this.router.get("/threats/search", this.searchThreats.bind(this));
    this.router.get("/threats/unresolved", this.getUnresolvedThreats.bind(this));
    this.router.get("/threats/user/:userId", this.getThreatsByUserId.bind(this));
    this.router.get("/threats/:id", this.getThreatById.bind(this));
    this.router.post("/threats/:id/resolve", this.resolveThreat.bind(this));

    this.router.get("/user-risk-profiles", this.getAllUserRiskProfiles.bind(this));
    this.router.get("/user-risk-profiles/high-risk", this.getHighRiskUsers.bind(this));
    this.router.get("/user-risk-profiles/:userId/analysis", this.getUserRiskAnalysis.bind(this));
    this.router.post("/user-risk-profiles/:userId/recalculate", this.recalculateUserRisk.bind(this));
    this.router.get("/user-risk-profiles/:userId", this.getUserRiskProfile.bind(this));
  }

  private async getAllThreats(req: Request, res: Response): Promise<void> {
    try {
      const threats = await this.threatService.getAllThreats();
      res.json(threats);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.getAllThreats: ${message}`);
      res.status(500).json({ 
        error: "Failed to fetch threats",
        message 
      });
    }
  }

  private async getThreatById(req: Request, res: Response): Promise<void> {
    try {
      const threatId = parseInt(req.params.id, 10);
      
      if (isNaN(threatId)) {
        res.status(400).json({ error: "Invalid threat ID" });
        return;
      }

      const threat = await this.threatService.getThreatById(threatId);
      
      if (!threat) {
        res.status(404).json({ error: "Threat not found" });
        return;
      }

      res.json(threat);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.getThreatById: ${message}`);
      res.status(500).json({ 
        error: "Failed to fetch threat",
        message 
      });
    }
  }

  private async getThreatsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid userId - must be a number" });
        return;
      }
      
      const threats = await this.threatService.getThreatsByUserId(userId);
      res.json(threats);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.getThreatsByUserId: ${message}`);
      res.status(500).json({ error: "Failed to fetch threats", message });
    }
  }

  private async getUnresolvedThreats(req: Request, res: Response): Promise<void> {
    try {
      const threats = await this.threatService.getUnresolvedThreats();
      res.json(threats);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.getUnresolvedThreats: ${message}`);
      res.status(500).json({ error: "Failed to fetch unresolved threats", message });
    }
  }

  private async searchThreats(req: Request, res: Response): Promise<void> {
    try {
      const query: ThreatQueryDTO = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        userId: req.query.userId ? parseInt(req.query.userId as string, 10) : undefined, 
        threatType: req.query.threatType as ThreatType | undefined,
        riskLevel: req.query.riskLevel as RiskLevel | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        isResolved: req.query.isResolved === "true" ? true : req.query.isResolved === "false" ? false : undefined,
        sortBy: req.query.sortBy as ThreatQueryDTO["sortBy"],
        sortOrder: req.query.sortOrder as ThreatQueryDTO["sortOrder"],
      };
      const result = await this.threatService.getThreatsWithFilters(query);
      res.json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.searchThreats: ${message}`);
      res.status(500).json({ error: "Failed to search threats", message });
    }
  }

  private async resolveThreat(req: Request, res: Response): Promise<void> {
    try {
      const threatId = parseInt(req.params.id, 10);
      
      if (isNaN(threatId)) {
        res.status(400).json({ error: "Invalid threat ID" });
        return;
      }

      const { resolvedBy, resolutionNotes } = req.body;

      if (!resolvedBy) {
        res.status(400).json({ error: "resolvedBy is required" });
        return;
      }

      const threat = await this.threatService.resolveThreat(
        threatId,
        resolvedBy,
        resolutionNotes
      );

      res.json(threat);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.resolveThreat: ${message}`);
      res.status(500).json({ 
        error: "Failed to resolve threat",
        message 
      });
    }
  }

  private async getAllUserRiskProfiles(req: Request, res: Response): Promise<void> {
    try {
      const profiles = await this.riskService.getAllUserRiskProfiles();
      res.json(profiles);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.getAllUserRiskProfiles: ${message}`);
      res.status(500).json({ 
        error: "Failed to fetch user risk profiles",
        message 
      });
    }
  }

  private async getUserRiskProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);

      if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid userId - must be a number" });
        return;
      }

      const profile = await this.riskService.getUserRiskProfile(userId);
      
      if (!profile) {
        res.status(404).json({ error: "User risk profile not found" });
        return;
      }

      res.json(profile);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.getUserRiskProfile: ${message}`);
      res.status(500).json({ 
        error: "Failed to fetch user risk profile",
        message 
      });
    }
  }

  private async getHighRiskUsers(req: Request, res: Response): Promise<void> {
    try {
      const profiles = await this.riskService.getHighRiskUsers();
      res.json(profiles);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.getHighRiskUsers: ${message}`);
      res.status(500).json({ error: "Failed to fetch high-risk users", message });
    }
  }

  private async getUserRiskAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid userId - must be a number" });
        return;
      }
      
      const analysis = await this.riskService.getUserRiskAnalysis(userId);
      res.json(analysis);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.getUserRiskAnalysis: ${message}`);
      res.status(500).json({ error: "Failed to fetch risk analysis", message });
    }
  }

  private async recalculateUserRisk(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid userId - must be a number" });
        return;
      }
      
      const profile = await this.riskService.recalculateUserRisk(userId);
      res.json(profile);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`Error in InsiderThreatController.recalculateUserRisk: ${message}`);
      res.status(500).json({ error: "Failed to recalculate risk", message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}