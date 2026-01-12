export interface FirewallLogDTO {
    id: number;
    ipAddress: string;
    port: number;
    decision: "ALLOWED" | "BLOCKED";
    mode: "WHITELIST" | "BLACKLIST";
    createdAt?: Date;
}