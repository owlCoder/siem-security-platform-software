import { Router, Request, Response } from "express";
import { IInsiderThreatService } from "../../Domain/services/IInsiderThreatService";
import { IUserRiskAnalysisService } from "../../Domain/services/IUserRiskAnalysisService";
import { ILoggerService } from "../../Domain/services/ILoggerService";

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
    } catch (error: any) {
      this.logger.log(`Error in InsiderThreatController.getAllThreats: ${error.message}`);
      res.status(500).json({ 
        error: "Failed to fetch threats",
        message: error.message 
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
    } catch (error: any) {
      this.logger.log(`Error in InsiderThreatController.getThreatById: ${error.message}`);
      res.status(500).json({ 
        error: "Failed to fetch threat",
        message: error.message 
      });
    }
  }

  private async getThreatsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      
      this.logger.log(`[InsiderThreatController] GET /threats/user/${userId}`);
      
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }
      const threats = await this.threatService.getThreatsByUserId(userId);
      
      this.logger.log(`[InsiderThreatController] Found ${threats.length} threats for user ${userId}`);
      res.json(threats);
    } catch (error: any) {
      this.logger.log(`[InsiderThreatController] ERROR in getThreatsByUserId: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch threats", message: error.message });
    }
  }

  private async getUnresolvedThreats(req: Request, res: Response): Promise<void> {
    try {
      this.logger.log(`[InsiderThreatController] GET /threats/unresolved`);
      
      const threats = await this.threatService.getUnresolvedThreats();
      
      this.logger.log(`[InsiderThreatController] Found ${threats.length} unresolved threats`);
      res.json(threats);
    } catch (error: any) {
      this.logger.log(`[InsiderThreatController] ERROR in getUnresolvedThreats: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch unresolved threats", message: error.message });
    }
  }

  private async searchThreats(req: Request, res: Response): Promise<void> {
    try {
      this.logger.log(`[InsiderThreatController] GET /threats/search`);
      this.logger.log(`[InsiderThreatController] Query params: ${JSON.stringify(req.query)}`);
      
      const query = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        userId: req.query.userId as string,
        threatType: req.query.threatType as any,
        riskLevel: req.query.riskLevel as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        isResolved: req.query.isResolved === "true" ? true : req.query.isResolved === "false" ? false : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };
      const result = await this.threatService.getThreatsWithFilters(query);
      
      this.logger.log(`[InsiderThreatController] Search result: ${result.data.length} threats (page ${result.pagination.page}/${result.pagination.totalPages})`);
      res.json(result);
    } catch (error: any) {
      this.logger.log(`[InsiderThreatController] ERROR in searchThreats: ${error.message}`);
      res.status(500).json({ error: "Failed to search threats", message: error.message });
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
    } catch (error: any) {
      this.logger.log(`Error in InsiderThreatController.resolveThreat: ${error.message}`);
      res.status(500).json({ 
        error: "Failed to resolve threat",
        message: error.message 
      });
    }
  }


  private async getAllUserRiskProfiles(req: Request, res: Response): Promise<void> {
    try {
      const profiles = await this.riskService.getAllUserRiskProfiles();
      res.json(profiles);
    } catch (error: any) {
      this.logger.log(`Error in InsiderThreatController.getAllUserRiskProfiles: ${error.message}`);
      res.status(500).json({ 
        error: "Failed to fetch user risk profiles",
        message: error.message 
      });
    }
  }

 
  private async getUserRiskProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const profile = await this.riskService.getUserRiskProfile(userId);
      
      if (!profile) {
        res.status(404).json({ error: "User risk profile not found" });
        return;
      }

      res.json(profile);
    } catch (error: any) {
      this.logger.log(`Error in InsiderThreatController.getUserRiskProfile: ${error.message}`);
      res.status(500).json({ 
        error: "Failed to fetch user risk profile",
        message: error.message 
      });
    }
  }

  private async getHighRiskUsers(req: Request, res: Response): Promise<void> {
    try {
      this.logger.log(`[InsiderThreatController] GET /user-risk-profiles/high-risk`);
      
      const profiles = await this.riskService.getHighRiskUsers();
      
      this.logger.log(`[InsiderThreatController] Found ${profiles.length} high-risk users`);
      res.json(profiles);
    } catch (error: any) {
      this.logger.log(`[InsiderThreatController] ERROR in getHighRiskUsers: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch high-risk users", message: error.message });
    }
  }

  private async getUserRiskAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      
      this.logger.log(`[InsiderThreatController] GET /user-risk-profiles/${userId}/analysis`);
      
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }
      const analysis = await this.riskService.getUserRiskAnalysis(userId);
      
      this.logger.log(`[InsiderThreatController] Generated risk analysis for user ${userId}`);
      res.json(analysis);
    } catch (error: any) {
      this.logger.log(`[InsiderThreatController] ERROR in getUserRiskAnalysis: ${error.message}`);
      res.status(500).json({ error: "Failed to fetch risk analysis", message: error.message });
    }
  }

  private async recalculateUserRisk(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      
      this.logger.log(`[InsiderThreatController] POST /user-risk-profiles/${userId}/recalculate`);
      
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }
      const profile = await this.riskService.recalculateUserRisk(userId);
      
      this.logger.log(`[InsiderThreatController] Recalculated risk for user ${userId}`);
      res.json(profile);
    } catch (error: any) {
      this.logger.log(`[InsiderThreatController] ERROR in recalculateUserRisk: ${error.message}`);
      res.status(500).json({ error: "Failed to recalculate risk", message: error.message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}