import { Repository } from "typeorm";
import { Alert } from "../Domain/models/Alert";
import { IAlertRepositoryService } from "../Domain/services/IAlertRepositoryService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { AlertSeverity } from "../Domain/enums/AlertSeverity";
import { AlertStatus } from "../Domain/enums/AlertStatus";
import { AlertQueryDTO } from "../Domain/DTOs/AlertQueryDTO";

export class AlertRepositoryService implements IAlertRepositoryService {
  constructor(
    private repo: Repository<Alert>,
    private readonly logger: ILoggerService
  ) {}

  // odmah čuva u bazu
  async create(data: Partial<Alert>): Promise<Alert> {
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    return saved;
  }

  async save(alert: Alert): Promise<Alert> {
    return this.repo.save(alert);
  }

  async findAll(): Promise<Alert[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<Alert | null> {
    const alert = await this.repo.findOne({ where: { id } });
    
    if (!alert) {
      await this.logger.log(`Alert with ID ${id} not found in database`);
    }
    
    return alert;
  }

  async findBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    return this.repo.find({ where: { severity } });
  }

  async findByStatus(status: AlertStatus): Promise<Alert[]> {
    return this.repo.find({ where: { status } });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    const success = result.affected !== undefined && result.affected !== null && result.affected > 0;
    
    if (!success) {
      await this.logger.log(`Failed to delete alert with ID ${id}`);
    }
    
    return success;
  }

  async findWithFilters(query: AlertQueryDTO): Promise<{ alerts: Alert[], total: number }> {
    const {
      page = 1,
      limit = 10,
      severity,
      status,
      startDate,
      endDate,
      source,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = query;

    const queryBuilder = this.repo.createQueryBuilder('alert');

    if (severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity });
    }

    if (status) {
      queryBuilder.andWhere('alert.status = :status', { status });
    }

    if (source) {
      queryBuilder.andWhere('alert.source LIKE :source', { source: `%${source}%` });
    }

    if (startDate) {
      queryBuilder.andWhere('alert.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('alert.createdAt <= :endDate', { endDate });
    }

    queryBuilder.orderBy(`alert.${sortBy}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [alerts, total] = await queryBuilder.getManyAndCount();

    return { alerts, total };
  }
}