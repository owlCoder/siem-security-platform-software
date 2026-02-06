import { Router, Request, Response } from "express";
import { IArchiveProcessService } from "../../Domain/services/IArchiveProcessService";
import { IArchiveQueryService } from "../../Domain/services/IArchiveQueryService";
import { IArchiveStatsService } from "../../Domain/services/IArchiveStatsService";

export class StorageLogController {
    private readonly router: Router;

    constructor(
        private readonly archiveProcessService: IArchiveProcessService,
        private readonly archiveQueryService: IArchiveQueryService,
        private readonly archiveStatsService: IArchiveStatsService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get("/storageLog", this.getAllArchives.bind(this));
        this.router.post("/storageLog/run", this.runArchiveProcess.bind(this));
        this.router.get("/storageLog/stats", this.getStats.bind(this));
        this.router.get("/storageLog/file/:id", this.getArchiveFile.bind(this));
        this.router.get("/storageLog/top", this.getTopArchives.bind(this));
        this.router.get("/storageLog/volume", this.getArchiveVolume.bind(this));
        this.router.get("/storageLog/largest", this.getLargestArchive.bind(this));
    }

    private async getAllArchives(req: Request, res: Response): Promise<void> {
        try {
            const archives = await this.archiveQueryService.getArchives();
            res.status(200).json(archives);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async runArchiveProcess(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.archiveProcessService.runArchiveProcess();
            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getStats(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.archiveStatsService.getStats();
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getArchiveFile(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const filePath = await this.archiveQueryService.getArchiveFilePath(id);

            if (!filePath) {
                res.status(404).json({ error: "Archive not found" });
                return;
            }

            res.download(filePath);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getTopArchives(req: Request, res: Response): Promise<void> {
        try {
            const type = req.query.type as "events" | "alerts";
            const limit = Number(req.query.limit) || 5;
            const result = await this.archiveQueryService.getTopArchives(type, limit);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getArchiveVolume(req: Request, res: Response): Promise<void> {
        try {
            const period = req.query.period as "daily" | "monthly" | "yearly";
            const result = await this.archiveQueryService.getArchiveVolume(period);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getLargestArchive(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.archiveQueryService.getLargestArchive();

            if (!result) {
                res.status(404).json({ message: "No archives found" });
                return;
            }

            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}