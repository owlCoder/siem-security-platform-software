import { Router, Request, Response } from "express";
import { ICorrelationService } from "../../Domain/services/ICorrelationService";
import { ILLMChatAPIService } from "../../Domain/services/ILLMChatAPIService";
import { validateRecommendationContextDto } from "../validators/validateRecommendationContext";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { BusinessLLMInputDto } from "../../Domain/types/businessInsights/BusinessDto";
import { ScanIncidentDto } from "../../Domain/types/ScanIncidentDto";

export class AnalysisEngineController {

    private readonly router: Router;

    constructor(private readonly llmChatAPIService: ILLMChatAPIService, private readonly loggerService: ILoggerService) {
        this.router = Router();
        this.initializeRoutes();
    }

    public getRouter(): Router {
        return this.router;
    }

    private initializeRoutes(): void {
        this.router.post("/AnalysisEngine/processEvent", this.processEvent.bind(this));
        this.router.post("/AnalysisEngine/recommendations", this.getRecommendations.bind(this));
        this.router.post("/AnalysisEngine/generateBusinessInsights", this.generateBusinessInsights.bind(this));
        this.router.post("/AnalysisEngine/scanIncident", this.scanIncident.bind(this));
    }

    private async getRecommendations(req: Request, res: Response): Promise<void> {
        try {
            const contextDto = req.body;
            const validation = validateRecommendationContextDto(contextDto);
            if (!validation.ok) {
                this.loggerService.error("[Controller] Invalid RecommendationContextDto:" + validation.error);
                res.status(400).json({ error: validation.error });
                return;
            }
            
            const recommendations = await this.llmChatAPIService.sendRecommendationsPrompt(validation.value);

            res.status(200).json(recommendations);
        } catch (err) {
            this.loggerService.error("[Controller] getRecommendations failed: " + (err as Error).message);
            res.status(500).json({ error: (err as Error).message });
        }
    }

    private async processEvent(req: Request, res: Response): Promise<void> {
        try {
            const rawMessage = req.body.message as string;

             if (!rawMessage || rawMessage.trim().length === 0) {
                 this.loggerService.warn("[Controller] procesEvent called with empty message.");
                 res.status(400).json({ error: "Message is required" });
                 return;
            }

            const processedEventJson = await this.llmChatAPIService.sendNormalizationPrompt(rawMessage);
            
            res.status(200).json({ eventData: processedEventJson });
        } catch (err) {
            this.loggerService.error("[Controller] processEventFailed: " + (err as Error).message);
            res.status(500).json({ error: (err as Error).message });
        }
    }

    private async generateBusinessInsights(req: Request, res: Response): Promise<void> {
        try{
            const businessDto = req.body as BusinessLLMInputDto;
            const businessInsights = await this.llmChatAPIService.sendBusinessInsightsPrompt(businessDto);
            res.status(200).json(businessInsights);
        }catch(err){
            this.loggerService.error("[Controller] generateBusinessInsights: " + (err as Error).message);
            res.status(500).json({ error: (err as Error).message });
        }
    }

    private async scanIncident(req: Request, res: Response): Promise<void> {
        try{
            const indicentDto = req.body as ScanIncidentDto;
            const incident = await this.llmChatAPIService.sendScanIncidentPrompt(indicentDto);
            res.status(200).json(incident)
        }catch(err){
            this.loggerService.error("[Controller] scanIncident: " + (err as Error).message);
            res.status(500).json({ error: (err as Error).message });
        }
    }

}