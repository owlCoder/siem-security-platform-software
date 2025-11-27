import { Repository } from "typeorm";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { ParserEvent } from "../Domain/models/ParserEvent";
import { IParserService } from "../Domain/services/IParserService";
import axios, { AxiosInstance } from "axios";
import { Event } from "../Domain/models/Event";
import { AnlysisEngineResponseType } from "../Domain/types/AnalysisEngineResponse";


export class ParserService implements IParserService {
    private readonly analysisEngineClient: AxiosInstance;
    private readonly eventClient: AxiosInstance;

    constructor(private parserEventRepository: Repository<ParserEvent>) {
        console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m Service started`);
        const analysisServiceURL = process.env.ANALYSIS_ENGINE_API;
        const eventServiceURL = process.env.EVENT_SERVICE_API;
        console.log(`Analysis Engine url: ${analysisServiceURL}`)
        console.log(`Event Service url: ${eventServiceURL}`)

        this.analysisEngineClient = axios.create({
            baseURL: analysisServiceURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });

        this.eventClient = axios.create({
            baseURL: analysisServiceURL,
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
        });
    }

    async getAll(): Promise<ParserEvent[]> {
        const events = await this.parserEventRepository.find();
        return events;
    }

    async getParserEventById(id: number): Promise<ParserEvent> {
        const event = await this.parserEventRepository.findOne({ where: { parserId: id } });
        if (!event) {
            throw new Error(`Parser Event with id=${id} not found.`);
        }
        return event;
    }

    async deleteById(id: number): Promise<boolean> {
        const result = await this.parserEventRepository.delete({ parserId: id })
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }

    async normalizeAndSaveEvent(eventMessage: string): Promise<EventDTO> {
        let event = await this.normalizeEventWithRegexes(eventMessage);

        if (event.id === -1)    // Couldn't normalize with regexes -> send it to LLM
            event = await this.normalizeEventWithLlm(eventMessage);

        const eventDTO = (await this.eventClient.post<EventDTO>("ruta neka", event)).data;    // Saving to the Events table (calling event-collector)
        if (eventDTO.id === 0)
            throw Error("Failed to save event to the database");

        const parserEvent: ParserEvent = { parserId: 0, eventId: eventDTO.id, textBeforeParsing: eventMessage, timestamp: new Date() }
        await this.parserEventRepository.insert(parserEvent);   // Saving to the Parser table

        return eventDTO;
    }

    private async normalizeEventWithRegexes(message: string): Promise<Event> {
        //postaviti regex i ako nema podudaranja vratiti prazan objekat
        throw new Error("Method not implemented.");
    }

    private async normalizeEventWithLlm(message: string): Promise<Event> {
        const response = await this.analysisEngineClient.post<AnlysisEngineResponseType>("ruta njhova", message);

        if (!response.data.eventData) {
            throw new Error("Event data in response is NULL");
        }

        return response.data.eventData;
    }

    private toDTO(event: Event): EventDTO {
        return {
            id: event.id,
            source: event.source,
            type: event.type,
            description: event.description,
            timestamp: event.timestamp
        }
    }
}