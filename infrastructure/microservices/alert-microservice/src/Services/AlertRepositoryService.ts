import { Repository } from "typeorm";
import { Alert } from "../Domain/models/Alert";
import { IAlertRepositoryService } from "../Domain/services/IAlertRepositoryService";
import { AlertSeverity } from "../Domain/enums/AlertSeverity";
import { AlertStatus } from "../Domain/enums/AlertStatus";


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
}
