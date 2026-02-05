import { ServiceStatusDTO } from "../../../models/status-monitor/ServiceStatusDTO";

export interface UptimeBarProps {
    serviceData: ServiceStatusDTO; 
    onClick?: () => void;
}