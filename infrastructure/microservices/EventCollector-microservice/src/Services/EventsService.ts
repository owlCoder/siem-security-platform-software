import { Repository } from "typeorm";
import { Event } from "../Domain/models/Event";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { IEventsService } from "../Domain/services/IEventsService";

export class EventsService implements IEventsService {
    constructor(
        private readonly eventRepository: Repository<Event>,
    ) {}

   

    async createEvent(eventDto: EventDTO): Promise<EventDTO> {
        const timestamp = eventDto.timestamp ? new Date(eventDto.timestamp) : new Date();

        const entity = this.eventRepository.create({
            source: eventDto.source,
            type: eventDto.type,
            description: eventDto.description,
            timestamp,
        });

        const saved = await this.eventRepository.save(entity);
        return this.toDTO(saved);
    }

    async getAll(): Promise<Event[]> {
        return this.eventRepository.find();
    }

    async getById(id: number): Promise<Event> {
        const event = await this.eventRepository.findOne({ where: { id } });
        if (!event) {
            throw new Error(`Event with id=${id} not found.`);
        }
        return event;
    }

    async deleteById(id: number): Promise<boolean> {
        const result = await this.eventRepository.delete({ id:id });
        return !!result.affected && result.affected > 0;
    }

     async deleteOldEvents(oldIds:number[]): Promise<boolean> {
        var deletedOnes = 0;
        for(const id of oldIds){
           var sucessfulDelete= await this.deleteById(id);
           if(sucessfulDelete){
            deletedOnes++
           }
        }
        return deletedOnes > 0
    }


    private toDTO(event: Event): EventDTO {
        return {
            id: event.id,
            source: event.source,
            type: event.type,
            description: event.description,
            timestamp: event.timestamp,
        };
    }
}
