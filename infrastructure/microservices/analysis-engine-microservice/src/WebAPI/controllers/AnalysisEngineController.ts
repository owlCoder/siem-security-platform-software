import { Router, Request, Response } from "express";
import { ICorrelationService } from "../../Domain/services/ICorrelationService";
import { ILLMChatAPIService } from "../../Domain/services/ILLMChatAPIService";

export class AnalysisEngineController {

    private readonly router: Router;

    constructor(private readonly correlationService: ICorrelationService, private readonly llmChatAPIService: ILLMChatAPIService) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/AnalysisEngine/processEvent", this.processEvent.bind(this));
        this.router.post("/AnalysisEngine/correlations/deleteByEventIds", this.deleteCorrelationsByEventIds.bind(this));
    }

    private async processEvent(req: Request, res: Response): Promise<void> {
        try {
            const rawMessage = req.body.message as string;

            if (!rawMessage || rawMessage.trim().length === 0) {
                res.status(400).json({ error: "Message is required" });
                return;
            }

            const processedEventJson = await this.llmChatAPIService.sendNormalizationPrompt(rawMessage);

            res.status(200).json({ eventData: processedEventJson });
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    }

    private async deleteCorrelationsByEventIds(req: Request, res: Response): Promise<void> {

        try {
            const eventIds: number[] = req.body.eventIds;

            if (
                !Array.isArray(eventIds) ||
                eventIds.length === 0 ||
                !eventIds.every(id => typeof id === "number")
            ) {
                res.status(400).json({ error: "eventIds must be a non-empty array of numbers" });
                return;
            }

            const deletedCount = await this.correlationService.deleteCorrelationsByEventIds(eventIds);

            if (deletedCount === 0) {
                res.status(204).send();
                return;
            }
            res.status(200).json({
                deletedCount: deletedCount
            });

        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    }
    public getRouter(): Router {
        return this.router;
    }
}
