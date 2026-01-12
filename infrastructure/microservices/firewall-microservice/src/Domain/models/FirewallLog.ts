import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { FirewallDecision } from "../types/FirewallDecision";

@Entity("firewall_logs")
export class FirewallLog {
    @PrimaryGeneratedColumn({ name: "log_id" })
    logId!: number;

    @Column({ name: "ip_address", type: "varchar", length: 15 })
    ipAddress!: string;

    @Column({ name: "port", type: "int" })
    port!: number;

    @Column({ name: "decision", type: "varchar", length: 10 })
    decision!: FirewallDecision;

    @Column({ name: "mode", type: "varchar", length: 10 })
    mode!: "WHITELIST" | "BLACKLIST";

    @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;
}
