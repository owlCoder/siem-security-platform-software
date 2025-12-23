import { Repository } from "typeorm";
import { ParserEvent } from "../Domain/models/ParserEvent";
import { IParserRepositoryService } from "../Domain/services/IParserRepositoryService";
import { ParserEventDTO } from "../Domain/DTOs/ParserEventDTO";
import { toDTO } from "../Utils/Converter/ConvertDTO";
import { ILogerService } from "../Domain/services/ILogerService";

export class ParserRepositoryService implements IParserRepositoryService {
    constructor(
        private parserEventRepository: Repository<ParserEvent>,
        private readonly logger: ILogerService
    ) { }

    async getAll(): Promise<ParserEventDTO[]> {
        const events = await this.parserEventRepository.find();
        return events.map(e => toDTO(e));
    }

    async getParserEventById(id: number): Promise<ParserEventDTO> {
        const event = await this.parserEventRepository.findOne({ where: { parserId: id } });
        if (!event) {
            await this.logger.log("Failed to read ParserEvent with ID: " + id);

            const parserEvent: ParserEventDTO = {
                parser_id: -1,
                event_id: -1
            };

            return parserEvent;
        }
        return toDTO(event);
    }

    async deleteById(id: number): Promise<boolean> {
        const result = await this.parserEventRepository.delete({ parserId: id })
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
}
