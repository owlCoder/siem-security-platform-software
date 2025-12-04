import { CorrelationDTO } from "../types/CorrelationDTO";
export interface ICorrelationService{
    findCorrelations(): Promise<void>;
    sendCorrelationAlert(correlation: CorrelationDTO): Promise<void>;
    deleteCorrelationsByEventIds(eventIds: number[]): Promise<number>;
}