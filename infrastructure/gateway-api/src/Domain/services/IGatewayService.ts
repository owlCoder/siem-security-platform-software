import { AlertDTO } from "../DTOs/AlertDTO";
import { AlertQueryDTO } from "../DTOs/AlertQueryDTO";
import { ArchiveStatsDTO } from "../DTOs/ArchiveStatsDTO";
import { ArchiveVolumeDTO } from "../DTOs/ArchiveVolumeDTO";
import { DistributionDTO } from "../DTOs/DistributionDTO";
import { EventDTO } from "../DTOs/EventDTO";
import { EventsResultDTO } from "../DTOs/EventsResultDTO";
import { HourlyStatisticsDTO } from "../DTOs/HourlyStatisticsDTO";
import { LargestArchiveDTO } from "../DTOs/LargestArchiveDTO";
import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { NormalizedEventDTO } from "../DTOs/NormalizedEventDTO";
import { OTPResendDTO } from "../DTOs/OTPResendDTO";
import { OTPVerificationDTO } from "../DTOs/OtpVerificationDTO";
import { PaginatedAlertsDTO } from "../DTOs/PaginatedAlertsDTO";
import { ParserEventDto } from "../DTOs/ParserEventDTO";
import { StorageLogResponseDTO } from "../DTOs/StorageLogResponseDTO";
import { TopArchiveDTO } from "../DTOs/TopArchiveDTO";
import { TopSourceDTO } from "../DTOs/TopSourceDTO";
import { AuthJwtResponse } from "../types/AuthJwtResponse";
import { AuthResponseType } from "../types/AuthResponse";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  verifyOtp(data: OTPVerificationDTO): Promise<AuthJwtResponse>;
  resendOtp(data: OTPResendDTO): Promise<AuthResponseType>;
  validateToken(
    token: string
  ): Promise<{
    valid: boolean;
    payload?: any;
    isSysAdmin?: boolean;
    error?: string;
  }>;

  // Alerts
  getAllAlerts(): Promise<AlertDTO[]>;
  getAlertById(id: number): Promise<AlertDTO>;
  searchAlerts(query: AlertQueryDTO): Promise<PaginatedAlertsDTO>;
  resolveAlert(
    id: number,
    resolvedBy: string,
    status: string
  ): Promise<AlertDTO>;
  updateAlertStatus(id: number, status: string): Promise<AlertDTO>;

  // Query
  searchEvents(query: string, targetPage: number, limit: number): Promise<EventsResultDTO>;
  getOldEvents(hours: number): Promise<EventDTO[]>;
  getLastThreeEvents(): Promise<EventDTO[]>;
  getAllEvents(): Promise<EventDTO[]>;
  getEventsCount(): Promise<number>;
  getInfoCount(): Promise<number>;
  getWarningCount(): Promise<number>;
  getErrorCount(): Promise<number>;
  getEventDistribution(): Promise<DistributionDTO>;
  getEventStatistics(): Promise<HourlyStatisticsDTO[]>;
  getAlertStatistics(): Promise<HourlyStatisticsDTO[]>;


  // Storage 
  getAllArchives(): Promise<StorageLogResponseDTO[]>;
  runArchiveProcess(): Promise<StorageLogResponseDTO>;
  getArchiveStats(): Promise<ArchiveStatsDTO>;
  downloadArchive(id: string): Promise<ArrayBuffer>;
  getTopArchives(type: "events" | "alerts", limit: number): Promise<TopArchiveDTO[]>;
  getArchiveVolume(period: "daily" | "monthly" | "yearly"): Promise<ArchiveVolumeDTO[]>;
  getLargestArchive(): Promise<LargestArchiveDTO | null>;

  //Parser
  getAllParserEvents(): Promise<ParserEventDto[]>;
  getParserEventById(id: number): Promise<ParserEventDto>;
  deleteById(id: number): Promise<boolean>;
  log(eventMessage: string, eventSource: string): Promise<EventDTO>;

  //Analysis Engine
  analysisEngineNormalize(rawMessage: string): Promise<NormalizedEventDTO>;
  analysisEngineDeleteCorrelationsByEventIds(eventIds: number[]): Promise<number>;

  //EventCollector
  createEvent(event: EventDTO): Promise<EventDTO>;
  getAll(): Promise<EventDTO[]>;
  getById(id: number): Promise<EventDTO>;
  deleteById(id: number): Promise<boolean>;
  deleteOldEvents(expiredIds: number[]): Promise<boolean>;
  //getMaxId():Promise<EventDTO>;
  getEventsFromId1ToId2(fromId: number, toId: number): Promise<EventDTO[]>
  getSortedEventsByDate(): Promise<EventDTO[]>
  getEventPercentagesByEvent(): Promise<DistributionDTO>
  getTopSourceEvent(): Promise<TopSourceDTO>
}
