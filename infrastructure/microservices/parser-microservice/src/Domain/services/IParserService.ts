import { EventDTO } from "../DTOs/EventDTO";
import { Event } from "../models/Event";
import { ParserEvent } from "../models/ParserEvent";

export interface IParserService {
    normalizeAndSaveEvent(eventMessage: string): Promise<EventDTO>;
    getAll(): Promise<ParserEvent[]>;
    getParserEventById(id: number): Promise<ParserEvent>;
    deleteById(id: number): Promise<boolean>;
}