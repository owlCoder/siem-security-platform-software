import { Entity, ObjectIdColumn, Column, Index } from "typeorm";

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

    @Column({ type: "integer"})
    lastProcessedId!: number;
} 
