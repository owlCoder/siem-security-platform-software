import { Repository } from "typeorm";
import { FirewallLog } from "../Domain/models/FirewallLog";
import { IFirewallLogRepository } from "../Domain/services/IFirewallLogRepository";
import { FirewallLogDTO } from "../Domain/DTOs/FirewallLogDTO";
import { firewallLogToDTO } from "../Utils/Converter/ConvertDTO";
import { ILogerService } from "../Domain/services/ILogerService";

export class FirewallLogRepositoryService implements IFirewallLogRepository {
    constructor(
        private firewallLogRepository: Repository<FirewallLog>,
        private readonly logger: ILogerService
    ) { }

    async add(ipAddress: string, port: number, decision: "ALLOWED" | "BLOCKED", mode: "WHITELIST" | "BLACKLIST"): Promise<void> {
        const newLog = this.firewallLogRepository.create({ ipAddress, port, decision, mode });
        await this.firewallLogRepository.save(newLog);
        await this.logger.log(`Firewall log added for ${ipAddress}:${port} - ${decision}`);
    }

    async getAll(): Promise<FirewallLogDTO[]> {
        const logs = await this.firewallLogRepository.find({ order: { createdAt: "DESC" } });
        return logs.map(l => firewallLogToDTO(l));
    }
}