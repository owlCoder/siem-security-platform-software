import { ParserEventDTO } from "../../Domain/DTOs/ParserEventDTO";
import { ParserEvent } from "../../Domain/models/ParserEvent";

export function toDTO(parserEvent: ParserEvent): ParserEventDTO {
  return {
    parser_id: parserEvent.parserId,
    event_id: parserEvent.eventId,
    text_before_parsing: parserEvent.textBeforeParsing,
    ipAddress: parserEvent.ipAddress,
  };
}