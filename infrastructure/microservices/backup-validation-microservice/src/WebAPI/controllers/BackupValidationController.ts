import { Router, Request, Response } from "express";
import { IBackupValidationService } from "../../Domain/services/IBackupValidationService";
import { IBackupValidationQueryService } from "../../Domain/services/IBackupValidationQueryService";

export class BackupValidationController{
    private readonly router: Router;

    constructor(
        private readonly backupValidationService: IBackupValidationService,
        private readonly backupValidationQueryService: IBackupValidationQueryService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/backup/validate", this.runValidation.bind(this));
        this.router.get("/backup/logs", this.getAllLogs.bind(this));
        this.router.get("/backup/last", this.getLastValidation.bind(this));
        this.router.get("/backup/summary", this.getSummary.bind(this));
    }

    private async runValidation(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.backupValidationService.runValidation();
            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getAllLogs(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.backupValidationQueryService.getAllLogs();
            res.status(200).json(response);
        } catch(err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getLastValidation(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.backupValidationQueryService.getLastValidation();
            res.status(200).json(response);
        } catch(err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getSummary(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.backupValidationQueryService.getSummary();
            res.status(200).json(response);
        } catch(err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}