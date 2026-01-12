import { IGatewayService } from "../../Domain/services/IGatewayService";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { AuthResponseType } from "../../Domain/types/AuthResponse";
import { AlertDTO } from "../../Domain/DTOs/AlertDTO";
import { AlertQueryDTO } from "../../Domain/DTOs/AlertQueryDTO";
import { PaginatedAlertsDTO } from "../../Domain/DTOs/PaginatedAlertsDTO";
import { ArchiveStatsDTO } from "../../Domain/DTOs/ArchiveStatsDTO";
import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { TopArchiveDTO } from "../../Domain/DTOs/TopArchiveDTO";
import { ParserEventDto } from "../../Domain/DTOs/ParserEventDTO";
import { ArchiveVolumeDTO } from "../../Domain/DTOs/ArchiveVolumeDTO";
import { NormalizedEventDTO } from "../../Domain/DTOs/NormalizedEventDTO";
import { LargestArchiveDTO } from "../../Domain/DTOs/LargestArchiveDTO";
import { DistributionDTO } from "../../Domain/DTOs/DistributionDTO";
import { TopSourceDTO } from "../../Domain/DTOs/TopSourceDTO";
import { StorageLogResponseDTO } from "../../Domain/DTOs/StorageLogResponseDTO";
import { EventsResultDTO } from "../../Domain/DTOs/EventsResultDTO";
import { OTPVerificationDTO } from "../../Domain/DTOs/OtpVerificationDTO";
import { AuthJwtResponse } from "../../Domain/types/AuthJwtResponse";
import { IAuthGatewayService } from "../../Domain/services/IAuthGatewayService";
import { IUserGatewayService } from "../../Domain/services/IUserGatewayService";
import { IAlertGatewayService } from "../../Domain/services/IAlertGatewayService";
import { IQueryGatewayService } from "../../Domain/services/IQueryGatewayService";
import { IStorageGatewayService } from "../../Domain/services/IStorageGatewayService";
import { IParserGatewayService } from "../../Domain/services/IParserGatewayService";
import { IAnalysisGatewayService } from "../../Domain/services/IAnalysisGatewayService";
import { IEventCollectorGatewayService } from "../../Domain/services/IEventCollectorGatewayService";
import { OTPResendDTO } from "../../Domain/DTOs/OTPResendDTO";
import { HourlyStatisticsDTO } from "../../Domain/DTOs/HourlyStatisticsDTO";

/**
 * Facade that delegates to domain-specific gateway services.
 * Now uses Dependency Injection for better testability and SOLID compliance.
 */
export class GatewayService implements IGatewayService {
  constructor(
    private readonly authService: IAuthGatewayService,
    private readonly alertService: IAlertGatewayService,
    private readonly queryService: IQueryGatewayService,
    private readonly storageService: IStorageGatewayService,
    private readonly parserService: IParserGatewayService,
    private readonly analysisService: IAnalysisGatewayService,
    private readonly eventService: IEventCollectorGatewayService
  ) { }

  // Event Collector
  async createEvent(event: EventDTO): Promise<EventDTO> {
    return await this.eventService.createEvent(event);
  }

  async getAll(): Promise<EventDTO[]> {
    return await this.eventService.getAllEvents();
  }

  async getById(id: number): Promise<EventDTO> {
    return await this.eventService.getEventById(id);
  }

  async deleteOldEvents(expiredIds: number[]): Promise<boolean> {
    return await this.eventService.deleteOldEvents(expiredIds);
  }
  async getEventsFromId1ToId2(fromId: number, toId: number): Promise<EventDTO[]> {
    return await this.eventService.getEventsFromId1ToId2(fromId, toId);
  }

  async getSortedEventsByDate(): Promise<EventDTO[]> {
    return await this.eventService.getSortedEventsByDate();
  }

  async getEventPercentagesByEvent(): Promise<DistributionDTO> {
    return await this.eventService.getEventPercentagesByEvent();
  }

  async getTopSourceEvent(): Promise<TopSourceDTO> {
    return await this.eventService.getTopSourceEvent();
  }

  // Parser
  async log(eventMessage: string, eventSource: string): Promise<EventDTO> {
    return this.parserService.log(eventMessage, eventSource);
  }

  async getAllParserEvents(): Promise<ParserEventDto[]> {
    return this.parserService.getAllParserEvents();
  }

  async getParserEventById(id: number): Promise<ParserEventDto> {
    return this.parserService.getParserEventById(id);
  }

  async deleteById(id: number): Promise<boolean> {
    return this.parserService.deleteById(id);
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    return this.authService.login(data);
  }

  async verifyOtp(data: OTPVerificationDTO): Promise<AuthJwtResponse> {
    return this.authService.verifyOtp(data);
  }

  async resendOtp(data: OTPResendDTO): Promise<AuthResponseType> {
    return this.authService.resendOtp(data);
  }

  async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
    isSysAdmin?: boolean;
    error?: string;
  }> {
    return this.authService.validateToken(token);
  }

  // Alert Service
  async getAllAlerts(): Promise<AlertDTO[]> {
    return this.alertService.getAllAlerts();
  }

  async getAlertById(id: number): Promise<AlertDTO> {
    return this.alertService.getAlertById(id);
  }

  async searchAlerts(query: AlertQueryDTO): Promise<PaginatedAlertsDTO> {
    return this.alertService.searchAlerts(query);
  }

  async resolveAlert(id: number, resolvedBy: string, status: string): Promise<AlertDTO> {
    return this.alertService.resolveAlert(id, resolvedBy, status);
  }

  async updateAlertStatus(id: number, status: string): Promise<AlertDTO> {
    return this.alertService.updateAlertStatus(id, status);
  }

  // Query Service
  async searchEvents(query: string, targetPage: number, limit: number): Promise<EventsResultDTO> {
    return this.queryService.searchEvents(query, targetPage, limit);
  }

  async getOldEvents(hours: number): Promise<EventDTO[]> {
    return this.queryService.getOldEvents(hours);
  }

  async getLastThreeEvents(): Promise<EventDTO[]> {
    return this.queryService.getLastThreeEvents();
  }

  async getAllEvents(): Promise<EventDTO[]> {
    return this.queryService.getAllEvents();
  }

  async getEventsCount(): Promise<number> {
    return this.queryService.getEventsCount();
  }

  async getInfoCount(): Promise<number> {
    return this.queryService.getInfoCount();
  }

  async getWarningCount(): Promise<number> {
    return this.queryService.getWarningCount();
  }

  async getErrorCount(): Promise<number> {
    return this.queryService.getErrorCount();
  }

  async getEventDistribution(): Promise<DistributionDTO> {
    return this.queryService.getEventDistribution();
  }

  async getEventStatistics(): Promise<HourlyStatisticsDTO[]> {
    return this.queryService.getEventStatistics();
  }

  async getAlertStatistics(): Promise<HourlyStatisticsDTO[]> {
    return this.queryService.getAlertStatistics();
  }
  // Storage
  async getAllArchives(): Promise<StorageLogResponseDTO[]> {
    return this.storageService.getAllArchives();
  }

  async runArchiveProcess(): Promise<StorageLogResponseDTO> {
    return this.storageService.runArchiveProcess();
  }

  async getArchiveStats(): Promise<ArchiveStatsDTO> {
    return this.storageService.getArchiveStats();
  }

  async downloadArchive(id: string): Promise<ArrayBuffer> {
    return this.storageService.downloadArchive(id);
  }

  async getTopArchives(type: "events" | "alerts", limit: number): Promise<TopArchiveDTO[]> {
    return this.storageService.getTopArchives(type, limit);
  }

  async getArchiveVolume(period: "daily" | "monthly" | "yearly"): Promise<ArchiveVolumeDTO[]> {
    return this.storageService.getArchiveVolume(period);
  }

  async getLargestArchive(): Promise<LargestArchiveDTO | null> {
    return this.storageService.getLargestArchive();
  }

  // Analysis Engine
  async analysisEngineNormalize(rawMessage: string): Promise<NormalizedEventDTO> {
    return this.analysisService.normalize(rawMessage);
  }

  async analysisEngineDeleteCorrelationsByEventIds(eventIds: number[]): Promise<number> {
    return this.analysisService.deleteCorrelationsByEventIds(eventIds);
  }
}