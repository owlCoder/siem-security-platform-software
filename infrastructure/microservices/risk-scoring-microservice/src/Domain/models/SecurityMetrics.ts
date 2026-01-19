import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { RiskEntityType } from "../enums/RiskEntityType";

@Entity("security_metrics")
export class SecurityMetrics {
    @PrimaryGeneratedColumn({name: "security_metrics_id"})
    securityMetricsId!: number;

    @Column({name: "entity_type", type: "enum", enum: RiskEntityType})
    entityType!: RiskEntityType;
    
    @Column({name: "entity_id", type: "varchar", length: 255})
    entityId!: string;

    @Column({name: "total_event_count", type: "int", default: 0})
    totalEventCount!: number;

    @Column({name: "error_event_count", type: "int", default: 0})
    errorEventCount!: number;

    @Column({name: "event_rate", type: "float", default: 0})
    eventRate!: number;

    @Column({name: "alerts_by_severity", type: "simple-json"})
    alertsBySeverity!: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
        CRITICAL: number;
    };

    @Column({name: "anomaly_rate", type: "float", default: 0})
    anomalyRate!: number;

    @Column({name: "burst_anomaly", type: "boolean", default: false})
    burstAnomaly!: boolean;

    @Column({name: "unique_service_count", type: "int", nullable: true})
    uniqueServiceCount?: number; 

    @Column({name: "unique_ip_count", type: "int", nullable: true})
    uniqueIpCount?: number;     
    
    @Column({name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt!: Date;

    @Column({name: "risk_score", type: "float", default: 0})
    riskScore!: number;
}
