import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("parser")
export class ParserEvent {
    @PrimaryGeneratedColumn({ name: "parser_id" })
    parserId!: number;

    @Column({ name: "event_id", type: "int" })
    eventId!: number;

    @Column({ name: "text_before_parsing", type: "varchar", length: 255 })
    textBeforeParsing!: string;

    @Column({ type: "timestamp" })
    timestamp!: Date;

    @Column({ type: "varchar", length: 45, nullable: true})
    ipAddress?: string;
}