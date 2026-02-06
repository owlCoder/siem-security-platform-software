export interface ServiceHistoryDay {
    date: string;
    hasIncident: boolean;
    incidentCount: number;
}

export interface ServiceStatusDTO {
    serviceName: string;
    pingUrl: string;
    isDown: boolean;
    incidentId: number | null;
    lastCheck: any; 
    history: ServiceHistoryDay[]; 
}