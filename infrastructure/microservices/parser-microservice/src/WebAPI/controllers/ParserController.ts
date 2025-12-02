import { Router, Request, Response } from "express";
import { IParserService } from "../../Domain/services/IParserService";
import { IParserRepositoryService } from "../../Domain/services/IParserRepositoryService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { ValidateInputParameters } from "../validators/ParserValidator";
export class ParserController {
    private readonly router: Router;

    constructor(
        private readonly parserService: IParserService,
        private readonly parserRepositoryService: IParserRepositoryService,
        private readonly logger: ILogerService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get("/parserEvents", this.getAllParserEvents.bind(this));
        this.router.get("/parserEvents/:id", this.getParserEvent.bind(this));
        this.router.post("/parserEvents/log", this.log.bind(this));
        this.router.delete("/parserEvents/:id", this.deleteParserEvent.bind(this));
    }

    private async log(req: Request, res: Response): Promise<void> {
        try {
            const rawMessage = req.body.message as string;  // Team 2 sends JSON with event message and event source (microservice which called log)
            const source = req.body.source as string;
            
            const validate = ValidateInputParameters(rawMessage, source);
            if (!validate.success) {
                res.status(400).json({ success: false, message: validate.message });
                return;
            }

            this.logger.log(`Raw log message from "${source}": ${rawMessage}`)

            const response = await this.parserService.normalizeAndSaveEvent(rawMessage, source);
            res.status(201).json(response);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getAllParserEvents(req: Request, res: Response): Promise<void> {
        try {
            this.logger.log(`Fetching all parser events`);
            const response = this.parserRepositoryService.getAll();
            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getParserEvent(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid ID" });
                return;
            }
            this.logger.log(`Fetching parser event with ID: ${id}`);

            const response = await this.parserRepositoryService.getParserEventById(id);
            res.status(200).json(response);
        } catch (err) {
            res.status(404).json({ message: (err as Error).message });
        }
    }

    private async deleteParserEvent(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id)
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid ID" });
                return;
            }
            this.logger.log(`Deleting parser event with ID: ${id}`);

            const response = await this.parserRepositoryService.deleteById(id);
            if (!response) {
                res.status(404).json({ message: `Parse Event with id=${id} not found` });
                return;
            }
            res.status(200).json({ success: true });
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}