import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from "typeorm";
import { RiskLevel } from "../enums/RiskLevel";

@Entity("user_risk_profiles")
export class UserRiskProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, unique: true })
  userId!: string;

  @Column({ type: "varchar", length: 100 })
  username!: string;

  @Column({ type: "int", default: 0 })
  riskScore!: number;

  @Column({ type: "enum", enum: RiskLevel, default: RiskLevel.LOW })
  currentRiskLevel!: RiskLevel;

  @Column({ type: "int", default: 0 })
  totalThreatsDetected!: number;

  @Column({ type: "int", default: 0 })
  criticalThreatsCount!: number;

  @Column({ type: "int", default: 0 })
  highThreatsCount!: number;

  @Column({ type: "int", default: 0 })
  mediumThreatsCount!: number;

  @Column({ type: "int", default: 0 })
  lowThreatsCount!: number;

  @Column({ type: "datetime", nullable: true })
  lastThreatDetectedAt!: Date | null;

  @Column({ type: "datetime", nullable: true })
  lastLoginAt!: Date | null;

  @Column({ type: "int", default: 0 })
  failedLoginAttempts!: number;

  @Column({ type: "json", nullable: true })
  recentActivities!: Array<{
    threatType: string;
    detectedAt: Date;
    riskLevel: string;
  }> | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}
