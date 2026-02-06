import { Request, Response, Router } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { requireSysAdmin } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class IntegrityGatewayController {
    private readonly router: Router;

    constructor(
        private readonly gatewayService: IGatewayService,
        private readonly authenticate: any,
<<<<<<< HEAD
        private readonly loggerService: ILogerService
=======
        private readonly logger: ILogerService
>>>>>>> f51f5f8e12bc7d5fbaf8bd0fb9c11011a3a01abe
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            "/integrity/initialize",
            /* this.authenticate, */
            this.initializeHashChain.bind(this)
        );

<<<<<<< HEAD
        this.router.get(
            "/integrity/verify",
            /* this.authenticate, */
            this.verifyLogs.bind(this)
        );

        this.router.get(
            "/integrity/compromised",
            /* this.authenticate, */
            this.getCompromisedLogs.bind(this)
        );
    }

    private async initializeHashChain(req: Request, res: Response): Promise<void> {
=======
        this.router.post("/", this.proxyRequest.bind(this));
        this.router.post("/integrity/status",
            this.authenticate,
            requireSysAdmin,
            this.getStatus.bind(this));

        this.router.get("/integrity/compromised",
            this.authenticate,
            requireSysAdmin,
            this.getCompromised.bind(this));

        this.router.post("/integrity/verify",
            this.authenticate,
            requireSysAdmin,
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
>>>>>>> f51f5f8e12bc7d5fbaf8bd0fb9c11011a3a01abe
        try {
            const result = await this.gatewayService.initializeHashChain();
            res.status(200).json(result);
        } catch (err) {
            const message = (err as Error).message;
            await this.loggerService.log(`Gateway Integrity Error (Initialize): ${message}`);
            res.status(500).json({ message });
        }
    }

    private async verifyLogs(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.gatewayService.verifyLogs();
            res.status(200).json(result);
        } catch (err) {
            const message = (err as Error).message;
            await this.loggerService.log(`Gateway Integrity Error (Verify): ${message}`);
            res.status(500).json({ message });
        }
    }

    private async getCompromisedLogs(req: Request, res: Response): Promise<void> {
        try {
            const logs = await this.gatewayService.getCompromisedLogs();
            res.status(200).json(logs);
        } catch (err) {
            const message = (err as Error).message;
            await this.loggerService.log(`Gateway Integrity Error (GetCompromised): ${message}`);
            res.status(500).json({ message });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}