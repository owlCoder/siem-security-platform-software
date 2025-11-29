import { Entity, ObjectIdColumn, Column } from "typeorm";

@Entity("cachedQueries")
export class CacheEntry {
    @ObjectIdColumn()
    // mongo db automatski kreira _id za svaki dokument (entitet)
    _id!: string;

    @Column({ type: "varchar", length: 255 })
    key!: string;

    @Column({ type: "simple-json" })
    result!: any;

    @Column({ type: "timestamp" })
    cachedAt!: Date;
}
