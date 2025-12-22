import { parseBruteForceMessage } from "../../Utils/Regex/BruteForceParser";
import { parseDbAccessMessage } from "../../Utils/Regex/DbAccessParser";
import { parseFileChangeMessage } from "../../Utils/Regex/FileChangeParser";
import { parseLoginMessage } from "../../Utils/Regex/LoginMessageParser";
import { parseNetworkAnomalyMessage } from "../../Utils/Regex/NetworkAnomalyParser";
import { parsePermissionChangeMessage } from "../../Utils/Regex/PermissionChangeParser";
import { parseRateLimitMessage } from "../../Utils/Regex/RateLimitParser";
import { pareseResourceExplotationMessage } from "../../Utils/Regex/ResourceExplotationParser";
import { parseServiceConfigurationChangeMessage } from "../../Utils/Regex/ServiceConfigurationChangeParser";
import { parseSqlInjectionMessage } from "../../Utils/Regex/SqlInjectionParser";
import { EventParser } from "../types/EventParser";

export const EVENT_PARSERS: EventParser[] = [
    parseLoginMessage,
    parsePermissionChangeMessage,
    parseDbAccessMessage,
    parseRateLimitMessage,
    parseBruteForceMessage,
    parseSqlInjectionMessage,
    parseServiceConfigurationChangeMessage,
    pareseResourceExplotationMessage,
    parseFileChangeMessage,
    parseNetworkAnomalyMessage
];
