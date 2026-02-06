import { Router, Request, Response } from "express";
import { IQueryRepositoryService } from "../../Domain/services/IQueryRepositoryService";
import { CacheEntry } from "../../Domain/models/CacheEntry";
import { IQueryService } from "../../Domain/services/IQueryService";
import { DistributionDTO } from "../../Domain/DTOs/DistributionDTO";
import { IQueryAlertRepositoryService } from "../../Domain/services/IQueryAlertRepositoryService";


export class QueryController {
    private readonly router: Router;

    constructor(
        private readonly queryService: IQueryService,
        private readonly queryRepositoryService: IQueryRepositoryService,
        private readonly queryAlertRepositoryService: IQueryAlertRepositoryService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get("/query/oldEvents/:hours", this.getOldEvents.bind(this));
        this.router.get("/query/recentEvents/:hours", this.getRecentEvents.bind(this));
        this.router.get("/query/search", this.searchEvents.bind(this));
        this.router.get("/query/lastThreeEvents", this.getLastThreeEvents.bind(this));
        this.router.get("/query/events", this.getAllEvents.bind(this));
        this.router.get("/query/eventsCount", this.getEventsCount.bind(this));
        this.router.get("/query/infoCount", this.getInfoCount.bind(this));
        this.router.get("/query/warningCount", this.getWarningCount.bind(this));
        this.router.get("/query/errorCount", this.getErrorCount.bind(this));
        this.router.get("/query/eventDistribution", this.getEventDistribution.bind(this));
        this.router.get("/query/statistics/events", this.getEventStatistics.bind(this));
        this.router.get("/query/statistics/alerts", this.getAlertStatistics.bind(this));
        this.router.get("/query/pdfReport", this.getPdfReport.bind(this));
        this.router.get("/query/alertsPdfReport", this.getAlertsPdfReport.bind(this));
    }

    private async getOldEvents(req: Request, res: Response): Promise<void> {
        try {
            const hours = Number(req.params.hours);

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

    private async getRecentEvents(req:Request, res: Response): Promise<void> {
        try{
            const hours = Number(req.params.hours);

            if(isNaN(hours) || hours <= 0){
                res.status(400).json({message: "Invalid hours parameter."});
                return;
            }

            const recentEvents = await this.queryRepositoryService.getRecentEvents(hours);
            res.status(200).json(recentEvents);
        }catch (err){
            res.status(500).json({ message: "Error while retrieving recent events. "});
        }
    }

    private async searchEvents(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.q as string || "";
            const page = parseInt(req.query.p as string) || 1;
            const limit = parseInt(req.query.l as string) || 50;
            const results = await this.queryService.searchEvents(query, page, limit);
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

    private async getEventDistribution(req: Request, res: Response): Promise<void> {
        try {
            const distribution = await this.queryService.getEventDistribution();
            res.status(200).json({
                distribution
            });
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving event distribution." });
        }
    }
    private async getEventStatistics(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.queryRepositoryService.getHourlyEventStatistics();
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving event statistics." });
        }
    }

    private async getAlertStatistics(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.queryAlertRepositoryService.getHourlyAlertStatistics();
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ message: "Error while retrieving alert statistics." });
        }
    }

    private async getPdfReport(req: Request, res: Response): Promise<void> {
        try {
            const dateFrom = req.query.dateFrom as string;
            const dateTo = req.query.dateTo as string;
            const eventType = req.query.eventType as string;

            const base64String = await this.queryService.generatePdfReport(dateFrom, dateTo, eventType);

            if (!base64String) {
                res.status(404).json({ message: "No events found for the selected filters." });
                return;
            }

            const pdfBuffer = Buffer.from(base64String, 'base64');

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=SIEM-Report-${Date.now()}.pdf`);
            res.setHeader("Content-Length", pdfBuffer.length.toString());

            res.status(200).send(pdfBuffer);
        } catch (err) {
            console.error("PDF Error:", err);
            res.status(500).json({ message: "Error while generating PDF report." });
        }
    }

private async getAlertsPdfReport(req: Request, res: Response): Promise<void> {
    try {
        const severity = req.query.severity as string;
        const status = req.query.status as string;
        const source = req.query.source as string;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;

       
        const base64String = await this.queryService.generateAlertsPdfReport(
            severity,
            status,
            source,
            dateFrom,
            dateTo
        );

        if (!base64String || base64String === "") {
            res.status(404).json({ message: "No alerts found for the selected filters." });
            return;
        }

        const pdfBuffer = Buffer.from(base64String, 'base64');

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=ALERTS-Report-${Date.now()}.pdf`);
        res.setHeader("Content-Length", pdfBuffer.length.toString());

        res.status(200).send(pdfBuffer);
    } catch (err) {
        console.error("Alerts PDF Controller Error:", err);
        res.status(500).json({ message: "Error while generating alerts PDF report." });
    }
}
    public getRouter(): Router {
        return this.router;
    }
}