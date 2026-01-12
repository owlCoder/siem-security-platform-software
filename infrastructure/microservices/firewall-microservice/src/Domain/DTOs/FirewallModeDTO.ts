export interface FirewallModeDTO {
    id: number;
    mode: "WHITELIST" | "BLACKLIST";
    updatedAt?: Date;
}