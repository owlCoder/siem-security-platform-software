export const microserviceUrls: Record<string, string> = {       // TODO: Fix later to work for all microservices
    "events": process.env.EVENT_SERVICE_API!,
    "parserEvents": process.env.PARSER_SERVICE_API!,
    "alerts": process.env.ALERT_SERVICE_API!,
    "query": process.env.QUERY_SERVICE_API!,
    "siem-auth": process.env.SIEM_AUTH_SERVICE_API!,
    "storageLog": process.env.STORAGE_LOG_SERVICE_API!,
    "analysis-engine": process.env.ANALYSIS_ENGINE_SERVICE_API!
};
