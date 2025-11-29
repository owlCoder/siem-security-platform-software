import { Event } from "../models/Event";
import { EventDTO } from "../DTOs/EventDTO";

export interface IEventValidator {
    validateInputMessage(message: string): void;
    validateEvent(event: Event): void;
    validateDTO(dto: EventDTO): void;
}
