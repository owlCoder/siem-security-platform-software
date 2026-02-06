import { IEventFetcherService, Event } from "../Domain/services/IEventFetcherService";
import { IInsiderThreatService } from "../Domain/services/IInsiderThreatService";
import { IUserRiskAnalysisService } from "../Domain/services/IUserRiskAnalysisService";
import { IThreatDetectionService } from "../Domain/services/IThreatDetectionService";
import { ILoggerService } from "../Domain/services/ILoggerService";

export class ThreatAnalysisJob {
  private lastProcessedEventId: number = 0;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private readonly intervalMinutes: number;

  constructor(
    private readonly eventFetcher: IEventFetcherService,
    private readonly threatService: IInsiderThreatService,
    private readonly riskService: IUserRiskAnalysisService,
    private readonly detectionService: IThreatDetectionService,
    private readonly logger: ILoggerService,
    intervalMinutes: number = 15
  ) {
    this.intervalMinutes = intervalMinutes;
  }

  start(): void {
    this.run();
    this.intervalId = setInterval(() => this.run(), this.intervalMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private async run(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      const maxEventId = await this.eventFetcher.getMaxEventId();
      
      if (maxEventId <= this.lastProcessedEventId) {
        return;
      }

      const newEvents = await this.eventFetcher.getEventsInRange(
        this.lastProcessedEventId + 1,
        maxEventId
      );

      const eventsByUser = this.groupEventsByPrivilegedUsers(newEvents);

      for (const [userIdStr, events] of Object.entries(eventsByUser)) {
        const userId = parseInt(userIdStr, 10);
        await this.analyzeUserEvents(userId, events);
      }

      this.lastProcessedEventId = maxEventId;

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`[ThreatAnalysisJob] ERROR: ${message}`);
      if (error instanceof Error && error.stack) {
        this.logger.log(error.stack);
      }
    } finally {
      this.isRunning = false;
    }
  }

  private groupEventsByPrivilegedUsers(events: Event[]): Record<string, Event[]> {
    const grouped: Record<string, Event[]> = {};
    const validEvents = events.filter((e): e is Event & { userId: number; userRole: string } =>
      e.userId != null && e.userRole != null
    );

    for (const event of validEvents) {
      if (!this.isPrivilegedRole(event.userRole)) {
        continue;
      }

      const userId = String(event.userId);

      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      
      grouped[userId].push(event);
    }

    return grouped;
  }

  private isPrivilegedRole(userRole: string): boolean {
    const role = userRole.toUpperCase(); 
    return role === "ADMIN" || role === "SYSADMIN";
  }

  private async analyzeUserEvents(userId: number, events: Event[]): Promise<number> {
    try {
      const userRole = events[0]?.userRole ?? "UNKNOWN";
      const eventIds = events.map(e => e.id);

      this.logger.log(`\n   🔎 Analyzing ${eventIds.length} events for userId=${userId} (${userRole})`);

      let threatsDetected = 0;

      threatsDetected += await this.detectMassDataRead(userId, eventIds);
      threatsDetected += await this.detectOffHoursAccess(userId, eventIds);
      threatsDetected += await this.detectPermissionChanges(userId, eventIds);
      threatsDetected += await this.detectAuthCorrelations(userId, eventIds);

      if (threatsDetected > 0) {
        this.logger.log(`     Detected ${threatsDetected} threat(s) for userId=${userId}`);
      }

      return threatsDetected;

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`    Error analyzing events for userId=${userId}: ${message}`);
      return 0;
    }
  }

  private async detectMassDataRead(userId: number, eventIds: number[]): Promise<number> {
    const result = await this.detectionService.detectMassDataRead(userId, eventIds);
    
    if (result && result.isDetected) {
      const threat = await this.threatService.createThreat({
        userId,
        threatType: result.threatType,
        riskLevel: result.riskLevel,
        description: result.description,
        metadata: result.metadata || {},
        correlatedEventIds: result.correlatedEventIds,
        source: "ThreatAnalysisJob",
      });

      await this.riskService.updateUserRiskAfterThreat(userId, threat.id);
      return 1;
    }
    
    return 0;
  }

  private async detectOffHoursAccess(userId: number, eventIds: number[]): Promise<number> {
    const result = await this.detectionService.detectOffHoursAccess(userId, eventIds);
    
    if (result && result.isDetected) {
      const threat = await this.threatService.createThreat({
        userId,
        threatType: result.threatType,
        riskLevel: result.riskLevel,
        description: result.description,
        metadata: result.metadata || {},
        correlatedEventIds: result.correlatedEventIds,
        source: "ThreatAnalysisJob",
      });

      await this.riskService.updateUserRiskAfterThreat(userId, threat.id);
      return 1;
    }
    
    return 0;
  }

  private async detectPermissionChanges(userId: number, eventIds: number[]): Promise<number> {
    const result = await this.detectionService.detectPermissionChange(userId, eventIds);
    
    if (result && result.isDetected) {
      const threat = await this.threatService.createThreat({
        userId,
        threatType: result.threatType,
        riskLevel: result.riskLevel,
        description: result.description,
        metadata: result.metadata || {},
        correlatedEventIds: result.correlatedEventIds,
        source: "ThreatAnalysisJob",
      });

      await this.riskService.updateUserRiskAfterThreat(userId, threat.id);
      return 1;
    }
    
    return 0;
  }

  private async detectAuthCorrelations(userId: number, eventIds: number[]): Promise<number> {
    const results = await this.detectionService.correlateWithAuthEvents(userId, eventIds);
    
    let detected = 0;
    for (const result of results) {
      if (result.isDetected) {
        const threat = await this.threatService.createThreat({
          userId,
          threatType: result.threatType,
          riskLevel: result.riskLevel,
          description: result.description,
          metadata: result.metadata || {},
          correlatedEventIds: result.correlatedEventIds,
          source: "ThreatAnalysisJob",
        });

        await this.riskService.updateUserRiskAfterThreat(userId, threat.id);
        
        this.logger.log(`       THREAT #${threat.id}: ${result.threatType} (${result.riskLevel})`);
        detected++;
      }
    }
    
    return detected;
  }
}
