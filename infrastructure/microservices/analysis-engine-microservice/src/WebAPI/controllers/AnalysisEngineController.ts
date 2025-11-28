import { Router, Request, Response } from "express";
import { ICorrelationService } from "../../Domain/Services/ICorrelationService";
import { ILLMChatAPIService } from "../../Domain/Services/ILLMChatAPIService";

export class AnalysisEngineController {

    private readonly router: Router;

    constructor(private readonly correlationService: ICorrelationService, private readonly llmChatAPIService: ILLMChatAPIService) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/AnalysisEngine/processEvent", this.processEvent.bind(this));
    }

    private async processEvent(req: Request, res: Response): Promise<void> {
        try {
            const rawMessage = req.body.message as string;

            if (!rawMessage) {
                res.status(400).json({ error: "Message is required" });
                return;
            }

            const processedEventJson = await this.llmChatAPIService.sendPromptToLLM(rawMessage);

            res.status(200).json({ eventData: processedEventJson });
            //it needs to be called eventData because ParserService expects it
        } catch (err) {
            res.status(500).json({ error: (err as Error).message });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}