import { Repository } from "typeorm";
import { Alert } from "../Domain/models/Alert";
import { IAlertService } from "../Domain/services/IAlertService";
import { AlertDTO, CreateAlertDTO, ResolveAlertDTO } from "../Domain/DTOs/AlertDTO";
import { AlertSeverity } from "../Domain/enums/AlertSeverity";
import { AlertStatus } from "../Domain/enums/AlertStatus";

export class AlertService implements IAlertService {

  constructor(private alertRepository: Repository<Alert>) {}

  private toDTO(alert: Alert): AlertDTO {
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
    const alert = this.alertRepository.create({
      ...data,
      status: AlertStatus.ACTIVE,
      detectionRule: null,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: null
    });

    const saved = await this.alertRepository.save(alert);
    return this.toDTO(saved);
  }

  async getAllAlerts(): Promise<AlertDTO[]> {
    const alerts = await this.alertRepository.find();
    return alerts.map(a => this.toDTO(a));
  }

  async getAlertById(id: number): Promise<AlertDTO> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) throw new Error(`Alert with ID ${id} not found`);
    return this.toDTO(alert);
  }

  async getAlertsBySeverity(severity: AlertSeverity): Promise<AlertDTO[]> {
    const alerts = await this.alertRepository.find({ where: { severity } });
    return alerts.map(a => this.toDTO(a));
  }

  async getAlertsByStatus(status: AlertStatus): Promise<AlertDTO[]> {
    const alerts = await this.alertRepository.find({ where: { status } });
    return alerts.map(a => this.toDTO(a));
  }

  async resolveAlert(id: number, data: ResolveAlertDTO): Promise<AlertDTO> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) throw new Error(`Alert ${id} not found`);

    alert.status = data.status;
    alert.resolvedBy = data.resolvedBy;
    alert.resolvedAt = new Date();

    const updated = await this.alertRepository.save(alert);
    return this.toDTO(updated);
  }

  async updateAlertStatus(id: number, status: AlertStatus): Promise<AlertDTO> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) throw new Error(`Alert ${id} not found`);

    alert.status = status;

    const updated = await this.alertRepository.save(alert);
    return this.toDTO(updated);
  }

  async deleteAlert(id: number): Promise<boolean> {
    const result = await this.alertRepository.delete(id);
    return result.affected !== 0;
  }

  // Za AnalysisEngine
  async analyzeEventsForThreats(eventIds: number[]): Promise<AlertDTO | null> {
    // Dummy logika za sada
    if (eventIds.length > 5) {
      const created = await this.createAlert({
        title: "Suspicious event correlation detected",
        description: `Detected suspicious correlation across ${eventIds.length} events.`,
        severity: AlertSeverity.HIGH,
        correlatedEvents: eventIds,
        source: "AnalysisEngine"
      });
      return created;
    }

    return null;
  }
}
