import { EventType } from "../../enums/EventType";

export type EventRow = {
    id: number;
    source: string;
    time: string;
    type: EventType;
    description: string;
}