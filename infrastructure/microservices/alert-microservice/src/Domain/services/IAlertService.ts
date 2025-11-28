import { AlertDTO, CreateAlertDTO, ResolveAlertDTO } from "../DTOs/AlertDTO";
import { AlertSeverity } from "../enums/AlertSeverity";
import { AlertStatus } from "../enums/AlertStatus";

export interface IAlertService {
  // Kreiranje alerta
  createAlert(data: CreateAlertDTO): Promise<AlertDTO>;
  
  // Pregled svih alerta
  getAllAlerts(): Promise<AlertDTO[]>;
  
  // Pregled jednog alerta
  getAlertById(id: number): Promise<AlertDTO>;
  
  // Pregled po severity-ju
  getAlertsBySeverity(severity: AlertSeverity): Promise<AlertDTO[]>;
  
  // Pregled po statusu
  getAlertsByStatus(status: AlertStatus): Promise<AlertDTO[]>;
  
  // Rješavanje alerta
  resolveAlert(id: number, data: ResolveAlertDTO): Promise<AlertDTO>;
  
  // Ažuriranje statusa
  updateAlertStatus(id: number, status: AlertStatus): Promise<AlertDTO>;
  
  // Brisanje alerta
  deleteAlert(id: number): Promise<boolean>;
  
  // Glavna funkcija - analiza događaja i kreiranje alerta ako ima prijetnju
  analyzeEventsForThreats(eventIds: number[]): Promise<AlertDTO | null>;
}