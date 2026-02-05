
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { AlertSeverity } from "../enums/AlertSeverity";
import { AlertStatus } from "../enums/AlertStatus";
import { AlertCategory } from "../enums/AlertCategory";

@Entity("alerts")
export class Alert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "enum", enum: AlertSeverity })
  severity!: AlertSeverity;

  @Column({ type: "enum", enum: AlertStatus, default: AlertStatus.ACTIVE })
  status!: AlertStatus;

  @Column({ type: "json" })
  correlatedEvents!: number[];

  @Column({ type: "varchar", length: 100 })
  source!: string;

  @Column({ type: "text", nullable: true })
  detectionRule!: string | null;

  @Column({ type: "enum", enum: AlertCategory, default: AlertCategory.OTHER })
  category!: AlertCategory ;

  @Column({ type: "datetime" })
  oldestEventTimestamp!: Date ;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "datetime", nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  resolvedBy!: string | null;

  @Column({ type: "text", nullable: true })
  resolutionNotes!: string | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: "int", nullable: true })
  userId?: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  userRole?: string;
}
