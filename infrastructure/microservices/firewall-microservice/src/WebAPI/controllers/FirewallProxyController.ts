import { Router, Request, Response } from "express";
import axios, { Method } from "axios";
import { IFirewallService } from "../../Domain/services/IFirewallService";
import { ILogerService } from "../../Domain/services/ILogerService";
import { normalizeIpAddress } from "../../Utils/Proxy/NormalizeIp";
import { getMicroserviceUrl } from "../../Utils/Proxy/GetMicroserviceUrl";
import { parseUrl } from "../../Utils/Proxy/ParseUrl";
import { buildProxyTarget } from "../../Utils/Proxy/BuildProxyTarget";

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
        this.router.post("/proxy", this.proxyRequest.bind(this));
    }

    private async proxyRequest(req: Request, res: Response): Promise<void> {
        try {
            let sourceIp = req.ip;
            const sourcePort = req.socket.remotePort;

            if (!sourceIp || !sourcePort) {
                await this.logger.log(`Skipped request due to missing source IP or port`);
                res.status(400).json({ message: "Missing source IP or port" });
                return;
            }

            sourceIp = normalizeIpAddress(sourceIp);

            const sourceAllowed = await this.firewallService.checkAndLogAccess(sourceIp, sourcePort);
            if (!sourceAllowed) {
                res.status(403).json({ message: "Access blocked by firewall (source)" });
                return;
            }

            const { url, method = "GET", headers, data, params } = req.body;
            if (!url) {
                res.status(400).json({ message: "Destination URL/path is required in body" });
                return;
            }

            const destinationUrl = getMicroserviceUrl(url);
            if (destinationUrl === "") {
                await this.logger.log(`Unknown destination service for path: ${url}`);
                res.status(400).json({ message: `Unknown destination service for path: ${url}` });
                return;
            }

            const { ip: destinationIp, port: destinationPort } = parseUrl(destinationUrl);

            const destinationAllowed = await this.firewallService.checkAndLogAccess(destinationIp, destinationPort);
            if (!destinationAllowed) {
                await this.logger.log(`Blocked request from ${sourceIp}:${sourcePort} to ${destinationIp}:${destinationPort} (destination)`);
                res.status(403).json({ message: `Access blocked by firewall (destination)` });
                return;
            }

            const targetUrl = buildProxyTarget(url);
            const response = await axios({
                url: targetUrl,
                method: method as Method,
                headers,
                data,
                params,
                validateStatus: () => true
            });

            res.status(response.status).json({
                response: response.data
            });
        } catch (err) {
            await this.logger.log(`Error proxying request: ${(err as Error).message}`);
            res.status(500).json({
                success: false,
                message: "Internal firewall proxy error",
                error: (err as Error).message
            });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}
