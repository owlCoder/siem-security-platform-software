import { Request, Response, Router } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { ILogerService } from "../../Domain/services/ILogerService";

export class IntegrityGatewayController {
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
        this.router.post(
            "/integrity/initialize",
            /* this.authenticate, */
            this.initializeHashChain.bind(this)
        );

        this.router.get(
            "/integrity/verify",
            /* this.authenticate, */
            this.verifyLogs.bind(this)
        );

        this.router.get(
            "/integrity/compromised",
            /* this.authenticate, */
            this.getCompromisedLogs.bind(this)
        );
    }

    private async initializeHashChain(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.gatewayService.initializeHashChain();
            res.status(200).json(result);
        } catch (err) {
            const message = (err as Error).message;
            await this.loggerService.log(`Gateway Integrity Error (Initialize): ${message}`);
            res.status(500).json({ message });
        }
    }

    private async verifyLogs(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.gatewayService.verifyLogs();
            res.status(200).json(result);
        } catch (err) {
            const message = (err as Error).message;
            await this.loggerService.log(`Gateway Integrity Error (Verify): ${message}`);
            res.status(500).json({ message });
        }
    }

    private async getCompromisedLogs(req: Request, res: Response): Promise<void> {
        try {
            const logs = await this.gatewayService.getCompromisedLogs();
            res.status(200).json(logs);
        } catch (err) {
            const message = (err as Error).message;
            await this.loggerService.log(`Gateway Integrity Error (GetCompromised): ${message}`);
            res.status(500).json({ message });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}