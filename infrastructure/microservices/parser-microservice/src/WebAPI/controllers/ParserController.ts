import { Router, Request, Response } from "express";
import { IParserService } from "../../Domain/services/IParserService";
import { IParserRepositoryService } from "../../Domain/services/IParserRepositoryService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { ValidateInputParameters } from "../validators/ParserValidator";
import { validateEventId } from "../validators/EventIdValidator";
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

            await this.logger.log(`Raw log message from "${source}": ${rawMessage}`)

            const response = await this.parserService.normalizeAndSaveEvent(rawMessage, source);
            if (response.id === -1) {
                res.status(500).json({ message: "Service error: Failed to log event." });
                return;
            }
            res.status(200).json(response);
        } catch (err) {
            await this.logger.log("Parser service error while trying to log event. Erorr: " + err);
            res.status(500).json({ message: "Service error: Failed to log event." });
        }
    }

    private async getAllParserEvents(req: Request, res: Response): Promise<void> {
        try {
            await this.logger.log(`Fetching all parser events`);
            const response = await this.parserRepositoryService.getAll();
            res.status(200).json(response);
        } catch (err) {
            await this.logger.log("Parser service error while trying to fetch parser events. Erorr: " + err);
            res.status(500).json({ message: "Service error: Failed to fetch parser events." });
        }
    }

    private async getParserEvent(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);

            const validate = validateEventId(id);
            if (!validate.success) {
                res.status(400).json({ success: validate.success, message: validate.message });
                return;
            }
            
            await this.logger.log(`Fetching parser event with ID: ${id}`);

            const response = await this.parserRepositoryService.getParserEventById(id);
            if (response.parser_id === -1) {
                res.status(404).json({ message: `Parse Event with id=${id} not found` });
                return;
            }
            res.status(200).json(response);
        } catch (err) {
            await this.logger.log("Parser service error while trying to fetch parser event. Erorr: " + err);
            res.status(500).json({ message: "Service error: Failed to fetch parser event." });
        }
    }

    private async deleteParserEvent(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id)

            const validate = validateEventId(id);
            if (!validate.success) {
                res.status(400).json({ success: validate.success, message: validate.message });
                return;
            }

            await this.logger.log(`Deleting parser event with ID: ${id}`);

            const response = await this.parserRepositoryService.deleteById(id);
            if (!response) {
                res.status(404).json({ message: `Parse Event with id=${id} not found` });
                return;
            }
            res.status(200).json({ success: true });
        } catch (err) {
            await this.logger.log("Parser service error while trying to delete parser event. Erorr: " + err);
            res.status(500).json({ message: "Service error: Failed to delete parser event." });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}