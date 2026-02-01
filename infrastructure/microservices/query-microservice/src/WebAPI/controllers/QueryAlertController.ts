import { Router, Request, Response } from "express";
import { IQueryAlertService } from "../../Domain/services/IQueryAlertService";
import { IQueryAlertRepositoryService } from "../../Domain/services/IQueryAlertRepositoryService";

export class QueryAlertContoller{
    private readonly router: Router;

    constructor(
        private readonly queryAlertService: IQueryAlertService,
        private readonly queryAlertRepositoryService: IQueryAlertRepositoryService
    ){
        this.router = Router();
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.get("/query/oldAlerts/:hours", this.getOldAlerts.bind(this));
        this.router.get("/query/alerts", this.getAllAlerts.bind(this));
        this.router.post("/query/searchAlerts", this.searchAlerts.bind(this));
        this.router.get("/query/alertsCount", this.getAlertsCount.bind(this));
    }
    private async getOldAlerts(req: Request, res: Response): Promise<void>{
        try {
            const hours = Number(req.params.hours);
            if (isNaN(hours) || hours <= 0) {
                res.status(400).json({ message: "Invalid hours parameter." });
                return;
            }
            const oldEvents = await this.queryAlertRepositoryService.getOldAlerts(hours);

            res.status(200).json(oldEvents);
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving old events." });
        }
    }
     private async getAllAlerts(req: Request, res: Response): Promise<void> {
        try {
            const allAlerts = await this.queryAlertRepositoryService.getAllAlerts();
            res.status(200).json(allAlerts);
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving all events." });
        }
    }
    private async searchAlerts(req: Request, res: Response): Promise<void> {
        try {
            const alertQueryDTO = req.body;
            const results = await this.queryAlertService.searchAlerts(alertQueryDTO);
            res.status(200).json(results);
        } catch (err) {
            res.status(500).json({ message: "Error while searching events." });
        }
    }
    private async getAlertsCount(req: Request, res: Response): Promise<void> {
        try {
            const eventsCount = this.queryAlertRepositoryService.getAlertsCount();
            res.status(200).json({ count: eventsCount });
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving events count." });
        }
    }
    public getRouter(): Router {
        return this.router;
    }
}