import { Router, Request, Response } from "express";
import { IQueryRepositoryService } from "../../Domain/services/IQueryRepositoryService";
import { CacheEntry } from "../../Domain/models/CacheEntry";

export class QueryController {
    private readonly router: Router;

    constructor(
        private readonly queryService: IQueryRepositoryService,
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/query/cache", this.addCacheEntry.bind(this));
    }

    private async addCacheEntry(req: Request, res: Response): Promise<void> {
        try {
            const entry = req.body as CacheEntry;
            // moze da se doda validacija podataka ovde
            await this.queryService.addEntry(entry);
            res.status(201).json({ message: "Cache entry added successfully." });
        } catch (err) {
            const message = (err as Error).message;
            res.status(500).json({ message: "Error while adding cache entry." });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}