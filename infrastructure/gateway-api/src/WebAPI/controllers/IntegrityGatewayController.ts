import { Router, Request, Response } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { ILogerService } from "../../Domain/services/ILogerService";

export class IntegrityGatewayController {
    private readonly router: Router;

    constructor(
        private readonly gatewayService: IGatewayService,
       // private readonly authenticate: any,
        private readonly logger: ILogerService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {

        this.router.post("/", this.proxyRequest.bind(this));
        this.router.post("/integrity/status", 
            // this.authenticate,
            // requireSysAdmin, 
            this.getStatus.bind(this));

        this.router.get("/integrity/compromised", 
            // this.authenticate, 
            // requireSysAdmin,
            this.getCompromised.bind(this));

        this.router.post("/integrity/verify", 
            // this.authenticate, 
            // requireSysAdmin,
            this.verify.bind(this));
    }

    private async proxyRequest(req: Request, res: Response): Promise<void> {
    const { url, method, data, headers } = req.body;

    if (url === "integrity/status") {
        return this.getStatus(req, res);
    }

    if (url === "integrity/verify") {
        return this.verify(req, res);
    }

    res.status(404).json({ message: `Integrity Proxy: Route ${url} not found` });
}

  

   private async getStatus(req: Request, res: Response): Promise<void> {
    console.log("Pozvan POST /integrity/status"); 

    try {
        const data = await this.gatewayService.getIntegrityStatus();

        
        res.json({
            success: true,
            response: data 
        });

    } catch (err) {
        console.error("Greška u getStatus kontroleru:", err);
        await this.handleError(err, res);
    }
}

    private async getCompromised(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.gatewayService.getCompromisedLogs();
            res.json(data);
        } catch (err) {
            await this.handleError(err, res);
        }
    }

    private async verify(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.gatewayService.verifyIntegrity();
            res.json(data);
        } catch (err) {
            await this.handleError(err, res);
        }
    }

    private async handleError(err: any, res: Response): Promise<void> {
        const message = (err as Error).message;
        await this.logger.log(`Gateway Error (Integrity): ${message}`);
        res.status(500).json({ message: "Integrity service error." });
    }

    public getRouter(): Router {
        return this.router;
    }
}