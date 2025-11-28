import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { AlertSeverity } from "../enums/AlertSeverity";
import { AlertStatus } from "../enums/AlertStatus";

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

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "datetime", nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  resolvedBy!: string | null;

  @Column({ type: "text", nullable: true })
  resolutionNotes!: string | null;

}
