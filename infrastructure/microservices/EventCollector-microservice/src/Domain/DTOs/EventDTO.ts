import { EventType } from "../enums/EventType";

export interface EventDTO {
    id: number;
    source?: string;
    type?: EventType;
    description?: string;
    timestamp?: Date;
}
