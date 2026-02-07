import { AlertDTO } from "../Domain/DTOs/AlertDTO";
import { CreateAlertDTO } from "../Domain/DTOs/CreateAlertDTO";
import { CreateSystemAlertDTO } from "../Domain/DTOs/CreateSystemAlertDTO";
import { ResolveAlertDTO } from "../Domain/DTOs/ResolveAlertDTO";
import { AlertSeverity } from "../Domain/enums/AlertSeverity";
import { AlertStatus } from "../Domain/enums/AlertStatus";
import { IAlertRepositoryService } from "../Domain/services/IAlertRepositoryService";
import { IAlertService } from "../Domain/services/IAlertService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { AlertQueryDTO, PaginatedAlertsDTO } from "../Domain/DTOs/AlertQueryDTO";
import { toAlertDTO, createEmptyAlertDTO } from "../Utils/Converters/AlertConverter";
import { AlertForKpi } from "../Domain/DTOs/AlertForKpiDTO";
import { Alert } from "../Domain/models/Alert";

export class AlertService implements IAlertService {
  constructor(
    private repo: IAlertRepositoryService,
    private readonly logger: ILoggerService
  ) { }
  
  async createAlert(data: CreateAlertDTO): Promise<AlertDTO> {
    try {
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
    } catch (err) {
      await this.logger.log(`Failed to create alert: ${err}`);
      return createEmptyAlertDTO();
    }
  }

  async createSystemAlert(data: CreateSystemAlertDTO): Promise<AlertDTO> {
    try {
      const alertData = {
        title: `System Alert: ${data.category}`,
        description: data.description,
        severity: data.severity,
        correlatedEvents: [], 
        source: data.source,
        detectionRule: null,
        category: data.category,
        oldestEventTimestamp: new Date(), 
        status: AlertStatus.ACTIVE,
        resolvedAt: null,
        resolvedBy: null,
        resolutionNotes: null
      };

      const saved = await this.repo.create(alertData);
      await this.logger.log(`System alert created successfully with ID: ${saved.id} from source: ${data.source}`);

      return toAlertDTO(saved);
    } catch (err) {
      await this.logger.log(`Failed to create system alert: ${err}`);
      return createEmptyAlertDTO();
    }
  }

  async getAlertsForKpi(from: Date, to: Date): Promise<AlertForKpi[]> {
  try {
    const [createdAlerts, resolvedAlerts] = await Promise.all([
      this.repo.findCreatedBetween(from, to),
      this.repo.findResolvedBetween(from, to),
    ]);

    const byId = new Map<number, AlertForKpi>();

    const toDto = (a: Alert): AlertForKpi => {
      const createdAtValid = a.createdAt instanceof Date && !Number.isNaN(a.createdAt.getTime());
      const oldestValid =
        a.oldestEventTimestamp instanceof Date &&
        !Number.isNaN(a.oldestEventTimestamp.getTime());

      const isValid = a.id > 0 && createdAtValid && oldestValid;

      return {
        id: a.id,
        createdAt: a.createdAt,
        resolvedAt: a.resolvedAt ?? undefined,
        oldestCorrelatedEventAt: a.oldestEventTimestamp,
        category: a.category,
        isFalseAlarm: a.status === AlertStatus.MARKED_FALSE,
        isValid,
      };
    };

    for (const a of createdAlerts) byId.set(a.id, toDto(a));
    for (const a of resolvedAlerts) byId.set(a.id, toDto(a));

    return Array.from(byId.values());
  } catch (err) {
    await this.logger.log(`getAlertsForKpi failed: ${err}`);
    return [];
  }
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

  async deleteArchivedAlerts(alertIds: number[]): Promise<void> {
    if (!alertIds || alertIds.length === 0) return;

    try {
        await this.repo.deleteMany(alertIds);
        await this.logger.log(`Deleted archived alerts with IDs: ${alertIds}`);
    } catch (err) {
        await this.logger.log(`Failed to delete archived alerts: ${err}`);
    }
  }
}