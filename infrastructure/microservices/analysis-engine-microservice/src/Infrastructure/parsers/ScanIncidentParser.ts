import { ScanIncidentResponse } from "../../Domain/types/ScanIncidentResponse";
import { JsonValue } from "../../Domain/types/JsonValue";
import { isJsonObject } from "../json/isJsonObject";

export function parseScanIncident(raw: JsonValue): ScanIncidentResponse {
  if (!isJsonObject(raw)) return emptyScanIncidentResponse();

  const summaryRaw = raw["summary"];
  if (typeof summaryRaw !== "string") return emptyScanIncidentResponse();

  const summary = summaryRaw.trim();
  if (summary.length === 0) return emptyScanIncidentResponse();

  return { summary };
}

function emptyScanIncidentResponse(): ScanIncidentResponse {
  return { summary: "Incident analysis is currently unavailable." };
}
