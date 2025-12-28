import { EventDTO } from "../../Domain/DTOs/EventDTO";

export interface IQueryGatewayService {
  searchEvents(query: string): Promise<EventDTO[]>;
  getOldEvents(hours: number): Promise<EventDTO[]>;
  getLastThreeEvents(): Promise<EventDTO[]>;
  getAllEvents(): Promise<EventDTO[]>;
  getEventsCount(): Promise<number>;
  getInfoCount(): Promise<number>;
  getWarningCount(): Promise<number>;
  getErrorCount(): Promise<number>;
}