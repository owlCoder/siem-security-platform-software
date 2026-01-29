export interface IMonitoringOrchestrator {
    run(): Promise<void>;
}