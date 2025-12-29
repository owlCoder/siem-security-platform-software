import { EventType } from "../enums/EventType";
import { EventDTO } from "../models/events/EventDTO";
import { EventRow } from "../types/events/EventRow";

export function mapEventDTO(e: EventDTO): EventRow {
    let type: EventRow["type"];
    switch (e.type) {
        case "ERROR":
            type = EventType.ERROR;
            break;
        case "WARNING":
            type = EventType.WARNING;
            break;
        case "INFO":
        default:
            type = EventType.INFO;
            break;
    }
    return {
        id: e.id,
        source: e.source.toString(),
        time: e.timestamp,
        type,
        description: e.description.toString(),
    };
}