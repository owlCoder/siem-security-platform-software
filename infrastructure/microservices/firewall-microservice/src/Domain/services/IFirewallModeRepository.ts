export interface IFirewallModeRepository {
    getCurrent(): Promise<"WHITELIST" | "BLACKLIST">;
    update(mode: "WHITELIST" | "BLACKLIST"): Promise<void>;
}