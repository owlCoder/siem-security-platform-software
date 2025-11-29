import { Router, Request, Response } from "express";
import { IParserService } from "../../Domain/services/IParserService";
export class ParserController {
    private readonly router: Router;

    constructor(private readonly parserService: IParserService) {
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
            const rawMessage = req.body.message as string;  //drugi tim mora da nam salje json sa message kako bi mi izvukli poruku
            console.log('Log message before normalization: ' + rawMessage);
            const response =  await this.parserService.normalizeAndSaveEvent(rawMessage);
            res.status(201).json(response);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getAllParserEvents(req: Request, res: Response): Promise<void> {
        try {
            const response = this.parserService.getAll();
            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ message: (err as Error).message });
        }
    }

    private async getParserEvent(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id)
            console.log("id params->" + id);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid ID" });
                return;
            }
            const response = await this.parserService.getParserEventById(id);
            res.status(200).json(response);
        } catch (err) {
            res.status(404).json({ message: (err as Error).message });
        }
    }

    private async deleteParserEvent(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id)
            console.log("id params->" + id);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid ID" });
                return;
            }

            const response = await this.parserService.deleteById(id);
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