import { EventDTO } from "../DTOs/EventDTO";

export interface IParserService{
    normalizeAndSaveEvent(message:string):Promise<EventDTO>;
    /*normalizeEvent(message:string):Promise<Event>; //kad ubace model u event service odkomentarisati
    llmAnalysis(message:string):Promise<Event>;*/
}