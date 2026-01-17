import { Router, Request, Response } from "express";
import { IInsiderThreatService } from "../../Domain/services/IInsiderThreatService";
import { IUserRiskAnalysisService } from "../../Domain/services/IUserRiskAnalysisService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";
import { CreateInsiderThreatDTO } from "../../Domain/DTOs/CreateInsiderThreatDTO";
import { ThreatQueryDTO } from "../../Domain/DTOs/ThreatQueryDTO";
import {
  validateThreatId,
  validateUserId,
  validateCreateInsiderThreatDTO,
  validateThreatType,
  validateRiskLevel
} from "../validators/InsiderThreatValidators";

export class InsiderThreatController {
  private readonly router: Router;

  constructor(
    private readonly threatService: IInsiderThreatService,
    private readonly riskService: IUserRiskAnalysisService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Threat endpoints
    this.router.get("/threats/search", this.searchThreats.bind(this));
    this.router.get("/threats/unresolved", this.getUnresolvedThreats.bind(this));
    this.router.get("/threats", this.getAllThreats.bind(this));
    this.router.post("/threats", this.createThreat.bind(this));
    this.router.get("/threats/:id", this.getThreatById.bind(this));
    this.router.put("/threats/:id/resolve", this.resolveThreat.bind(this));
    this.router.get("/threats/user/:userId", this.getThreatsByUserId.bind(this));
    this.router.get("/threats/type/:type", this.getThreatsByType.bind(this));
    this.router.get("/threats/risk/:level", this.getThreatsByRiskLevel.bind(this));

    // User risk endpoints
    this.router.get("/risk/users", this.getAllUserRiskProfiles.bind(this));
    this.router.get("/risk/users/high-risk", this.getHighRiskUsers.bind(this));
    this.router.get("/risk/users/:userId", this.getUserRiskProfile.bind(this));
    this.router.get("/risk/users/:userId/analysis", this.getUserRiskAnalysis.bind(this));
    this.router.post("/risk/users/:userId/recalculate", this.recalculateUserRisk.bind(this));
  }

  public getRouter(): Router {
    return this.router;
  }

  // =============== THREAT ENDPOINTS ===============

  private async createThreat(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateInsiderThreatDTO = req.body;

      const validation = validateCreateInsiderThreatDTO(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Creating insider threat for user ${data.userId}`);

      const threat = await this.threatService.createThreat(data);
      
      // Update user risk profile after creating threat
      await this.riskService.updateUserRiskAfterThreat(data.userId, data.username, threat.id);

      res.status(201).json({ success: true, threat });
    } catch (err: any) {
      await this.logger.log(`Error creating threat: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to create threat." });
    }
  }

  private async getAllThreats(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log("Fetching all threats");
      
      const threats = await this.threatService.getAllThreats();
      res.status(200).json(threats);
    } catch (err: any) {
      await this.logger.log(`Error fetching all threats: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch threats." });
    }
  }

  private async getThreatById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const validation = validateThreatId(id);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Fetching threat with ID: ${id}`);

      const threat = await this.threatService.getThreatById(id);

      if (threat.id === -1) {
        res.status(404).json({ message: `Threat with id=${id} not found` });
        return;
      }

      res.status(200).json(threat);
    } catch (err: any) {
      await this.logger.log(`Error fetching threat by ID: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch threat." });
    }
  }

  private async getThreatsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      const validation = validateUserId(userId);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Fetching threats for user: ${userId}`);

      const threats = await this.threatService.getThreatsByUserId(userId);
      res.status(200).json(threats);
    } catch (err: any) {
      await this.logger.log(`Error fetching threats by userId: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch threats." });
    }
  }

  private async getThreatsByType(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type.toUpperCase();

      const validation = validateThreatType(type);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Fetching threats of type: ${type}`);

      const threats = await this.threatService.getThreatsByType(type as ThreatType);
      res.status(200).json(threats);
    } catch (err: any) {
      await this.logger.log(`Error fetching threats by type: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch threats." });
    }
  }

  private async getThreatsByRiskLevel(req: Request, res: Response): Promise<void> {
    try {
      const level = req.params.level.toUpperCase();

      const validation = validateRiskLevel(level);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Fetching threats with risk level: ${level}`);

      const threats = await this.threatService.getThreatsByRiskLevel(level as RiskLevel);
      res.status(200).json(threats);
    } catch (err: any) {
      await this.logger.log(`Error fetching threats by risk level: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch threats." });
    }
  }

  private async getUnresolvedThreats(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log("Fetching unresolved threats");

      const threats = await this.threatService.getUnresolvedThreats();
      res.status(200).json(threats);
    } catch (err: any) {
      await this.logger.log(`Error fetching unresolved threats: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch unresolved threats." });
    }
  }

  private async resolveThreat(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      const validation = validateThreatId(id);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const { resolvedBy, resolutionNotes } = req.body;

      if (!resolvedBy || typeof resolvedBy !== "string") {
        res.status(400).json({ success: false, message: "resolvedBy is required" });
        return;
      }

      await this.logger.log(`Resolving threat ${id}`);

      const updated = await this.threatService.resolveThreat(id, resolvedBy, resolutionNotes);

      if (updated.id === -1) {
        res.status(404).json({ message: `Threat with id=${id} not found` });
        return;
      }

      res.status(200).json(updated);
    } catch (err: any) {
      await this.logger.log(`Error resolving threat: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to resolve threat." });
    }
  }

  private async searchThreats(req: Request, res: Response): Promise<void> {
    try {
      const query: ThreatQueryDTO = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        userId: req.query.userId as string,
        threatType: req.query.threatType as ThreatType,
        riskLevel: req.query.riskLevel as RiskLevel,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        isResolved: req.query.isResolved === 'true' ? true : req.query.isResolved === 'false' ? false : undefined,
        sortBy: req.query.sortBy as 'detectedAt' | 'riskLevel' | 'userId',
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC'
      };

      await this.logger.log("Searching threats with filters");

      const result = await this.threatService.getThreatsWithFilters(query);
      res.status(200).json(result);
    } catch (err: any) {
      await this.logger.log(`Error searching threats: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to search threats." });
    }
  }

  // =============== RISK PROFILE ENDPOINTS ===============

  private async getAllUserRiskProfiles(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log("Fetching all user risk profiles");

      const profiles = await this.riskService.getAllUserRiskProfiles();
      res.status(200).json(profiles);
    } catch (err: any) {
      await this.logger.log(`Error fetching user risk profiles: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch risk profiles." });
    }
  }

  private async getHighRiskUsers(req: Request, res: Response): Promise<void> {
    try {
      await this.logger.log("Fetching high-risk users");

      const profiles = await this.riskService.getHighRiskUsers();
      res.status(200).json(profiles);
    } catch (err: any) {
      await this.logger.log(`Error fetching high-risk users: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch high-risk users." });
    }
  }

  private async getUserRiskProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      const validation = validateUserId(userId);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Fetching risk profile for user: ${userId}`);

      const profile = await this.riskService.getUserRiskProfile(userId);

      if (profile.id === -1) {
        res.status(404).json({ message: `Risk profile for user ${userId} not found` });
        return;
      }

      res.status(200).json(profile);
    } catch (err: any) {
      await this.logger.log(`Error fetching user risk profile: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch risk profile." });
    }
  }

  private async getUserRiskAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      const validation = validateUserId(userId);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Fetching risk analysis for user: ${userId}`);

      const analysis = await this.riskService.getUserRiskAnalysis(userId);
      res.status(200).json(analysis);
    } catch (err: any) {
      await this.logger.log(`Error fetching user risk analysis: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to fetch risk analysis." });
    }
  }

  private async recalculateUserRisk(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      const validation = validateUserId(userId);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      await this.logger.log(`Recalculating risk for user: ${userId}`);

      const profile = await this.riskService.recalculateUserRisk(userId);
      res.status(200).json(profile);
    } catch (err: any) {
      await this.logger.log(`Error recalculating user risk: ${err.message}`);
      res.status(500).json({ message: "Service error: Failed to recalculate risk." });
    }
  }
}