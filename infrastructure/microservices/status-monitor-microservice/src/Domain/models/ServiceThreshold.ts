import { Column, Entity, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity("service_thresholds")
@Index(["serviceName"], { unique: true })
export class ServiceThreshold {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    serviceName!: string;

    @Column()
    pingUrl!: string;

    @Column({type: "int", default: 30})
    checkIntervalSec!: number;

    @Column({type: "int", default: 1500})
    timeoutMs!: number;

    @Column({type: "int", default: 3})
    maxConsecutiveDown!: number;

    @Column({type: "int", default: 2})
    recoveryUpCount!: number;

}