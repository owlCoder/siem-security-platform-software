import { Router, Request, Response } from "express";
import { IEventsService } from "../../Domain/services/IEventsService";
import { ILogerService } from "../../Domain/services/ILoggerService";
import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { validateEventData } from "../validators/EventValidator";

export class EventsController {
    private readonly router: Router;

    constructor(
        private readonly eventsService: IEventsService,
        private readonly logger: ILogerService,
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get("/events/health", this.healthCheck.bind(this));
        this.router.get("/events", this.getAllEvents.bind(this));
        this.router.get("/events/:id", this.getEventById.bind(this));
        this.router.post("/events", this.createEvent.bind(this));
        this.router.delete("/events/:id", this.deleteEvent.bind(this));
        this.router.delete("/events/old", this.deleteOldEvents.bind(this));
    }

    private async healthCheck(req: Request, res: Response): Promise<void> {
        res.status(200).json({ status: "OK" });
    }

    private async createEvent(req: Request, res: Response): Promise<void> {
        try {
            const dto = req.body as EventDTO;

            const validation = validateEventData(dto);
            if (!validation.success) {
                await this.logger.log(
                    `Validation failed for incoming event: ${validation.message ?? ""}`,
                );
                res.status(400).json({ message: validation.message });
                return;
            }

            const created = await this.eventsService.createEvent(dto);
            res.status(201).json(created);
        } catch (err) {
            const message = (err as Error).message;
            await this.logger.log(`Error while creating event: ${message}`);
            res.status(500).json({ message });
        }
    }

    private async getAllEvents(req: Request, res: Response): Promise<void> {
        try {
            const events = await this.eventsService.getAll();
            res.status(200).json(events);
        } catch (err) {
            const message = (err as Error).message;
            await this.logger.log(`Error while getting events: ${message}`);
            res.status(500).json({ message });
        }
    }

    private async getEventById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) {
                res.status(400).json({ message: "Invalid ID" });
                return;
            }

            const event = await this.eventsService.getById(id);
            res.status(200).json(event);
        } catch (err) {
            res.status(404).json({ message: (err as Error).message });
        }
    }

    private async deleteEvent(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) {
                res.status(400).json({ message: "Invalid ID" });
                return;
            }

            const deleted = await this.eventsService.deleteById(id);
            if (!deleted) {
                res.status(404).json({ message: `Event with id=${id} not found` });
                return;
            }

            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async deleteOldEvents(req: Request, res: Response): Promise<void> {
        try {
<<<<<<< HEAD
            const ids = req.body as number[];

            if (!Array.isArray(ids) || ids.some((id) => typeof id !== "number")) {
                res.status(400).json({ message: "Body must be an array of numbers" });
                return;
            }

            const anyDeleted = await this.eventsService.deleteOldEvents(ids);
=======
            const oldIds: number[] = req.params.oldIds.split(",").map(id => Number(id));
            const anyDeleted = await this.eventsService.deleteOldEvents(oldIds);
>>>>>>> 1394f57052f68c1797a526806a4a185a727037c6
            res.status(200).json({ success: anyDeleted });
        } catch (err) {
            const message = (err as Error).message;
            await this.logger.log(`Error while deleting old events: ${message}`);
            res.status(500).json({ message });
        }
    }



    public getRouter(): Router {
        return this.router;
    }
}
