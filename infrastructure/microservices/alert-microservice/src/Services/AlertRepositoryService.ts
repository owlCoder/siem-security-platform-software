import { Repository } from "typeorm";
import { Alert } from "../Domain/models/Alert";
import { IAlertRepositoryService } from "../Domain/services/IAlertRepositoryService";
import { AlertSeverity } from "../Domain/enums/AlertSeverity";
import { AlertStatus } from "../Domain/enums/AlertStatus";
import { AlertQueryDTO } from "../Domain/DTOs/AlertQueryDTO";


export class AlertRepositoryService implements IAlertRepositoryService {
  constructor(private repo: Repository<Alert>) {}

  async create(data: Partial<Alert>): Promise<Alert> {
    return this.repo.create(data);
  }

  async save(alert: Alert): Promise<Alert> {
    return this.repo.save(alert);
  }

  async findAll(): Promise<Alert[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<Alert | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    return this.repo.find({ where: { severity } });
  }

  async findByStatus(status: AlertStatus): Promise<Alert[]> {
    return this.repo.find({ where: { status } });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }

  // FILTERING & PAGINATION
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

    // filtering
    if (severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity });
    }

    if (status) {
      queryBuilder.andWhere('alert.status = :status', { status });
    }

    if (source) {
      queryBuilder.andWhere('alert.source LIKE :source', { source: `%${source}%` });
    }

    // time range filtering
    if (startDate) {
      queryBuilder.andWhere('alert.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('alert.createdAt <= :endDate', { endDate });
    }

    // sorting
    queryBuilder.orderBy(`alert.${sortBy}`, sortOrder);

    // pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [alerts, total] = await queryBuilder.getManyAndCount();

    return { alerts, total };
  }
}
