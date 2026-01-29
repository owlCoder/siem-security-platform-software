import { IMonitoringOrchestrator } from "../Domain/services/IMonitoringOrchestrator";
import { IMonitoringService } from "../Domain/services/IMonitoringService";
import { IIncidentService } from "../Domain/services/IIncidentService";
import { ServiceThreshold } from "../Domain/models/ServiceThreshold";
import { Repository } from "typeorm";

export class MonitoringOrchestrator implements IMonitoringOrchestrator {
    constructor(
        private monitoringService: IMonitoringService,
        private incidentService: IIncidentService,
        private thresholdRepo: Repository<ServiceThreshold>
    ) {}

    async run(): Promise<void> {
        try {
            console.log("Započinjem ciklus monitoringa...");
            
            await this.monitoringService.runChecks();
            const thresholds = await this.thresholdRepo.find();

            // 3. Evaluiraj incidente za svaki servis paralelno
            await Promise.all(
                thresholds.map(t => this.incidentService.evaluate(t.serviceName))
            );
            
            console.log("Ciklus monitoringa uspešno završen.");
        } catch (error) {
            console.error("Greška u MonitoringOrchestratoru:", error);
        }
    }
}