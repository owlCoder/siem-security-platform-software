import { Repository, IsNull } from "typeorm";
import { ServiceCheck } from "../Domain/models/ServiceCheck";
import { ServiceIncident } from "../Domain/models/ServiceIncident";
import { ServiceThreshold } from "../Domain/models/ServiceThreshold";
import { ServiceStatus } from "../Domain/enums/ServiceStatusEnum";
import { IIncidentService } from "../Domain/services/IIncidentService";
import axios from 'axios';

export class IncidentService implements IIncidentService {
  constructor(
    private checkRepo: Repository<ServiceCheck>,
    private incidentRepo: Repository<ServiceIncident>,
    private thresholdRepo: Repository<ServiceThreshold>
  ) {}

  async evaluate(serviceName: string): Promise<void> {
    const threshold = await this.thresholdRepo.findOne({
      where: { serviceName },
    });

    if (!threshold) return;
    if (threshold.maxConsecutiveDown <= 0 || threshold.recoveryUpCount <= 0) return;

    // 1. Provera da li vec postoji otvoren incident
    const openIncident = await this.incidentRepo.findOne({
      where: { serviceName, endTime: IsNull() },
      order: { startTime: "DESC" },
    });

    // 2. Uzimamo istoriju provera za analizu
    const recentChecks = await this.checkRepo.find({
      where: { serviceName },
      order: { checkedAt: "DESC" },
      take: Math.max(threshold.maxConsecutiveDown, threshold.recoveryUpCount),
    });

    const totalChecksInDb = await this.checkRepo.count({ where: { serviceName } });

    if (recentChecks.length === 0) return;

    // --- LOGIKA ZA OTVARANJE INCIDENTA ---
    if (!openIncident) {
      const downs = recentChecks.slice(0, threshold.maxConsecutiveDown).every(c => c.status === ServiceStatus.DOWN);

      if (downs) {
        let summary = this.runHeuristicAnalysis(recentChecks.slice(0, threshold.maxConsecutiveDown), totalChecksInDb);

        if (!summary) {
           summary = await this.runDeepAnalysis(serviceName);
        }

        // UPIS U BAZU 
        await this.incidentRepo.save({
          serviceName,
          startTime: new Date(),
          endTime: null,
          reason: `Service down ${threshold.maxConsecutiveDown} consecutive checks`,
          correlationSummary: summary, 
          correlationRefs: JSON.stringify({ 
            checksAnalyzed: recentChecks.length,
            totalServiceHistory: totalChecksInDb 
          }), 
        });
      }
      return;
    }

    // --- LOGIKA ZA ZATVARANJE INCIDENTA ---
    const ups = recentChecks.slice(0, threshold.recoveryUpCount).every(c => c.status === ServiceStatus.UP);
    if (ups) {
      openIncident.endTime = new Date();
      await this.incidentRepo.save(openIncident);
    }
  }

  private runHeuristicAnalysis(downs: ServiceCheck[], totalHistory: number): string | null {
    if (totalHistory <= downs.length) {
      return "Correlation: The service has never been successfully initialized (no history of an UP status). Check network reachability.";
    }

    // Provera: Da li su svi padovi bili timeout (npr. responseTime je -1 ili null)
    const allTimeouts = downs.every(c => !c.responseTimeMs || c.responseTimeMs === -1);
    if (allTimeouts) {
      return "Correlation (Heuristic): A complete timeout has been detected. Possible network outage or a DDoS attack saturating the service.";
    }

    return null; // saljemo llmu
  }

  private async runDeepAnalysis(serviceName: string): Promise<string> {
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const eventUrl = `${process.env.EVENT_SERVICE_API}/events/correlation`;

      const eventResponse = await axios.get(eventUrl, {
        params: { 
          serviceName: serviceName, 
          startTime: tenMinutesAgo,
          severity: ['ERROR', 'WARNING'], 
          limit: 50 
        }
      });

      const logs = eventResponse.data;

      if (!logs || logs.length === 0) {
        return "Correlation: No Error or Warning events are recorded in the critical time window (10min).";
      }

      // 2. Slanje LLM-u
      const analysisUrl = `${process.env.ANALYSIS_ENGINE_SERVICE_API}/analyze`;
      const llmResponse = await axios.post(analysisUrl, {
        service: serviceName,
        logs: logs, 
        // context: `Servis ${serviceName} je pao. Analiziraj priloženih ${logs.length} logova i daj mi kratku dijagnozu uzroka na srpskom jeziku (maksimalno 2 rečenice). Fokusiraj se na bezbednosne pretnje ili kritične sistemske greške.`
      });

      return `AI analyze: ${llmResponse.data.summary}`;

    } catch (e) {
      return "Correlation: Deep analysis failed due to communication errors with service.";
    }
  }
}