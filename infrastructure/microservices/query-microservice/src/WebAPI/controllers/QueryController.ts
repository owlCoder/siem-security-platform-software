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
        this.router.get("/query/oldEvents/:hours", this.getOldEvents.bind(this));
        this.router.get("/query/search", this.searchEvents.bind(this));
        this.router.get("/query/lastThreeEvents", this.getLastThreeEvents.bind(this));
        this.router.get("/query/events", this.getAllEvents.bind(this));
        this.router.get("/query/eventsCount", this.getEventsCount.bind(this));
        this.router.get("/query/infoCount", this.getInfoCount.bind(this));
        this.router.get("/query/warningCount", this.getWarningCount.bind(this));
        this.router.get("/query/errorCount", this.getErrorCount.bind(this));
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
            res.status(500).json({ message: "Error while retrieving old events." });
        }
    }

    private async searchEvents(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.q as string || "";
            const results = await this.queryService.searchEvents(query);
            res.status(200).json(results);
        } catch (err) {
            res.status(500).json({ message: "Error while searching events." });
        }
    }

    private async getAllEvents(req: Request, res: Response): Promise<void> {
        try {
            const allEvents = await this.queryRepositoryService.getAllEvents();
            res.status(200).json(allEvents);
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving all events." });
        }
    }

    private async getLastThreeEvents(req: Request, res: Response): Promise<void> {
        try {
            const lastThreeEvents = await this.queryRepositoryService.getLastThreeEvents();
            res.status(200).json(lastThreeEvents);
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving last three events." });
        }
    }

    private async getEventsCount(req: Request, res: Response): Promise<void> {
        try {
            const eventsCount = this.queryRepositoryService.getEventsCount();
            res.status(200).json({ count: eventsCount });
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving events count." });
        }
    }

    private async getInfoCount(req: Request, res: Response): Promise<void> {
        try {
            const infoCount = this.queryRepositoryService.getInfoCount();
            res.status(200).json({ count: infoCount });
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving info count." });
        }
    }

    private async getWarningCount(req: Request, res: Response): Promise<void> {
        try {
            const warningCount = this.queryRepositoryService.getWarningCount();
            res.status(200).json({ count: warningCount });
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving warning count." });
        }   
    }

    private async getErrorCount(req: Request, res: Response): Promise<void> {
        try {
            const errorCount = this.queryRepositoryService.getErrorCount();
            res.status(200).json({ count: errorCount });
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving error count." });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}