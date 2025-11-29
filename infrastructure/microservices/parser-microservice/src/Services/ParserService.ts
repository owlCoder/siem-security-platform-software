import { Repository } from "typeorm";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { ParserEvent } from "../Domain/models/ParserEvent";
import { IParserService } from "../Domain/services/IParserService";
import axios, { AxiosInstance } from "axios";
import { Event } from "../Domain/models/Event";
import { EventType } from "../Domain/enums/EventType";
import { ParseResult } from "../Domain/types/ParseResult";
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
            baseURL: eventServiceURL,
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
        let event = this.normalizeEventWithRegexes(eventMessage);

        
        if (event.id === -1)    // Couldn't normalize with regexes -> send it to LLM
            event = await this.normalizeEventWithLlm(eventMessage);

        const eventDTO = (await this.eventClient.post<EventDTO>("ruta neka", event)).data;    // Saving to the Events table (calling event-collector)
        if (eventDTO.id === -1)
            throw Error("Failed to save event to the database");

        const parserEvent: ParserEvent = { parserId: 0, eventId: eventDTO.id, textBeforeParsing: eventMessage, timestamp: new Date() }
        await this.parserEventRepository.insert(parserEvent);   // Saving to the Parser table

        return eventDTO;
    }

    private normalizeEventWithRegexes(message: string): Event {
        let parseResult;

        parseResult = this.parseLoginMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        parseResult = this.parsePermissionChangeMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        parseResult = this.parseDbAccessMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        parseResult = this.parseRateLimitMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        parseResult = this.parseBruteForceMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        parseResult = this.parseSqlInjectionMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        const event = new Event();
        event.id = -1;
        return event;
    }

    //1
    private parseLoginMessage(message: string): ParseResult {
        const SUCCESS_LOGIN_REGEX = /\b(success(ful(ly)?)?|logged\s+in|login\s+ok|authentication\s+successful)\b/i;
        const FAIL_LOGIN_REGEX = /\b(fail(ed)?|unsuccessful|incorrect|invalid|denied|error).*(login|authentication)\b/i;

        if (!SUCCESS_LOGIN_REGEX.test(message) && !FAIL_LOGIN_REGEX.test(message))      // Checks for login event
            return { doesMatch: false };


        const username = this.extractUsernameFromMessage(message);
        if (username === '')
            return { doesMatch: false };

        const normalizedDescription = SUCCESS_LOGIN_REGEX.test(message) ?
            `User '${username}' successfully logged in.` : `Unsuccessful login attempt for user '${username}'.`;

        const event = new Event();
        event.source = '';              // Not sure what is source of event, TODO: Change this
        event.type = EventType.INFO;
        event.description = normalizedDescription;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event
        };
    }

    //2
    private parsePermissionChangeMessage(message: string): ParseResult {
        const PERMISSION_CHANGE_REGEX = /\b((permission|role|access|privilege)(s)?\s+(changed?|updated?|granted?|assigned?)|(promoted?|elevated?|upgraded?)\s+to|(admin|privileged?|manager|supervisor)\s+(role|access|rights?)(s?)?\s+(granted?|assigned?))\b/i;

        if (!PERMISSION_CHANGE_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);
        if (username === '')
            return { doesMatch: false };

        const normalizedDescription = `User '${username}' permissions or roles changed.`;

        const event = new Event();
        event.source = '';
        event.type = EventType.WARNING;
        event.description = normalizedDescription;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event
        };
    }

    //3
    private parseDbAccessMessage(message: string): ParseResult {
        const DB_ACCESS_REGEX = /\b(bulk|massive|large|batch)\s+(read|select|insert|update|delete|export|import|operation|query|write)s?\b/i;

        if (!DB_ACCESS_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);
        if (username === '')
            return { doesMatch: false };

        const normalizedDescription = `User '${username}' performed a large database access operation.`;

        const event = new Event();
        event.source = '';
        event.type = EventType.WARNING;
        event.description = normalizedDescription;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event,
        };
    }

    //4
    private parseRateLimitMessage(message: string): ParseResult {
        const RATE_LIMIT_REGEX = /\b(rate\s+limit(ed)?|quota\s+exceeded|throttled?|429|too\s+many\s+requests)\b/i;

        if (!RATE_LIMIT_REGEX.test(message)) {
            return { doesMatch: false };
        }

        const username = this.extractUsernameFromMessage(message);

        const normalizedDescription = username !== ''
            ? `User '${username}' exceeded API rate limit.`
            : `API rate limit exceeded.`;

        const event = new Event();
        event.source = '';
        event.type = EventType.WARNING;
        event.description = normalizedDescription;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event,
        };
    }

    //5
    private parseBruteForceMessage(message: string): ParseResult {
        const BRUTE_FORCE_REGEX = /\b(brute\s*force\s*(attack|attempt|detected)?)\b/i;

        if (!BRUTE_FORCE_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const description = username !== ''
            ? `Brute force attack detected from or targeting user '${username}'.`
            : `Brute force attack detected.`;

        const event = new Event();
        event.source = '';
        event.type = EventType.WARNING;
        event.description = description;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event
        };
    }

    //5
    private parseSqlInjectionMessage(message: string): ParseResult {
        const SQLI_REGEX = /\b(sql(\s|-)?injection|sqli|potential\s*sql\s*injection|sql\s*attack|sql\s*exploit)\b/i;

        if (!SQLI_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const description = username !== ''
            ? `Potential SQL injection attempt detected targeting user '${username}'.`
            : `Potential SQL injection attempt detected.`;

        const event = new Event();
        event.source = '';
        event.type = EventType.WARNING;
        event.description = description;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event
        };
    }

    //6A
    private parseServiceConfigurationChangeMessage(message: string): ParseResult {
         const SERVICE_CONFIG_REGEX = /\b(config(uration)?\s*(file|setting|service)?\s*(changed?|modified?|updated?|edited?)|service\s*(restart(ed)?|reloaded?|stopped?|started?)|settings\s*(changed?|updated?|modified?))\b/i;

        if (!SERVICE_CONFIG_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const description = username !== ''
            ? `Service or configuration change made by user '${username}'.`
            : `Service or configuration change detected.`;

        const event = new Event();
        event.source = '';
        event.type = EventType.WARNING; 
        event.description = description;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event
        };
    }

    //6B
    private pareseResourceExplotationMessage(message: string): ParseResult {
         const RESOURCE_EXPLOIT_REGEX = /\b(cpu|processor|memory|ram|disk|storage|resource)\s*(overuse|abuse|exhaustion|spike|anomaly|overflow|limit|hog|leak)\b/i;

         if (!RESOURCE_EXPLOIT_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const description = username !== ''
            ? `Suspicious resource usage anomaly detected involving user '${username}'.`
            : `Suspicious resource usage anomaly detected.`;

        const event = new Event();
        event.source = '';
        event.type = EventType.WARNING; 
        event.description = description;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event
        };
    }

    //7
    private parseFileChangeMessage(message: string): ParseResult {
         const FILE_EVENT_REGEX = /\b(file\s*(changed|modified|edited|tampered|corrupted)|malicious\s+file|infected\s+file|virus\s+detected|checksum\s*(failed|mismatch)|hash\s*(failed|mismatch)|integrity\s*(check\s*)?(failed|mismatch))\b/i;
        
         if (!FILE_EVENT_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const description = username !== ''
            ? `File integrity issue detected involving user '${username}'.`
            : `File integrity issue detected.`;

        const event = new Event();
        event.source = '';
        event.type = EventType.ERROR; 
        event.description = description;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event
        };
    }

    //8
    private parseNetworkAnomalyMessage(message: string): ParseResult {
        //sus ip, ip scanning, ip abuese
        const IP_ANOMALY_REGEX = /\b(ip\s*(abuse|misuse|attack|scan|scanning|flood|probe|spoof))\b/i;
        //unknown device, unauthorized device, device attack
        const DEVICE_ANOMALY_REGEX = /\b(unauthorized\s*device|unknown\s*device|device\s*(attack|probe|breach))\b/i;
        //Network anomaly, service abuse, service intrusion
        const SERVICE_ANOMALY_REGEX = /\b(network\s*(anomaly|intrusion|attack|suspicious|breach)|service\s*(abuse|attack|misuse))\b/i;

        if (!IP_ANOMALY_REGEX.test(message) && !DEVICE_ANOMALY_REGEX.test(message) && !SERVICE_ANOMALY_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const description = username !== ''
            ? `Network anomaly detected involving user '${username}'.`
            : `Network anomaly detected.`;

        const event = new Event();
        event.source = '';
        event.type = EventType.WARNING; 
        event.description = description;
        event.timestamp = new Date();

        return {
            doesMatch: true,
            event
        };
    }

    private extractUsernameFromMessage(message: string): string {   // Returns username or empty string if username is not found
        const USERNAME_REGEX = /\b(user(name)?|account)\s*[:=]\s*"?([A-Za-z0-9._-]+)"?/i;

        const usernameMatch = USERNAME_REGEX.exec(message);
        return usernameMatch && usernameMatch[3] ? usernameMatch[3] : '';
    }

    private async normalizeEventWithLlm(message: string): Promise<Event> {
        const prompt = "CUSTOM PROMPT: " + message;
        const responseFromLlm = (await this.analysisEngineClient.post<string>("ruta njhova", prompt)).data;    // CSV format of Event class attributes

        throw new Error("Not implemented yet.");
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