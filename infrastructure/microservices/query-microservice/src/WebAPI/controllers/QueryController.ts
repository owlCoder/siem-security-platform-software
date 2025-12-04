import { Router, Request, Response } from "express";
import { IQueryRepositoryService } from "../../Domain/services/IQueryRepositoryService";
import { CacheEntry } from "../../Domain/models/CacheEntry";
import { IQueryService } from "../../Domain/services/IQueryService";

export class QueryController {
    private readonly router: Router;

    constructor(
        private readonly queryService: IQueryService,
        private readonly queryRepositoryService: IQueryRepositoryService,
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/query/cache", this.addCacheEntry.bind(this));
        this.router.get("/query/oldEvents/:hours", this.getOldEvents.bind(this));
        this.router.get("/query/search", this.searchEvents.bind(this));
    }

    private async addCacheEntry(req: Request, res: Response): Promise<void> {
        try {
            //const entry = req.body as CacheEntry;
            const { key, result } = req.body;
            // moze da se doda validacija podataka ovde
            await this.queryRepositoryService.addEntry({ key, result });
            res.status(201).json({ message: "Cache entry added successfully." });
        } catch (err) {
            const message = (err as Error).message;
            res.status(500).json({ message: "Error while adding cache entry." });
        }
    }

    private async getOldEvents(req: Request, res: Response): Promise<void> {
        try {
            const hours = Number(req.params.hours);
            // ovde moze da se premesti validacija u zasebnu funkciju
            if (isNaN(hours) || hours <= 0) {
                res.status(400).json({ message: "Invalid hours parameter." });
                return;
            }

            const oldEvents = await this.queryRepositoryService.getOldEvents(hours);
            res.status(200).json(oldEvents);
        } catch (err) {
            const message = (err as Error).message;
            res.status(500).json({ message: "Error while retrieving old events." });
        }
    }

    private async searchEvents(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.query as string;
            const results = await this.queryService.searchEvents(query);
            res.status(200).json(results);
        } catch (err) {
            const message = (err as Error).message;
            res.status(500).json({ message: "Error while searching events." });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}