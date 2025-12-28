import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { ParserEventDto } from "../../Domain/DTOs/ParserEventDTO";

export interface IParserGatewayService {
  log(eventMessage: string, eventSource: string): Promise<EventDTO>;
  getAllParserEvents(): Promise<ParserEventDto[]>;
  getParserEventById(id: number): Promise<ParserEventDto>;
  deleteById(id: number): Promise<boolean>;
}