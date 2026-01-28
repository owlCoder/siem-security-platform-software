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
    this.router.get("/threats/:id", this.getThreatById.bind(this));
    this.router.post("/threats/:id/resolve", this.resolveThreat.bind(this));
    
    this.router.get("/user-risk-profiles", this.getAllUserRiskProfiles.bind(this));
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

  public getRouter(): Router {
    return this.router;
  }
}