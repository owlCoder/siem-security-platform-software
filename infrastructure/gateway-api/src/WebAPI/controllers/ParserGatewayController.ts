import { Request, Response, Router } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { requireSysAdmin } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { ReqParams } from "../../Domain/types/ReqParams";

export class ParserGatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/parserEvents", this.getAllParserEvents.bind(this));
    this.router.get("/parserEvents/:id", this.getParserEvent.bind(this));
    this.router.post("/parserEvents/log", this.log.bind(this));
    this.router.delete("/parserEvents/:id", this.deleteParserEvent.bind(this));
  }

  private async getAllParserEvents(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.gatewayService.getAllParserEvents();
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getParserEvent(req: Request<ReqParams<'id'>>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const response = await this.gatewayService.getParserEventById(id);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async log(req: Request, res: Response): Promise<void> {
    try {
      const rawMessage = req.body.message as string;
      const source = req.body.source as string;
      const response = await this.gatewayService.log(rawMessage, source);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async deleteParserEvent(req: Request<ReqParams<'id'>>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const response = await this.gatewayService.deleteById(id);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
