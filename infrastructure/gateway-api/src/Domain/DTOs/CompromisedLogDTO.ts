import { EventDTO } from "./EventDTO";

export interface CompromisedLogDTO {
    event: EventDTO | any; 
    storedHash: string;
    calculatedHash: string;
    isMissing: boolean;
    detectedAt: Date;
}