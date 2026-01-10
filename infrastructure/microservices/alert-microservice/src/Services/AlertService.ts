import { AlertDTO } from "../Domain/DTOs/AlertDTO";
import { CreateAlertDTO } from "../Domain/DTOs/CreateAlertDTO";
import { ResolveAlertDTO } from "../Domain/DTOs/ResolveAlertDTO";
import { AlertSeverity } from "../Domain/enums/AlertSeverity";
import { AlertStatus } from "../Domain/enums/AlertStatus";
import { IAlertRepositoryService } from "../Domain/services/IAlertRepositoryService";
import { IAlertService } from "../Domain/services/IAlertService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { AlertQueryDTO, PaginatedAlertsDTO } from "../Domain/DTOs/AlertQueryDTO";
import { toAlertDTO, createEmptyAlertDTO } from "../Utils/Converters/AlertConverter";

export class AlertService implements IAlertService {
  constructor(
    private repo: IAlertRepositoryService,
    private readonly logger: ILoggerService
  ) {}

  async createAlert(data: CreateAlertDTO): Promise<AlertDTO> {
    const alertData = {
      ...data,
      status: AlertStatus.ACTIVE,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: null,
      detectionRule: data.detectionRule || null 
    };

    const saved = await this.repo.create(alertData);
    await this.logger.log(`Alert created successfully with ID: ${saved.id}`);
    
    return toAlertDTO(saved);
  }

  async getAllAlerts(): Promise<AlertDTO[]> {
    const alerts = await this.repo.findAll();
    return alerts.map(a => toAlertDTO(a));
  }

  async getAlertById(id: number): Promise<AlertDTO> {
    const alert = await this.repo.findById(id);
    
    if (!alert) {
      await this.logger.log(`Alert with ID ${id} not found`);
      return createEmptyAlertDTO();
    }
    
    return toAlertDTO(alert);
  }

  async getAlertsBySeverity(severity: AlertSeverity): Promise<AlertDTO[]> {
    const alerts = await this.repo.findBySeverity(severity);
    return alerts.map(a => toAlertDTO(a));
  }

  async getAlertsByStatus(status: AlertStatus): Promise<AlertDTO[]> {
    const alerts = await this.repo.findByStatus(status);
    return alerts.map(a => toAlertDTO(a));
  }

  async resolveAlert(id: number, data: ResolveAlertDTO): Promise<AlertDTO> {
    const alert = await this.repo.findById(id);
    
    if (!alert) {
      await this.logger.log(`Failed to resolve alert: Alert with ID ${id} not found`);
      return createEmptyAlertDTO();
    }

    alert.status = data.status;
    alert.resolvedBy = data.resolvedBy;
    alert.resolvedAt = new Date();

    const updated = await this.repo.save(alert);
    await this.logger.log(`Alert ${id} resolved by ${data.resolvedBy}`);
    
    return toAlertDTO(updated);
  }

  async updateAlertStatus(id: number, status: AlertStatus): Promise<AlertDTO> {
    const alert = await this.repo.findById(id);
    
    if (!alert) {
      await this.logger.log(`Failed to update status: Alert with ID ${id} not found`);
      return createEmptyAlertDTO();
    }

    alert.status = status;

    const updated = await this.repo.save(alert);
    await this.logger.log(`Alert ${id} status changed to ${status}`);
    
    return toAlertDTO(updated);
  }

  async getAlertsWithFilters(query: AlertQueryDTO): Promise<PaginatedAlertsDTO> {
    const { alerts, total } = await this.repo.findWithFilters(query);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: alerts.map(a => toAlertDTO(a)),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}