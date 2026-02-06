import { QueryEventDTO } from "./QueryEventDTO";

export type ScanIncidentDto = {
    service: string;
    logs: QueryEventDTO[];
}