import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BackupValidationStatus } from "../enums/BackupValidationStatus";

@Entity("backup_validation_log")
export class BackupValidationLog {
    @PrimaryGeneratedColumn({name: "backup_validation_log_id"})
    backupValidationLogId!: number;

    @Column({name: "status", type: "enum", enum: BackupValidationStatus})
    status!: BackupValidationStatus;
    
    @Column({name: "error_message", type: "varchar", length: 500, nullable: true})
    errorMessage!: string;

    @Column({name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
    createdAt!: Date;
}