import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { FirewallModeType } from "../types/FirewallModeType";

@Entity("firewall_mode")
export class FirewallMode {
    @PrimaryGeneratedColumn({ name: "mode_id" })
    modeId!: number;

    @Column({ name: "mode", type: "varchar", length: 10 })
    mode!: FirewallModeType;

    @Column({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}
