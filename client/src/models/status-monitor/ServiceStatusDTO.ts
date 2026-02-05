import { ServiceCheckDTO } from "./ServiceCheckDTO";

export interface ServiceStatusDTO {
    serviceName: string;
    pingUrl: string;
    isDown: boolean;       // True ako je pao
    incidentId: number | null;
    lastCheck: ServiceCheckDTO | null; 
}