import { ParserEventDTO } from "../../models/parser/ParserEventDTO";

export interface IParserAPI {
    getParserEventById(id: number, token: string): Promise<ParserEventDTO>;
}
