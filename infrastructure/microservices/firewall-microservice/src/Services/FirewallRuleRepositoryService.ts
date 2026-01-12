import { Repository } from "typeorm";
import { FirewallRule } from "../Domain/models/FirewallRule";
import { IFirewallRuleRepository } from "../Domain/services/IFirewallRuleRepository";
import { FirewallRuleDTO } from "../Domain/DTOs/FirewallRuleDTO";
import { ILogerService } from "../Domain/services/ILogerService";
import { firewallRuleToDTO } from "../Utils/Converter/ConvertDTO";

export class FirewallRuleRepositoryService implements IFirewallRuleRepository {
    constructor(
        private firewallRuleRepository: Repository<FirewallRule>,
        private readonly logger: ILogerService
    ) { }

    async getAll(): Promise<FirewallRuleDTO[]> {
        const rules = await this.firewallRuleRepository.find();
        return rules.map(r => firewallRuleToDTO(r));
    }

    async getByIpAndPort(ipAddress: string, port: number): Promise<FirewallRuleDTO> {
        const rule = await this.firewallRuleRepository.findOne({ where: { ipAddress, port } });
        if (!rule) {
            await this.logger.log(`FirewallRule not found for ${ipAddress}:${port}`);

            const emptyRule: FirewallRuleDTO = {
                id: -1,
            };

            return emptyRule;
        }
        return firewallRuleToDTO(rule);
    }

    async add(ipAddress: string, port: number): Promise<FirewallRuleDTO> {
        const newRule = this.firewallRuleRepository.create({ ipAddress, port });
        const savedRule = await this.firewallRuleRepository.save(newRule);
        await this.logger.log(`Added FirewallRule ${ipAddress}:${port}`);
        return firewallRuleToDTO(savedRule);
    }

    async deleteById(id: number): Promise<boolean> {
        const result = await this.firewallRuleRepository.delete({ ruleId: id });
        const success = result.affected !== undefined && result.affected !== null && result.affected > 0;
        if (success) {
            await this.logger.log(`Deleted FirewallRule with ID: ${id}`);
        } else {
            await this.logger.log(`Failed to delete FirewallRule with ID: ${id}`);
        }
        return success;
    }
}
