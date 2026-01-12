import { FirewallRuleDTO } from "../DTOs/FirewallRuleDTO";

export interface IFirewallRuleRepository {
    getAll(): Promise<FirewallRuleDTO[]>;
    getByIpAndPort(ipAddress: string, port: number): Promise<FirewallRuleDTO | null>;
    add(ipAddress: string, port: number): Promise<FirewallRuleDTO>;
    deleteById(id: number): Promise<boolean>;
}