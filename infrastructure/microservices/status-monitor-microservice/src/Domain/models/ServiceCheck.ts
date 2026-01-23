import { Column, Entity, PrimaryGeneratedColumn, Index } from "typeorm";
import { ServiceStatus } from "../enums/ServiceStatusEnum";

@Entity("service_checks")
@Index(["serviceName", "checkedAt"])
export class ServiceCheck {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    serviceName!: string;

    @Column({ type: "datetime" })
    checkedAt!: Date;

    @Column({ type: "enum", enum: ServiceStatus })
    status!: ServiceStatus;

    @Column({ type: "int", nullable: true })
    responseTimeMs!: number | null;

    @Column({ type: "varchar", length: 64, nullable: true })
    errorType!: string | null;
}