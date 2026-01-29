import { IMonitoringOrchestrator } from "../Domain/services/IMonitoringOrchestrator";

export class RecurringMonitoringJob {
    constructor(private orchestrator: IMonitoringOrchestrator) {}

    async run(): Promise<void> {
        await this.orchestrator.run();
    }
}
