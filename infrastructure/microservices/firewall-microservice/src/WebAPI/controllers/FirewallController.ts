import { Router, Request, Response } from "express";
import { IFirewallService } from "../../Domain/services/IFirewallService";
import { IFirewallRuleRepository } from "../../Domain/services/IFirewallRuleRepository";
import { IFirewallModeRepository } from "../../Domain/services/IFirewallModeRepository";
import { IFirewallLogRepository } from "../../Domain/services/IFirewallLogRepository";
import { ILogerService } from "../../Domain/services/ILogerService";

export class FirewallController {
    private readonly router: Router;

    constructor(
        private readonly firewallService: IFirewallService,
        private readonly ruleRepo: IFirewallRuleRepository,
        private readonly modeRepo: IFirewallModeRepository,
        private readonly logRepo: IFirewallLogRepository,
        private readonly logger: ILogerService
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Rules
        this.router.get("/rules", this.getAllRules.bind(this));
        this.router.post("/rules", this.addRule.bind(this));
        this.router.delete("/rules/:id", this.deleteRule.bind(this));

        // Mode
        this.router.get("/mode", this.getMode.bind(this));
        this.router.put("/mode", this.setMode.bind(this));

        // Test connection
        this.router.get("/testConnection", this.testConnection.bind(this));

        // Logs
        this.router.get("/logs", this.getAllLogs.bind(this));
    }

    // Rules
    private async getAllRules(req: Request, res: Response): Promise<void> {
        try {
            await this.logger.log("Fetching all firewall rules");
            const rules = await this.ruleRepo.getAll();
            res.status(200).json(rules);
        } catch (err) {
            await this.logger.log("Error fetching firewall rules: " + err);
            res.status(500).json({ message: "Failed to fetch firewall rules" });
        }
    }

    private async addRule(req: Request, res: Response): Promise<void> {
        try {
            const { ipAddress, port } = req.body;
            if (!ipAddress || !port) {
                res.status(400).json({ message: "IP address and port are required" });
                return;
            }
            const rule = await this.ruleRepo.add(ipAddress, port);
            res.status(200).json(rule);
        } catch (err) {
            await this.logger.log("Error adding firewall rule: " + err);
            res.status(500).json({ message: "Failed to add firewall rule" });
        }
    }

    private async deleteRule(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ message: "Invalid rule ID" });
                return;
            }
            const success = await this.ruleRepo.deleteById(id);
            if (!success) {
                res.status(404).json({ message: `Rule with id=${id} not found` });
                return;
            }
            res.status(200).json({ success: true });
        } catch (err) {
            await this.logger.log("Error deleting firewall rule: " + err);
            res.status(500).json({ message: "Failed to delete firewall rule" });
        }
    }

    // Mode
    private async getMode(req: Request, res: Response): Promise<void> {
        try {
            const mode = await this.modeRepo.getCurrent();
            res.status(200).json({ mode });
        } catch (err) {
            await this.logger.log("Error fetching firewall mode: " + err);
            res.status(500).json({ message: "Failed to fetch firewall mode" });
        }
    }

    private async setMode(req: Request, res: Response): Promise<void> {
        try {
            const { mode } = req.body;
            if (mode !== "WHITELIST" && mode !== "BLACKLIST") {
                res.status(400).json({ message: "Invalid mode. Must be WHITELIST or BLACKLIST" });
                return;
            }
            await this.modeRepo.update(mode);
            res.status(200).json({ success: true, mode });
        } catch (err) {
            await this.logger.log("Error updating firewall mode: " + err);
            res.status(500).json({ message: "Failed to update firewall mode" });
        }
    }

    // Test connection
    private async testConnection(req: Request, res: Response): Promise<void> {
        try {
            const ipAddress = req.query.ipAddress as string;
            const port = Number(req.query.port);

            if (!ipAddress || isNaN(port)) {
                res.status(400).json({ message: "IP address and port are required" });
                return;
            }

            const allowed = await this.firewallService.checkTestConnection(ipAddress, port);
            res.status(200).json({ ipAddress, port, allowed });
        } catch (err) {
            await this.logger.log("Error testing firewall connection: " + err);
            res.status(500).json({ message: "Failed to test firewall connection" });
        }
    }

    // Logs
    private async getAllLogs(req: Request, res: Response): Promise<void> {
        try {
            await this.logger.log("Fetching all firewall logs");
            const logs = await this.logRepo.getAll();
            res.status(200).json(logs);
        } catch (err) {
            await this.logger.log("Error fetching firewall logs: " + err);
            res.status(500).json({ message: "Failed to fetch firewall logs" });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}
