import { Repository } from "typeorm";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { ParserEvent } from "../Domain/models/ParserEvent";
import { IParserService } from "../Domain/services/IParserService";

export class ParserService implements IParserService {
    constructor(private parserEventRepository: Repository<ParserEvent>) {
        console.log(`\x1b[35m[Logger@1.45.4]\x1b[0m Service started`);
    }
   
    normalizeEvent(message: string): Promise<Event> {
        throw new Error("Method not implemented.");
    }
    llmAnalysis(message: string): Promise<Event> {
        throw new Error("Method not implemented.");
    }
    normalizeAndSaveEvent(message: string): Promise<EventDTO> {
        throw new Error("Method not implemented.");
    }

    
}