import { Repository } from "typeorm";
import { InsiderThreat } from "../Domain/models/InsiderThreat";
import { IInsiderThreatRepositoryService } from "../Domain/services/IInsiderThreatRepositoryService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { ThreatType } from "../Domain/enums/ThreatType";
import { RiskLevel } from "../Domain/enums/RiskLevel";
import { ThreatQueryDTO } from "../Domain/DTOs/ThreatQueryDTO";

export class InsiderThreatRepositoryService implements IInsiderThreatRepositoryService {
  constructor(
    private repo: Repository<InsiderThreat>,
    private readonly logger: ILoggerService
  ) {}

  async create(data: Partial<InsiderThreat>): Promise<InsiderThreat> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async save(threat: InsiderThreat): Promise<InsiderThreat> {
    return this.repo.save(threat);
  }

  async findAll(): Promise<InsiderThreat[]> {
    return this.repo.find({ order: { detectedAt: 'DESC' } });
  }

  async findById(id: number): Promise<InsiderThreat | null> {
    const threat = await this.repo.findOne({ where: { id } });
    
    if (!threat) {
      await this.logger.log(`Insider threat with ID ${id} not found in database`);
    }
    
    return threat;
  }

  async findByUserId(userId: number): Promise<InsiderThreat[]> {
    return this.repo.find({ 
      where: { userId },
      order: { detectedAt: 'DESC' }
    });
  }

  async findByType(type: ThreatType): Promise<InsiderThreat[]> {
    return this.repo.find({ 
      where: { threatType: type },
      order: { detectedAt: 'DESC' }
    });
  }

  async findByRiskLevel(level: RiskLevel): Promise<InsiderThreat[]> {
    return this.repo.find({ 
      where: { riskLevel: level },
      order: { detectedAt: 'DESC' }
    });
  }

  async findUnresolved(): Promise<InsiderThreat[]> {
    return this.repo.find({ 
      where: { isResolved: false },
      order: { detectedAt: 'DESC' }
    });
  }

  async findWithFilters(query: ThreatQueryDTO): Promise<{ threats: InsiderThreat[], total: number }> {
    const {
      page = 1,
      limit = 10,
      userId,
      threatType,
      riskLevel,
      startDate,
      endDate,
      isResolved,
      sortBy = 'detectedAt',
      sortOrder = 'DESC'
    } = query;

    const queryBuilder = this.repo.createQueryBuilder('threat');

    if (userId !== undefined) {
      queryBuilder.andWhere('threat.userId = :userId', { userId });
    }

    if (threatType) {
      queryBuilder.andWhere('threat.threatType = :threatType', { threatType });
    }

    if (riskLevel) {
      queryBuilder.andWhere('threat.riskLevel = :riskLevel', { riskLevel });
    }

    if (isResolved !== undefined) {
      queryBuilder.andWhere('threat.isResolved = :isResolved', { isResolved });
    }

    if (startDate) {
      queryBuilder.andWhere('threat.detectedAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('threat.detectedAt <= :endDate', { endDate });
    }

    queryBuilder.orderBy(`threat.${sortBy}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [threats, total] = await queryBuilder.getManyAndCount();

    return { threats, total };
  }

  async countByUserId(userId: number): Promise<number> {
    return this.repo.count({ where: { userId } });
  }

  async countByUserIdAndType(userId: number, type: ThreatType): Promise<number> {
    return this.repo.count({ where: { userId, threatType: type } });
  }
}