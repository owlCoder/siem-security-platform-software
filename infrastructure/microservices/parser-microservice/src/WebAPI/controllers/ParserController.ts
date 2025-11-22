import { Router, Request, Response } from "express";
import { IParserService } from "../../Domain/services/IParserService";
export class ParserController {
    private readonly router: Router;

    constructor(
        private readonly parserService: IParserService,
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        //dodati rute
         this.router.get("/parser", this.getAllParser.bind(this));
    }

    private async getAllParser(req: Request, res: Response): Promise<void>{
        console.log("RUTA PARSERA");
    }

    public getRouter(): Router {
        return this.router;
    }
}