import { ServiceCheck } from "../models/ServiceCheck";
import { ServiceThreshold } from "../models/ServiceThreshold";

export interface IIncidentService {
  evaluate(serviceName: string, lastCheck: ServiceCheck, threshold: ServiceThreshold): Promise<void>;
}

