import { IGatewayService } from "../../Domain/services/IGatewayService";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../../Domain/types/AuthResponse";
import { UserDTO } from "../../Domain/DTOs/UserDTO";
import { AlertDTO } from "../../Domain/DTOs/AlertDTO";
import { AlertQueryDTO } from "../../Domain/DTOs/AlertQueryDTO";
import { PaginatedAlertsDTO } from "../../Domain/DTOs/PaginatedAlertsDTO";
import { ArchiveDTO } from "../../Domain/DTOs/ArchiveDTO";
import { ArchiveStatsDTO } from "../../Domain/DTOs/ArchiveStatsDTO";
import { EventDTO } from "../../Domain/DTOs/EventDTO";
import { TopArchiveDTO } from "../../Domain/DTOs/TopArchiveDTO";
import { ParserEventDto } from "../../Domain/DTOs/ParserEventDTO";
import { ArchiveVolumeDTO } from "../../Domain/DTOs/ArchiveVolumeDTO";
import { NormalizedEventDTO } from "../../Domain/DTOs/NormalizedEventDTO";
import { AuthGatewayService } from "../domains/AuthGatewayService";
import { UserGatewayService } from "../domains/UserGatewayService";
import { AlertGatewayService } from "../domains/AlertGatewayService";
import { QueryGatewayService } from "../domains/QueryGatewayService";
import { StorageGatewayService } from "../domains/StorageGatewayService";
import { ParserGatewayService } from "../domains/ParserGatewayService";
import { AnalysisGatewayService } from "../domains/AnalysisGatewayService";
import { serviceConfig } from "../../Infrastructure/config/ServiceConfig";
import { LargestArchiveDTO } from "../../Domain/DTOs/LargestArchiveDTO";
import { DistributionDTO } from "../../Domain/DTOs/DistributionDTO";
import { TopSourceDTO } from "../../Domain/DTOs/TopSourceDTO";
import { EventCollectorGatewayService } from "../domains/EventCollectorGatewayService";

/**
 * Facade that delegates to domain-specific gateway services.
 * Keeps controller interface stable while honoring SRP in implementation.
 */
export class GatewayService implements IGatewayService {
  private readonly authService: AuthGatewayService;
  private readonly userService: UserGatewayService;
  private readonly alertService: AlertGatewayService;
  private readonly queryService: QueryGatewayService;
  private readonly storageService: StorageGatewayService;
  private readonly parserService: ParserGatewayService;
  private readonly analysisService: AnalysisGatewayService;
  private readonly eventService: EventCollectorGatewayService;
  constructor() {
    this.authService = new AuthGatewayService();
    this.userService = new UserGatewayService();
    this.alertService = new AlertGatewayService();
    this.queryService = new QueryGatewayService();
    this.storageService = new StorageGatewayService();
    this.parserService = new ParserGatewayService();
    this.analysisService = new AnalysisGatewayService();
    this.eventService=new EventCollectorGatewayService();
  }
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
  /*async getMaxId(): Promise<EventDTO> {
    return await this.eventService.get(id); //dodati funkciju u event gateway service i event microservice
  }*/
 async getEventsFromId1ToId2(fromId: number, toId: number): Promise<EventDTO[]> {
    return await this.eventService.getEventsFromId1ToId2(fromId,toId);
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

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    return this.authService.register(data);
  }

  async validateToken(token: string): Promise<{
    valid: boolean;
    payload?: any;
    isSysAdmin?: boolean;
    error?: string;
  }> {
    return this.authService.validateToken(token);
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    return this.userService.getAllUsers();
  }

  async getUserById(id: number): Promise<UserDTO> {
    return this.userService.getUserById(id);
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
  async searchEvents(query: string): Promise<EventDTO[]> {
    return this.queryService.searchEvents(query);
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

  // Storage
  async getAllArchives(): Promise<ArchiveDTO[]> {
    return this.storageService.getAllArchives();
  }

  async searchArchives(query: string): Promise<ArchiveDTO[]> {
    return this.storageService.searchArchives(query);
  }

  async sortArchives(by: "date" | "size" | "name", order: "asc" | "desc"): Promise<ArchiveDTO[]> {
    return this.storageService.sortArchives(by, order);
  }

  async runArchiveProcess(): Promise<ArchiveDTO> {
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
