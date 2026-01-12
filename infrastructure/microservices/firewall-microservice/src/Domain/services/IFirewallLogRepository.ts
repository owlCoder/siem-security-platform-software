import { FirewallLogDTO } from "../DTOs/FirewallLogDTO";

export interface IFirewallLogRepository {
    add(ipAddress: string, port: number, decision: "ALLOWED" | "BLOCKED", mode: "WHITELIST" | "BLACKLIST"): Promise<void>;
    getAll(): Promise<FirewallLogDTO[]>;
}
