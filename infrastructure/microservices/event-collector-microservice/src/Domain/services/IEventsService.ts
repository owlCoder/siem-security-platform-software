import { EventDTO } from "../DTOs/EventDTO";
import { DistributionDTO } from "../DTOs/DIstributionDTO";

export interface IEventsService {
    createEvent(event: EventDTO): Promise<EventDTO>;
    getAll(): Promise<EventDTO[]>;
    getById(id: number): Promise<EventDTO>;
    deleteById(id: number): Promise<boolean>;
    deleteOldEvents(expiredIds: number[]): Promise<boolean>;
    getMaxId():Promise<EventDTO>;
    getEventsFromId1ToId2(fromId: number, toId: number): Promise<EventDTO[]>
    getSortedEventsByDate(): Promise<EventDTO[]>
    getEventPercentagesByEvent(): Promise<DistributionDTO>
}
