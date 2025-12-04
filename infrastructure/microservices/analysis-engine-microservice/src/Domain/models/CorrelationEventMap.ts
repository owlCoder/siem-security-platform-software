import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Correlation } from "./Correlation";

@Entity("correlation_map")
export class CorrelationEventMap {

    @PrimaryColumn()
    correlation_id!: number;

    @PrimaryColumn()
    event_id!: number;

    @ManyToOne(() => Correlation, (correlation) => correlation.events, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "correlation_id" })
    correlation!: Correlation;
}
