import { Router, Request, Response } from "express";
import axios, { Method } from "axios";
import { IFirewallService } from "../../Domain/services/IFirewallService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { env } from "process";
import { microserviceUrls } from "../../Domain/constants/MicroserviceUrls";

export class FirewallProxyController {
    private readonly router: Router;

    constructor(
        private readonly firewallService: IFirewallService,
        private readonly logger: ILogerService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.all("/proxy/*", this.proxyRequest.bind(this));
    }

    private async proxyRequest(req: Request, res: Response): Promise<void> {
        try {
            const sourceIp = req.ip;
            const sourcePort = req.socket.remotePort;

            if (!sourceIp || !sourcePort) {
                await this.logger.log(`Skipped request due to missing source IP or port`);
                res.status(400).json({ message: "Missing source IP or port" });
                return;
            }

            const allowed = await this.firewallService.checkAndLogAccess(sourceIp, sourcePort);
            if (!allowed) {
                await this.logger.log(`Blocked request from ${sourceIp}:${sourcePort}`);
                res.status(403).json({ message: "Access blocked by firewall (source)" });
                return;
            }

            // Extract service key from request URL (e.g. "/analysis-engine/process" -> "analysis-engine")
            const serviceKey = req.originalUrl.split("/")[1];
            const destinationUrl = microserviceUrls[serviceKey];
            if (!destinationUrl) {
                await this.logger.log(`Unknown destination service for path: ${req.originalUrl}`);
                res.status(400).json({ message: "Unknown destination service" });
                return;
            }

            const urlObj = new URL(destinationUrl);
            const destinationIp = urlObj.hostname;
            const destinationPort = Number(urlObj.port);

            const destinationAllowed = await this.firewallService.checkAndLogAccess(destinationIp, destinationPort);
            if (!destinationAllowed) {
                await this.logger.log(`Blocked request from ${sourceIp}:${sourcePort} to ${destinationIp}:${destinationPort}`);
                res.status(403).json({ message: "Access blocked by firewall (destination)" });
                return;
            }

            const destinationPath = req.originalUrl.replace(/^\/proxy\/?/, "");     // Deleting "proxy" from URI
            const targetUrl = `${process.env.GATEWAY_URL}/${destinationPath}`;

            const response = await axios({
                url: targetUrl,
                method: req.method as Method,
                headers: req.headers,
                data: req.body,
                params: req.query,
                validateStatus: () => true
            });

            res.status(response.status).json(response.data);
        } catch (err) {
            await this.logger.log(`Error proxying request: ${(err as Error).message}`);
            res.status(500).json({ message: "Internal firewall proxy error" });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}
