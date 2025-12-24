export const serviceConfig = {
  auth: process.env.AUTH_SERVICE_API!,
  user: process.env.USER_SERVICE_API!,
  alert: process.env.ALERT_SERVICE_API!,
  query: process.env.QUERY_SERVICE_API!,
  siemAuth: process.env.SIEM_AUTH_SERVICE_API!,
  storage: process.env.STORAGE_LOG_SERVICE_API!,
  parser: process.env.PARSER_SERVICE_API!,
  analysisEngine: process.env.ANALYSIS_ENGINE_SERVICE_API!,
  event:process.env.EVENT_SERVICE_API!,
} as const;