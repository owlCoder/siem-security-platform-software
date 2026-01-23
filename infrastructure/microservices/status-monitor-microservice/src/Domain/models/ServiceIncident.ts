import { Column, Entity, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity("service_incidents")
@Index(["serviceName", "startTime"])
export class ServiceIncident {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    serviceName!: string;

    @Column({ type: "datetime" })
    startTime!: Date;

    @Column({ type: "datetime", nullable: true })
    endTime!: Date | null;

    @Column({ type: "varchar", length: 128 })
    reason!: string;

    @Column({ type: "text", nullable: true })
    correlationSummary!: string | null;

    @Column({ type: "text", nullable: true }) //mozda  json string
    correlationRefs!: string | null;
}