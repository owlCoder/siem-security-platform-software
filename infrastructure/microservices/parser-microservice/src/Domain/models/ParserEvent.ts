import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("parser")
export class ParserEvent{
    @PrimaryGeneratedColumn()
    parser_id!:number;

    @Column({type:"int"})
    event_id!:number;

    @Column({type:"varchar",length:255})
    normalize_text!:string;

    @Column({type:"timestamp"})
    normalize_timestamp!:Date;


}