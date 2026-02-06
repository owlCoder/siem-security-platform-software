import { InsiderThreat } from "../models/InsiderThreat";
import { ThreatType } from "../enums/ThreatType";
import { RiskLevel } from "../enums/RiskLevel";
import { ThreatQueryDTO } from "../DTOs/ThreatQueryDTO";

export interface IInsiderThreatRepositoryService {
  create(data: Partial<InsiderThreat>): Promise<InsiderThreat>;
  save(threat: InsiderThreat): Promise<InsiderThreat>;
  findAll(): Promise<InsiderThreat[]>;
  findById(id: number): Promise<InsiderThreat | null>;
  findByUserId(userId: number): Promise<InsiderThreat[]>;
  findByType(type: ThreatType): Promise<InsiderThreat[]>;
  findByRiskLevel(level: RiskLevel): Promise<InsiderThreat[]>;
  findUnresolved(): Promise<InsiderThreat[]>;
  findWithFilters(query: ThreatQueryDTO): Promise<{ threats: InsiderThreat[], total: number }>;
  countByUserId(userId: number): Promise<number>;
  countByUserIdAndType(userId: number, type: ThreatType): Promise<number>;
}