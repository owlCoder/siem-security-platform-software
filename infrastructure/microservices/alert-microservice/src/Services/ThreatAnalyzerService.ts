import { AlertDTO } from "../Domain/DTOs/AlertDTO";
import { CreateAlertDTO } from "../Domain/DTOs/CreateAlertDTO";
import { AlertSeverity } from "../Domain/enums/AlertSeverity";
import { IThreatAnalyzerService } from "../Domain/services/IThreatAnalyzerService";
import { AlertRepositoryService } from "./AlertRepositoryService";

export class ThreatAnalyzerService implements IThreatAnalyzerService {
  constructor(private alertRepository: AlertRepositoryService) {}

  async analyze(eventIds: number[]): Promise<AlertDTO | null> {
    // Dummy logika: ako je više od 5 događaja, kreiraj alert
    if (eventIds.length > 5) {
      const alertData: CreateAlertDTO = {
        title: "Suspicious event correlation detected",
        description: `Detected correlation across ${eventIds.length} events.`,
        severity: AlertSeverity.HIGH,
        correlatedEvents: eventIds,
        source: "AnalysisEngine"
      };

      const alertEntity = await this.alertRepository.create(alertData as any); // TypeORM create
      const savedAlert = await this.alertRepository.save(alertEntity);
      
      return {
        id: savedAlert.id,
        title: savedAlert.title,
        description: savedAlert.description,
        severity: savedAlert.severity,
        status: savedAlert.status,
        correlatedEvents: savedAlert.correlatedEvents,
        source: savedAlert.source,
        createdAt: savedAlert.createdAt,
        resolvedAt: savedAlert.resolvedAt,
        resolvedBy: savedAlert.resolvedBy
      };
    }

    return null;
  }
}
