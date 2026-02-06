import { InsiderThreatDTO } from "../Domain/DTOs/InsiderThreatDTO";
import { CreateInsiderThreatDTO } from "../Domain/DTOs/CreateInsiderThreatDTO";
import { ThreatQueryDTO, PaginatedThreatsDTO } from "../Domain/DTOs/ThreatQueryDTO";
import { ThreatType } from "../Domain/enums/ThreatType";
import { RiskLevel } from "../Domain/enums/RiskLevel";
import { IInsiderThreatService } from "../Domain/services/IInsiderThreatService";
import { IInsiderThreatRepositoryService } from "../Domain/services/IInsiderThreatRepositoryService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { createEmptyInsiderThreatDTO, toInsiderThreatDTO } from "../Utils/Converters/InsiderThreatConverter";

export class InsiderThreatService implements IInsiderThreatService {
  constructor(
    private repo: IInsiderThreatRepositoryService,
    private readonly logger: ILoggerService
  ) {}

  async createThreat(data: CreateInsiderThreatDTO): Promise<InsiderThreatDTO> {
    const threatData = {
      ...data,
      metadata: data.metadata || null,
      ipAddress: data.ipAddress || null,
      isResolved: false,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: null
    };

    const saved = await this.repo.create(threatData);
    await this.logger.log(`Insider threat created for user ${data.userId} (Type: ${data.threatType}, Risk: ${data.riskLevel})`);
    
    return toInsiderThreatDTO(saved);
  }

  async getAllThreats(): Promise<InsiderThreatDTO[]> {
    const threats = await this.repo.findAll();
    return threats.map(t => toInsiderThreatDTO(t));
  }

  async getThreatById(id: number): Promise<InsiderThreatDTO> {
    const threat = await this.repo.findById(id);
    
    if (!threat) {
      await this.logger.log(`Threat with ID ${id} not found`);
      return createEmptyInsiderThreatDTO();
    }
    
    return toInsiderThreatDTO(threat);
  }

  async getThreatsByUserId(userId: number): Promise<InsiderThreatDTO[]> {
    const threats = await this.repo.findByUserId(userId);
    return threats.map(t => toInsiderThreatDTO(t));
  }

  async getThreatsByType(type: ThreatType): Promise<InsiderThreatDTO[]> {
    const threats = await this.repo.findByType(type);
    return threats.map(t => toInsiderThreatDTO(t));
  }

  async getThreatsByRiskLevel(level: RiskLevel): Promise<InsiderThreatDTO[]> {
    const threats = await this.repo.findByRiskLevel(level);
    return threats.map(t => toInsiderThreatDTO(t));
  }

  async getUnresolvedThreats(): Promise<InsiderThreatDTO[]> {
    const threats = await this.repo.findUnresolved();
    return threats.map(t => toInsiderThreatDTO(t));
  }

  async resolveThreat(id: number, resolvedBy: string, notes?: string): Promise<InsiderThreatDTO> {
    const threat = await this.repo.findById(id);
    
    if (!threat) {
      await this.logger.log(`Failed to resolve threat: Threat with ID ${id} not found`);
      return createEmptyInsiderThreatDTO();
    }

    threat.isResolved = true;
    threat.resolvedBy = resolvedBy;
    threat.resolvedAt = new Date();
    threat.resolutionNotes = notes || null;

    const updated = await this.repo.save(threat);
    await this.logger.log(`Threat ${id} resolved by ${resolvedBy}`);
    
    return toInsiderThreatDTO(updated);
  }

  async getThreatsWithFilters(query: ThreatQueryDTO): Promise<PaginatedThreatsDTO> {
    const { threats, total } = await this.repo.findWithFilters(query);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: threats.map(t => toInsiderThreatDTO(t)),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}