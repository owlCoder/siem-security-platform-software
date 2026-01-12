import { FirewallLogDTO } from "../../Domain/DTOs/FirewallLogDTO";
import { FirewallModeDTO } from "../../Domain/DTOs/FirewallModeDTO";
import { FirewallRuleDTO } from "../../Domain/DTOs/FirewallRuleDTO";
import { FirewallLog } from "../../Domain/models/FirewallLog";
import { FirewallMode } from "../../Domain/models/FirewallMode";
import { FirewallRule } from "../../Domain/models/FirewallRule";

export function firewallRuleToDTO(rule: FirewallRule): FirewallRuleDTO {
    return {
        id: rule.ruleId,
        ipAddress: rule.ipAddress,
        port: rule.port,
        createdAt: rule.createdAt,
    };
}

export function firewallModeToDTO(mode: FirewallMode): FirewallModeDTO {
    return {
        id: mode.modeId,
        mode: mode.mode,
        updatedAt: mode.updatedAt,
    };
}

export function firewallLogToDTO(log: FirewallLog): FirewallLogDTO {
    return {
        id: log.logId,
        ipAddress: log.ipAddress,
        port: log.port,
        decision: log.decision,
        mode: log.mode,
        createdAt: log.createdAt,
    };
}