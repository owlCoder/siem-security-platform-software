import { EventType } from "../models/Event";

//ovo mozemo iz event service uzeti,dok oni ne naprave ovo koristiti
export interface EventDTO {
    event_id:number;
    event_source:string;
    event_type:EventType;
    event_timestamp:Date;
    message:string;
}