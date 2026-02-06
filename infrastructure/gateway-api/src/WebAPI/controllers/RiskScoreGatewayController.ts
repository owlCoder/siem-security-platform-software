import { Router, Response, Request } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { RiskEntityType } from "../../Domain/enums/RiskEntityType";
import { requireSysAdmin } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class RiskScoreGatwayController {
    private readonly router: Router;

    constructor(private readonly gatewayService: IGatewayService,
        private readonly authenticate: any) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            "/riskScore/calculateScore",
            this.authenticate,
            requireSysAdmin,
            this.calculateScore.bind(this)
        );
        this.router.get(
            "/riskScore/getLatestScore",
            this.authenticate,
            requireSysAdmin,
            this.getLatestScore.bind(this)
        );
        this.router.get(
            "/riskScore/getScoreHistory",
            this.authenticate,
            requireSysAdmin,
            this.getScoreHistory.bind(this)
        );
        this.router.get(
            "/riskScore/getGlobalScore",
            this.authenticate,
            requireSysAdmin,
            this.getGlobalScore.bind(this)
        );
    }

    private async calculateScore(req: Request, res: Response): Promise<void> {
        try {
            const { entityType, entityId, hours } = req.body;

            const result = await this.gatewayService.calculateScore(
                entityType as RiskEntityType,
                entityId,
                Number(hours)
            );

            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ message: "Error while calculating risk score." });
        }
    }

    private async getLatestScore(req: Request, res: Response): Promise<void> {
        try {
            const entityType = req.query.entityType as RiskEntityType;
            const entityId = req.query.entityId as string;

            const result = await this.gatewayService.getLatestScore(entityType, entityId);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: "Error while retreiving latest risk score." });
        }
    }

    private async getScoreHistory(req: Request, res: Response): Promise<void> {
        try {
            const entityType = req.query.entityType as RiskEntityType;
            const entityId = req.query.entityId as string;
            const hours = Number(req.query.hours);

            const result = await this.gatewayService.getScoreHistory(entityType, entityId, hours);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: "Error while retreiving risk score history." });
        }
    }

    private async getGlobalScore(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.gatewayService.getGlobalScore();
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: "Error while retreiving global risk score." });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}