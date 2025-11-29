import { IEventValidator } from "../../Domain/validators/IEventValidator";
import { Event } from "../../Domain/models/Event";
import { EventDTO } from "../../Domain/DTOs/EventDTO";

export class EventValidator implements IEventValidator {

    validateInputMessage(message: string): void {
        if (!message || typeof message !== "string")
            throw new Error("Invalid input: 'message' must be a non-empty string.");

        if (message.length > 10000)
            throw new Error("Message exceeds maximum allowed size (10k chars).");
    }

    validateEvent(event: Event): void {
        if (!event)
            throw new Error("Invalid event: object is null or undefined.");

        if (!event.type)
            throw new Error("Invalid event: missing 'type'.");

        if (!event.description || !String(event.description).trim())
            throw new Error("Invalid event: missing 'description'.");

        if (!(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime()))
            throw new Error("Invalid event: timestamp must be a valid Date object.");
    }

    validateDTO(dto: EventDTO): void {
        if (!dto.type)
            throw new Error("Invalid DTO: missing type.");

        if (!dto.description)
            throw new Error("Invalid DTO: missing description.");

        if (!dto.timestamp)
            throw new Error("Invalid DTO: missing timestamp.");
    }
}
