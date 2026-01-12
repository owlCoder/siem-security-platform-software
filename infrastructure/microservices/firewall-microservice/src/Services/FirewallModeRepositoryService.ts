import { Repository } from "typeorm";
import { FirewallMode } from "../Domain/models/FirewallMode";
import { IFirewallModeRepository } from "../Domain/services/IFirewallModeRepository";
import { ILogerService } from "../Domain/services/ILogerService";

export class FirewallModeRepositoryService implements IFirewallModeRepository {
    constructor(
        private firewallModeRepository: Repository<FirewallMode>,
        private readonly logger: ILogerService
    ) { }

    async getCurrent(): Promise<"WHITELIST" | "BLACKLIST"> {
        const mode = await this.firewallModeRepository.findOne({ where: {} });

        if (!mode) {
            await this.logger.log("No FirewallMode found, returning default BLACKLIST");
            return "BLACKLIST";
        }

        return mode.mode;
    }

    async update(mode: "WHITELIST" | "BLACKLIST"): Promise<void> {
        const existing = await this.firewallModeRepository.findOne({ where: {} });

        if (existing) {
            existing.mode = mode;
            await this.firewallModeRepository.save(existing);
            await this.logger.log(`FirewallMode updated to ${mode}`);
        } else {
            const newMode = this.firewallModeRepository.create({ mode });   // Create new mode if there is no existing one
            await this.firewallModeRepository.save(newMode);
            await this.logger.log(`FirewallMode created with ${mode}`);
        }
    }
}
