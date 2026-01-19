import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { EventType } from "../enums/EventType";

@Entity("event")
export class Event {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255 })
    source!: string;

    @Column({ type: "enum", enum: EventType, default: EventType.INFO })
    type!: EventType;

    @Column({ type: "varchar", length: 255 })
    description!: string;

    @Column({ type: "timestamp" })
    timestamp!: Date;

    @Column({ type: "varchar", length: 45, nullable: true})
    ipAddress?: string;
}
