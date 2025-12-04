import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { CorrelationEventMap } from "./CorrelationEventMap";

@Entity("correlations")
export class Correlation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255 })
    description!: string;

    @Column({ type: "timestamp" })
    timestamp!: Date;

    @Column({ type: "boolean", default: false })
    isAlert!: boolean;

    @OneToMany(() => CorrelationEventMap, (map) => map.correlation, {
        cascade: true,
    })
    events!: CorrelationEventMap[];
}
