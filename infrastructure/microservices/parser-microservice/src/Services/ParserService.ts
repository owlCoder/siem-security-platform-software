import { Repository } from "typeorm";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { ParserEvent } from "../Domain/models/ParserEvent";
import { IParserService } from "../Domain/services/IParserService";
import axios, { AxiosInstance } from "axios";
import { Event } from "../Domain/models/Event";
import { EventResponseType } from "../Domain/types/EventResponse";
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
        const event = await this.parserEventRepository.findOne({ where: { parser_id: id } });
        if (!event) {
            throw new Error(`Parser Event with id=${id} not found.`);
        }
        return event;
    }
    async deleteById(id: number): Promise<boolean> {
        const result = await this.parserEventRepository.delete({ parser_id: id })
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }

    async normalizeEvent(message: string): Promise<Event> {
        //postaviti regex i ako nema podudaranja vratiti prazan objekat
        throw new Error("Method not implemented.");
    }
    async llmAnalysis(message: string): Promise<EventDTO> { //mozda bolje eventDTO da vracamo
        //mozda  da oni prave prompt za LLM a ne da im mi to radimo,samo zamjeniti message sa prompt ako ga pravimo
       const response=await this.analysisEngineClient.post<AnlysisEngineResponseType>("ruta njhova", message);
       if(!response.data.eventData){
           throw new Error("Event data in response is NULL");
       }
        return response.data.eventData;
    }
    async normalizeAndSaveEvent(message: string): Promise<EventDTO> {
        const event = await this.normalizeEvent(message);
        if (event.event_id === -1) { //da mozda dodamo normlize polje da li je normalizovano ili nije,ako nije da ga saljemo na analizu 
            const eventLLM = await this.llmAnalysis(message); 
            const parserEvent: ParserEvent = { parser_id: 0, event_id: eventLLM.event_id, normalize_text: message, normalize_timestamp: new Date() }
            await this.parserEventRepository.insert(parserEvent);
            return eventLLM;
        } else {
            const response = await this.eventClient.post<EventResponseType>("ruta neka", event);//dodati naziv rute kad postave u kontroleru

            if (response.data.success) {
                await this.parserEventRepository.insert(event); //mozemo koristiti insert jer nam ne treba povratna vrijednost 
                // vec imamo event
                const eventDTO = this.toDTO(event);
                return eventDTO;
            }else{
                throw Error("Error when we sent a event");
            }

        }

    }

    private toDTO(event: Event): EventDTO {
        return {
            event_id: event.event_id,
            event_source: event.event_source,
            event_timestamp: event.timestamp,
            message: event.event_description,
            event_type: event.event_type
        }
    }

}