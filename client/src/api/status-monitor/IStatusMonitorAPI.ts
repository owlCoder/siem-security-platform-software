import { ServiceStatusDTO } from "../../models/status-monitor/ServiceStatusDTO";
import { IncidentDTO } from "../../models/status-monitor/IncidentDTO";
import { ServiceStatsDTO } from "../../models/status-monitor/ServiceStatsDTO";

export interface IStatusMonitorAPI {
    getOverallStatus(token: string): Promise<ServiceStatusDTO[]>;
    getAllIncidents(token: string): Promise<IncidentDTO[]>;
    getServiceStats(serviceName: string, hours: number, token: string): Promise<ServiceStatsDTO>;
}
