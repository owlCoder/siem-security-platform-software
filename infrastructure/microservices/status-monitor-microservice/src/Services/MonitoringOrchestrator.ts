import { IMonitoringOrchestrator } from "../Domain/services/IMonitoringOrchestrator";
import { IMonitoringService } from "../Domain/services/IMonitoringService";
import { IIncidentService } from "../Domain/services/IIncidentService";
import { ServiceThreshold } from "../Domain/models/ServiceThreshold";
import { ServiceCheck } from "../Domain/models/ServiceCheck"; 
import { Repository } from "typeorm";

export class MonitoringOrchestrator implements IMonitoringOrchestrator {
    constructor(
        private monitoringService: IMonitoringService,
        private incidentService: IIncidentService,
        private thresholdRepo: Repository<ServiceThreshold>
    ) {}

    async run(): Promise<void> {
        try {
            console.log("🎼 Orchestrator: Započinjem ciklus...");

            // 1. Učitamo sva pravila iz baze
            const thresholds = await this.thresholdRepo.find();

            // 2. Prolazimo kroz svaki servis i pitamo "Da li je vreme?"
            for (const threshold of thresholds) {
                
                const shouldCheck = await this.isTimeToCheck(threshold);

                if (!shouldCheck) {
                    // Nije prošlo dovoljno vremena, preskačemo tiho
                    continue; 
                }

                console.log(`⏱️ Vreme je za proveru: ${threshold.serviceName} (Interval: ${threshold.checkIntervalSec || 30}s)`);

                // 3. Izvršavamo proveru samo za taj servis
                // OVO JE DEO KOJI JE FALIO: Dobijamo 'checkResult'
                const checkResult = await this.monitoringService.checkService(threshold);

                // 4. Proveravamo da li treba otvoriti incident
                // SADA IMAMO SVA 3 ARGUMENTA KOJA TVOJ INTERFEJS TRAŽI
                await this.incidentService.evaluate(threshold.serviceName, checkResult, threshold);
            }
            
            console.log("✅ Orchestrator: Ciklus završen.");

        } catch (error) {
            console.error("❌ Greška u MonitoringOrchestratoru:", error);
        }
    }

    private async isTimeToCheck(threshold: ServiceThreshold): Promise<boolean> {
        // Hvatamo repo za ServiceCheck "u letu" preko managera
        const lastCheck = await this.thresholdRepo.manager
            .getRepository(ServiceCheck)
            .findOne({
                where: { serviceName: threshold.serviceName },
                order: { checkedAt: "DESC" }
            });

        // Ako nikad nije proveren, mora odmah
        if (!lastCheck) return true;

        const now = new Date().getTime();
        const lastTime = new Date(lastCheck.checkedAt).getTime();
        
        // Uzimamo interval iz baze (ako je null, default je 30s)
        const intervalMs = (threshold.checkIntervalSec || 30) * 1000;

        return (now - lastTime) >= intervalMs;
    }
}