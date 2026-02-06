import { InsiderThreatDTO } from "../DTOs/InsiderThreatDTO";
import { CreateInsiderThreatDTO } from "../DTOs/CreateInsiderThreatDTO";
import { ThreatQueryDTO, PaginatedThreatsDTO } from "../DTOs/ThreatQueryDTO";
import { ThreatType } from "../enums/ThreatType";
import { RiskLevel } from "../enums/RiskLevel";

export interface IInsiderThreatService {
  createThreat(data: CreateInsiderThreatDTO): Promise<InsiderThreatDTO>;
  getAllThreats(): Promise<InsiderThreatDTO[]>;
  getThreatById(id: number): Promise<InsiderThreatDTO>;
  getThreatsByUserId(userId: number): Promise<InsiderThreatDTO[]>;
  getThreatsByType(type: ThreatType): Promise<InsiderThreatDTO[]>;
  getThreatsByRiskLevel(level: RiskLevel): Promise<InsiderThreatDTO[]>;
  getUnresolvedThreats(): Promise<InsiderThreatDTO[]>;
  resolveThreat(id: number, resolvedBy: string, notes?: string): Promise<InsiderThreatDTO>;
  getThreatsWithFilters(query: ThreatQueryDTO): Promise<PaginatedThreatsDTO>;
}