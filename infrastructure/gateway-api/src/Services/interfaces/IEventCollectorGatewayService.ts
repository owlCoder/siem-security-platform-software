import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { DistributionDTO } from "../../Domain/DTOs/DistributionDTO";
import { TopSourceDTO } from "../../Domain/DTOs/TopSourceDTO";

export interface IEventCollectorGatewayService {
  getAllEvents(): Promise<EventDTO[]>;
  getSortedEventsByDate(): Promise<EventDTO[]>;
  getEventPercentagesByEvent(): Promise<DistributionDTO>;
  getEventById(id: number): Promise<EventDTO>;
  getEventsFromId1ToId2(fromId: number, toId: number): Promise<EventDTO[]>;
  createEvent(event: EventDTO): Promise<EventDTO>;
  deleteEvent(id: number): Promise<boolean>;
  deleteOldEvents(ids: number[]): Promise<boolean>;
  getTopSourceEvent(): Promise<TopSourceDTO>;
}