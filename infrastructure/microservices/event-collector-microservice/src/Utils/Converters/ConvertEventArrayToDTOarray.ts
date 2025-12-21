import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { Event as EventEntity } from "../../Domain/models/Event";
import { toDTO } from "./ConvertToDTO";

export function ArraytoDTO(events: EventEntity[]): EventDTO[] {
  const eventDTOs: EventDTO[] = [];

  for (let i = 0; i < events.length; i++) {
    eventDTOs.push(toDTO(events[i]));
  }

  return eventDTOs;
}
