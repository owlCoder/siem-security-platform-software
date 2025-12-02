import { Repository, Timestamp } from "typeorm";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { ParserEvent } from "../Domain/models/ParserEvent";
import { IParserService } from "../Domain/services/IParserService";
import axios, { AxiosInstance } from "axios";
import { EventType } from "../Domain/enums/EventType";
import { ParseResult } from "../Domain/types/ParseResult";

export class ParserService implements IParserService {
    private readonly analysisEngineClient: AxiosInstance;
    private readonly eventClient: AxiosInstance;

    constructor(private parserEventRepository: Repository<ParserEvent>) {
        const analysisServiceURL = process.env.ANALYSIS_ENGINE_API;
        const eventServiceURL = process.env.EVENT_SERVICE_API;

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

    async normalizeAndSaveEvent(eventMessage: string, eventSource: string): Promise<EventDTO> {
        const timeOfEvent: Date = new Date();

        let event = this.normalizeEventWithRegexes(eventMessage);

        if (event.id === -1)    // Couldn't normalize with regexes -> send it to LLM
            event = await this.normalizeEventWithLlm(eventMessage);

        event.source = eventSource;
        event.timestamp = timeOfEvent;
        const responseEvent = (await this.eventClient.post<EventDTO>("/events", event)).data;    // Saving to the Events table (calling event-collector)

        if (responseEvent.id === -1)
            throw Error("Failed to save event to the database");

        const parserEvent: ParserEvent = { parserId: 0, eventId: responseEvent.id, textBeforeParsing: eventMessage, timestamp: timeOfEvent }
        await this.parserEventRepository.insert(parserEvent);   // Saving to the Parser table

        return responseEvent;
    }

    private normalizeEventWithRegexes(message: string): EventDTO {
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

        parseResult = this.parseServiceConfigurationChangeMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        parseResult = this.pareseResourceExplotationMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        parseResult = this.parseFileChangeMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        parseResult = this.parseNetworkAnomalyMessage(message);
        if (parseResult.doesMatch)
            return parseResult.event!;

        const event: EventDTO = {
            id: -1,
        };

        return event;
    }

    // 1
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

        const event: EventDTO = {
            id: 0,
            type: EventType.INFO,
            description: normalizedDescription,
        };

        return {
            doesMatch: true,
            event
        };
    }

    // 2
    private parsePermissionChangeMessage(message: string): ParseResult {
        const PERMISSION_CHANGE_REGEX = /\b((permission|role|access|privilege)(s)?\s+(changed?|updated?|granted?|assigned?)|(promoted?|elevated?|upgraded?)\s+to|(admin|privileged?|manager|supervisor)\s+(role|access|rights?)(s?)?\s+(granted?|assigned?))\b/i;

        if (!PERMISSION_CHANGE_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);
        if (username === '')
            return { doesMatch: false };

        const normalizedDescription = `User '${username}' permissions or roles changed.`;

        const event: EventDTO = {
            id: 0,
            type: EventType.WARNING,
            description: normalizedDescription,
        };

        return {
            doesMatch: true,
            event
        };
    }

    // 3
    private parseDbAccessMessage(message: string): ParseResult {
        const DB_ACCESS_REGEX = /\b(bulk|massive|large|batch)\s+(read|select|insert|update|delete|export|import|operation|query|write)s?\b/i;

        if (!DB_ACCESS_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);
        if (username === '')
            return { doesMatch: false };

        const normalizedDescription = `User '${username}' performed a large database access operation.`;

        const event: EventDTO = {
            id: 0,
            type: EventType.WARNING,
            description: normalizedDescription,
        };

        return {
            doesMatch: true,
            event,
        };
    }

    // 4
    private parseRateLimitMessage(message: string): ParseResult {
        const RATE_LIMIT_REGEX = /\b(rate\s+limit(ed)?|quota\s+exceeded|throttled?|429|too\s+many\s+requests)\b/i;

        if (!RATE_LIMIT_REGEX.test(message)) {
            return { doesMatch: false };
        }

        const username = this.extractUsernameFromMessage(message);

        const normalizedDescription = username !== ''
            ? `User '${username}' exceeded API rate limit.`
            : `API rate limit exceeded.`;

        const event: EventDTO = {
            id: 0,
            type: EventType.WARNING,
            description: normalizedDescription,
        };

        return {
            doesMatch: true,
            event,
        };
    }

    // 5A
    private parseBruteForceMessage(message: string): ParseResult {
        const BRUTE_FORCE_REGEX = /\b(brute\s*force\s*(attack|attempt|detected)?)\b/i;

        if (!BRUTE_FORCE_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const normalizedDescription = username !== ''
            ? `Brute force attack detected from or targeting user '${username}'.`
            : `Brute force attack detected.`;

        const event: EventDTO = {
            id: 0,
            type: EventType.WARNING,
            description: normalizedDescription,
        };

        return {
            doesMatch: true,
            event
        };
    }

    // 5B
    private parseSqlInjectionMessage(message: string): ParseResult {
        const SQLI_REGEX = /\b(sql(\s|-)?injection|sqli|potential\s*sql\s*injection|sql\s*attack|sql\s*exploit)\b/i;

        if (!SQLI_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const normalizedDescription = username !== ''
            ? `Potential SQL injection attempt detected targeting user '${username}'.`
            : `Potential SQL injection attempt detected.`;

        const event: EventDTO = {
            id: 0,
            type: EventType.WARNING,
            description: normalizedDescription,
        };

        return {
            doesMatch: true,
            event
        };
    }

    // 6A
    private parseServiceConfigurationChangeMessage(message: string): ParseResult {
        const SERVICE_CONFIG_REGEX = /\b(config(uration)?\s*(file|setting|service)?\s*((was\s*)?(changed?|modified?|updated?|edited?))|service\s*(restart(ed)?|reloaded?|stopped?|started?)|settings\s*((was\s*)?(changed?|updated?|modified?)))\b/i;

        if (!SERVICE_CONFIG_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const normalizedDescription = username !== ''
            ? `Service or configuration change made by user '${username}'.`
            : `Service or configuration change detected.`;

        const event: EventDTO = {
            id: 0,
            type: EventType.WARNING,
            description: normalizedDescription,
        };

        return {
            doesMatch: true,
            event
        };
    }

    // 6B
    private pareseResourceExplotationMessage(message: string): ParseResult {
        const RESOURCE_EXPLOIT_REGEX = /\b(cpu|processor|memory|ram|disk|storage|resource)\s*(overuse|abuse|exhaustion|spike|anomaly|overflow|limit|hog|leak)\b/i;

        if (!RESOURCE_EXPLOIT_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const normalizedDescription = username !== ''
            ? `Suspicious resource usage anomaly detected involving user '${username}'.`
            : `Suspicious resource usage anomaly detected.`;

        const event: EventDTO = {
            id: 0,
            type: EventType.WARNING,
            description: normalizedDescription,
        };

        return {
            doesMatch: true,
            event
        };
    }

    // 7
    private parseFileChangeMessage(message: string): ParseResult {
        const FILE_EVENT_REGEX = /\b(file\s*(changed|modified|modification|edited|tampered|corrupted)|malicious\s+file|infected\s+file|virus\s+detected|unauthorized\s+file\s*(change|modification)|checksum\s*(failed|mismatch)|hash\s*(failed|mismatch)|integrity\s*(check\s*)?(failed|mismatch))\b/i;

        if (!FILE_EVENT_REGEX.test(message))
            return { doesMatch: false };

        const username = this.extractUsernameFromMessage(message);

        const normalizedDescription = username !== ''
            ? `File integrity issue detected involving user '${username}'.`
            : `File integrity issue detected.`;

        const event: EventDTO = {
            id: 0,
            type: EventType.ERROR,
            description: normalizedDescription,
        };

        return {
            doesMatch: true,
            event
        };
    }

    // 8
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

        const normalizedDescription = username !== ''
            ? `Network anomaly detected involving user '${username}'.`
            : `Network anomaly detected.`;

        const event: EventDTO = {
            id: 0,
            type: EventType.ERROR,
            description: normalizedDescription,
        };

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

    private async normalizeEventWithLlm(message: string): Promise<EventDTO> {
        const requestBody = {
            message: message
        };

        const response = await this.analysisEngineClient.post("/AnalysisEngine/processEvent", requestBody);

        // Extract LLM-generated event JSON
        const eventData = response.data?.eventData;
        if (!eventData) {
            throw new Error("Invalid response from Analysis Engine (missing eventData)");
        }

        // Convert JSON to Event
        const event: EventDTO = {
            id: 0,
            type: eventData.type,
            description: eventData.description,
        };

        return event;
    }
}