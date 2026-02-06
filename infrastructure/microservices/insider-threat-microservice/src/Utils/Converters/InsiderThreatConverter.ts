import { InsiderThreat } from "../../Domain/models/InsiderThreat";
import { InsiderThreatDTO } from "../../Domain/DTOs/InsiderThreatDTO";
import { ThreatType } from "../../Domain/enums/ThreatType";
import { RiskLevel } from "../../Domain/enums/RiskLevel";

export function toInsiderThreatDTO(threat: InsiderThreat): InsiderThreatDTO {
  return {
    id: threat.id,
    userId: threat.userId,
    threatType: threat.threatType,
    riskLevel: threat.riskLevel,
    description: threat.description,
    metadata: threat.metadata,
    correlatedEventIds: threat.correlatedEventIds,
    ipAddress: threat.ipAddress,
    source: threat.source,
    detectedAt: threat.detectedAt,
    isResolved: threat.isResolved,
    resolvedAt: threat.resolvedAt,
    resolvedBy: threat.resolvedBy,
    resolutionNotes: threat.resolutionNotes
  };
}

export function createEmptyInsiderThreatDTO(): InsiderThreatDTO {
  return {
    id: -1,
    userId: -1,
    threatType: ThreatType.MASS_DATA_READ,
    riskLevel: RiskLevel.LOW,
    description: "",
    metadata: null,
    correlatedEventIds: [],
    ipAddress: null,
    source: "",
    detectedAt: new Date(),
    isResolved: false,
    resolvedAt: null,
    resolvedBy: null,
    resolutionNotes: null
  };
}