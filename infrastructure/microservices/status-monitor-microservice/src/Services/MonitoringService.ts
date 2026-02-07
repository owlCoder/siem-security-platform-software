import axios from "axios";
import { Repository } from "typeorm";
import { ServiceThreshold } from "../Domain/models/ServiceThreshold";
import { ServiceCheck } from "../Domain/models/ServiceCheck";
import { IMonitoringService } from "../Domain/services/IMonitoringService";
import { ServiceStatus } from "../Domain/enums/ServiceStatusEnum";

export class MonitoringService implements IMonitoringService {
  constructor(
    private thresholdRepo: Repository<ServiceThreshold>,
    private checkRepo: Repository<ServiceCheck>
  ) { }

  // NOVA METODA: Radi posao za jedan servis
  async checkService(threshold: ServiceThreshold): Promise<ServiceCheck> {
    const start = Date.now();
    let status = ServiceStatus.UP;
    let responseTimeMs: number | null = 0;
    let errorType: string | null = null;

    try {
      // Koristimo timeout definisan u bazi za taj servis
      await axios.get(threshold.pingUrl, { timeout: threshold.timeoutMs || 1500 });
      responseTimeMs = Date.now() - start;

    } catch (err: any) {
      status = ServiceStatus.DOWN;
      responseTimeMs = null;

      if (err?.code === "ECONNABORTED" || err?.message?.includes("timeout")) {
        errorType = "timeout";
      } else if (err?.response) {
        errorType = `http_${err.response.status}`;
      } else {
        errorType = "connection_error";
      }
    }

    // Snimamo u bazu
    const check = await this.checkRepo.save({
      serviceName: threshold.serviceName,
      checkedAt: new Date(),
      status: status,
      responseTimeMs: responseTimeMs,
      errorType: errorType,
    });

    return check;
  }

  async runChecks(): Promise<void> {
    // Ova metoda više ništa ne radi jer Orchestrator preuzima kontrolu
    return;
  }
}