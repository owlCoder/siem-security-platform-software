import { Event } from "../Domain/models/Event";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { IEventsService } from "../Domain/services/IEventsService";
import { EventType } from "../Domain/enums/EventType";
import { toDTO } from "../Utils/Converters/ConvertToDTO";
import { ArraytoDTO } from "../Utils/Converters/ConvertEventArrayToDTOarray";
import { DistributionDTO } from "../Domain/DTOs/DIstributionDTO";
import { TopSourceDTO } from "../Domain/DTOs/TopSourceDTO";
import { Repository, Between, In, MoreThanOrEqual } from "typeorm";

export class EventsService implements IEventsService {
    constructor(
        private readonly eventRepository: Repository<Event>,
    ) { }
    async getTopSourceEvent(): Promise<TopSourceDTO> {
        const result = await this.eventRepository.createQueryBuilder("event").select("event.source", "source").addSelect("COUNT(*)", "count").groupBy("event.source").orderBy("count", "DESC").limit(1).getRawOne();

        return result
    }


    async getSortedEventsByDate(): Promise<EventDTO[]> {
        const events = await this.eventRepository.find({
            order: {
                timestamp: "DESC",
            },
        });
        return ArraytoDTO(events);
    }
    async getEventPercentagesByEvent(): Promise<DistributionDTO> {
        const total = await this.eventRepository.count();

        if (total === 0) {
              return {
            notifications: 0,
            warnings: 0,
            errors: 0,
        };
        }

        const infoCount = await this.eventRepository.count({
            where: { type: EventType.INFO },
        });

        const warningCount = await this.eventRepository.count({
            where: { type: EventType.WARNING },
        });

        const errorCount = await this.eventRepository.count({
            where: { type: EventType.ERROR },
        });
        //ide procenat za info,warning pa error 
      
        const infoPercent = (infoCount / total) * 100
        const warnPercent = (warningCount / total) * 100
        const errorPercent = (errorCount / total) * 100

        const Distribution : DistributionDTO = {
            notifications: infoPercent,
            warnings: warnPercent ,
            errors: errorPercent,
        }

    return Distribution;
    }



    async createEvent(eventDto: EventDTO): Promise<EventDTO> {
        const timestamp = eventDto.timestamp ? new Date(eventDto.timestamp) : new Date();

        const entity = this.eventRepository.create({
            source: eventDto.source,
            userId: eventDto.userId,      
            userRole: eventDto.userRole, 
            type: eventDto.type,
            description: eventDto.description,
            timestamp,
            ipAddress: eventDto.ipAddress
        });

        const saved = await this.eventRepository.save(entity);
        return toDTO(saved);
    }

    async getAll(): Promise<EventDTO[]> {
        const allEvents = await this.eventRepository.find();
        return ArraytoDTO(allEvents);
    }

    async getById(id: number): Promise<EventDTO> {
        const event = await this.eventRepository.findOne({ where: { id } });
        if (!event) {
            const emptyEvent: EventDTO = {
                id: -1
            }
            return emptyEvent;
        }
        return toDTO(event);
    }

    async deleteById(id: number): Promise<boolean> {
        const result = await this.eventRepository.delete({ id: id });
        return !!result.affected && result.affected > 0;
    }

    async deleteOldEvents(oldIds: number[]): Promise<boolean> {
        let deleted = 0;

        for (const id of oldIds) {
            const successfulDelete = await this.deleteById(id);
            if (successfulDelete) {
                deleted++;
            }
        }
        return deleted > 0;
    }

    async getMaxId(): Promise<EventDTO> {
        const event = await this.eventRepository.findOne({
            order: { id: "DESC" }
        });
        if (!event) {
            const emptyEvent: EventDTO = {
                id: -1
            }
            return emptyEvent;
        }
        return toDTO(event);
    }
    async getEventsFromId1ToId2(fromId: number, toId: number): Promise<EventDTO[]> {
        const events= await this.eventRepository.find({
            where: {
                id: Between(fromId, toId)
            },
            order: {
                id: "ASC"
            }
        });
        return ArraytoDTO(events);
    }

    //za status-monitor korelaciju
    async getFilteredEventsForCorrelation(serviceName: string, startTime: Date, severities: string[], limit: number): Promise<EventDTO[]> {
    const events = await this.eventRepository.find({
        where: {
            source: serviceName, 
            timestamp: MoreThanOrEqual(startTime), 
            type: In(severities) 
        },
        order: {
            timestamp: "DESC"
        },
        take: limit 
    });

    return ArraytoDTO(events);
}


}
