import { ServiceCheck } from "../models/ServiceCheck";
import { ServiceThreshold } from "../models/ServiceThreshold";

export interface IMonitoringService {
  checkService(threshold: ServiceThreshold): Promise<ServiceCheck>;    
  runChecks(): Promise<void>;
}