import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
import { RiskLevel } from "../enums/RiskLevel";
import { ThreatType } from "../enums/ThreatType";

@Entity("insider_threats")
@Index(["userId"])
@Index(["detectedAt"])
@Index(["threatType"])
@Index(["riskLevel"])
export class InsiderThreat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  userId!: number;

  @Column({ type: "enum", enum: ThreatType })
  threatType!: ThreatType;

  @Column({ type: "enum", enum: RiskLevel })
  riskLevel!: RiskLevel;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "json", nullable: true })
  metadata!: Record<string, any> | null;

  @Column({ type: "json" })
  correlatedEventIds!: number[];

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ type: "varchar", length: 100 })
  source!: string;

  @CreateDateColumn()
  detectedAt!: Date;

  @Column({ type: "boolean", default: false })
  isResolved!: boolean;

  @Column({ type: "datetime", nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  resolvedBy!: string | null;

  @Column({ type: "text", nullable: true })
  resolutionNotes!: string | null;
}