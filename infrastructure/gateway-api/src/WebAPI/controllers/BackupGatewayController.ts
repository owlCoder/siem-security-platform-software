import { Router, Request, Response } from "express";
import { IBackupGatewayService } from "../../Domain/services/IBackupGatewayService";

export class BackupGatewayController {
    private readonly router: Router;

    constructor(
        private readonly backupGatewayService: IBackupGatewayService,
        private readonly authenticate: any
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/backup/validate", this.authenticate, this.runValidation.bind(this));
        this.router.get("/backup/logs", this.authenticate, this.getAllLogs.bind(this));
        this.router.get("/backup/last", this.authenticate, this.getLastValidation.bind(this));
        this.router.get("/backup/summary", this.authenticate, this.getSummary.bind(this));
        this.router.get("/backup/health", this.authenticate, this.getHealth.bind(this));
        this.router.get("/backup/stats", this.authenticate, this.getStats.bind(this));
    }

    private async runValidation(req: Request, res: Response) {
        const result = await this.backupGatewayService.runValidation();
        res.status(200).json(result);
    }

    private async getAllLogs(req: Request, res: Response) {
        const logs = await this.backupGatewayService.getAllLogs();
        res.status(200).json(logs);
    }

    private async getLastValidation(req: Request, res: Response) {
        const result = await this.backupGatewayService.getLastValidation();
        res.status(200).json(result);
    }

    private async getSummary(req: Request, res: Response) {
        const result = await this.backupGatewayService.getSummary();
        res.status(200).json(result);
    }

    private async getHealth(req: Request, res: Response) {
        const result = await this.backupGatewayService.getHealth();
        res.status(200).json(result);
    }

    private async getStats(req: Request, res: Response) {
        const range = Number(req.query.range ?? 7);
        const result = await this.backupGatewayService.getStats(range);
        res.status(200).json(result);
    }

    public getRouter(): Router {
        return this.router;
    }
}