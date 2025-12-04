import { AlertDTO } from "../Domain/DTOs/AlertDTO";
import { CreateAlertDTO } from "../Domain/DTOs/CreateAlertDTO";
import { ResolveAlertDTO } from "../Domain/DTOs/ResolveAlertDTO";
import { AlertSeverity } from "../Domain/enums/AlertSeverity";
import { AlertStatus } from "../Domain/enums/AlertStatus";
import { IAlertRepositoryService } from "../Domain/services/IAlertRepositoryService";
import { IAlertService } from "../Domain/services/IAlertService";
import { AlertQueryDTO, PaginatedAlertsDTO } from "../Domain/DTOs/AlertQueryDTO";

export class AlertService implements IAlertService {
  constructor(private repo: IAlertRepositoryService) {}

  private createEmptyDTO(): AlertDTO {
    return {
      id: 0,
      title: "",
      description: "",
      severity: AlertSeverity.LOW,
      status: AlertStatus.ACTIVE,
      correlatedEvents: [],
      source: "",
      createdAt: new Date(),
      resolvedAt: null,
      resolvedBy: null
    };
  }

  private toDTO(alert: any): AlertDTO {
    return {
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      status: alert.status,
      correlatedEvents: alert.correlatedEvents,
      source: alert.source,
      createdAt: alert.createdAt,
      resolvedAt: alert.resolvedAt,
      resolvedBy: alert.resolvedBy
    };
  }

  async createAlert(data: CreateAlertDTO): Promise<AlertDTO> {
    const entity = await this.repo.create({
      ...data,
      status: AlertStatus.ACTIVE,
      resolvedAt: null,
      resolvedBy: null
    });

    const saved = await this.repo.save(entity);
    return this.toDTO(saved);
  }

  async getAllAlerts(): Promise<AlertDTO[]> {
    return (await this.repo.findAll()).map(a => this.toDTO(a));
  }

  async getAlertById(id: number): Promise<AlertDTO> {
    const alert = await this.repo.findById(id);
    if (!alert) return this.createEmptyDTO();
    return this.toDTO(alert);
  }

  async getAlertsBySeverity(severity: AlertSeverity): Promise<AlertDTO[]> {
    return (await this.repo.findBySeverity(severity)).map(a => this.toDTO(a));
  }

  async getAlertsByStatus(status: AlertStatus): Promise<AlertDTO[]> {
    return (await this.repo.findByStatus(status)).map(a => this.toDTO(a));
  }

  async resolveAlert(id: number, data: ResolveAlertDTO): Promise<AlertDTO> {
    const alert = await this.repo.findById(id);
    if (!alert) return this.createEmptyDTO();

    alert.status = data.status;
    alert.resolvedBy = data.resolvedBy;
    alert.resolvedAt = new Date();

    return this.toDTO(await this.repo.save(alert));
  }

  async updateAlertStatus(id: number, status: AlertStatus): Promise<AlertDTO> {
    const alert = await this.repo.findById(id);
    if (!alert) return this.createEmptyDTO();

    alert.status = status;

    return this.toDTO(await this.repo.save(alert));
  }

  async getAlertsWithFilters(query: AlertQueryDTO): Promise<PaginatedAlertsDTO> {
    const { alerts, total } = await this.repo.findWithFilters(query);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: alerts.map(a => this.toDTO(a)),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}