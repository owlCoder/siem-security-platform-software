import axios from "axios";
import { IInsiderThreatService } from "../Domain/services/IInsiderThreatService";
import { IUserRiskAnalysisService } from "../Domain/services/IUserRiskAnalysisService";
import { IThreatDetectionService } from "../Domain/services/IThreatDetectionService";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { UserCacheService } from "../Services/UserCacheService";

export class ThreatAnalysisJob {
  private lastProcessedEventId: number = 0;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private readonly intervalMinutes: number;

  constructor(
    private readonly eventCollectorUrl: string,
    private readonly threatService: IInsiderThreatService,
    private readonly riskService: IUserRiskAnalysisService,
    private readonly detectionService: IThreatDetectionService,
    private readonly userCacheService: UserCacheService,
    private readonly logger: ILoggerService,
    intervalMinutes: number = 15
  ) {
    this.intervalMinutes = intervalMinutes;
  }

  start(): void {
    this.logger.log(`Starting Threat Analysis Job - runs every ${this.intervalMinutes} minutes`);
    this.run();
    this.intervalId = setInterval(() => this.run(), this.intervalMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.log("Threat Analysis Job stopped");
    }
  }

  private async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.log("[ThreatAnalysisJob] Previous analysis still running, skipping");
      return;
    }

    this.isRunning = true;
    this.logger.log(`[ThreatAnalysisJob] Starting analysis - last processed ID: ${this.lastProcessedEventId}`);

    try {
      const maxEventId = await this.getMaxEventId();
      
      if (maxEventId <= this.lastProcessedEventId) {
        this.logger.log("[ThreatAnalysisJob] No new events to process");
        return;
      }

      const newEvents = await this.getEventsInRange(
        this.lastProcessedEventId + 1,
        maxEventId
      );

      this.logger.log(`[ThreatAnalysisJob] Analyzing ${newEvents.length} new events (ID ${this.lastProcessedEventId + 1} to ${maxEventId})`);

      const eventsByUser = await this.groupEventsByPrivilegedUsers(newEvents);

      this.logger.log(`[ThreatAnalysisJob] Found events for ${Object.keys(eventsByUser).length} privileged users`);

      for (const [userId, events] of Object.entries(eventsByUser)) {
        await this.analyzeUserEvents(userId, events);
      }

      this.lastProcessedEventId = maxEventId;
      this.logger.log(`[ThreatAnalysisJob] Analysis completed - processed up to event ID: ${maxEventId}`);

    } catch (error: any) {
      this.logger.log(`[ThreatAnalysisJob] ERROR: ${error.message}`);
      this.logger.log(`[ThreatAnalysisJob] ERROR Stack: ${error.stack || 'No stack trace'}`);
      if (error.response) {
        this.logger.log(`[ThreatAnalysisJob] ERROR Response status: ${error.response.status}`);
        this.logger.log(`[ThreatAnalysisJob] ERROR Response data: ${JSON.stringify(error.response.data)}`);
      }
      if (error.code) {
        this.logger.log(`[ThreatAnalysisJob] ERROR Code: ${error.code}`);
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async getMaxEventId(): Promise<number> {
    try {
      this.logger.log(`[ThreatAnalysisJob] Fetching events from: ${this.eventCollectorUrl}/events`);
      
      const response = await axios.get(`${this.eventCollectorUrl}/events`, {
        timeout: 10000
      });
      
      this.logger.log(`[ThreatAnalysisJob] Received response, status: ${response.status}`);
      
      const events = response.data;
      
      if (!Array.isArray(events)) {
        this.logger.log(`[ThreatAnalysisJob] ERROR: Response is not an array! Type: ${typeof events}`);
        return 0;
      }
      
      if (events.length === 0) {
        this.logger.log(`[ThreatAnalysisJob] No events returned`);
        return 0;
      }

      const maxId = Math.max(...events.map((e: any) => e.id));
      this.logger.log(`[ThreatAnalysisJob] Max event ID: ${maxId}`);
      
      return maxId;
    } catch (error: any) {
      this.logger.log(`[ThreatAnalysisJob] Failed to get max event ID!`);
      this.logger.log(`[ThreatAnalysisJob] Error message: ${error.message || 'No message'}`);
      this.logger.log(`[ThreatAnalysisJob] Error code: ${error.code || 'No code'}`);
      
      if (error.response) {
        this.logger.log(`[ThreatAnalysisJob] HTTP Status: ${error.response.status}`);
        this.logger.log(`[ThreatAnalysisJob] Response: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        this.logger.log(`[ThreatAnalysisJob] No response received! Request was made but no response.`);
        this.logger.log(`[ThreatAnalysisJob] Target URL: ${this.eventCollectorUrl}/events`);
      } else {
        this.logger.log(`[ThreatAnalysisJob] Error setting up request: ${error.message}`);
      }
      
      return this.lastProcessedEventId;
    }
  }

  private async getEventsInRange(fromId: number, toId: number): Promise<any[]> {
    try {
      this.logger.log(`[ThreatAnalysisJob] Fetching events from ${fromId} to ${toId}`);
      
      const response = await axios.get(
        `${this.eventCollectorUrl}/events/from/${fromId}/to/${toId}`,
        { timeout: 30000 }
      );
      
      this.logger.log(`[ThreatAnalysisJob] Received ${response.data.length} events`);
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      this.logger.log(`[ThreatAnalysisJob] Failed to get events: ${error.message}`);
      if (error.response) {
        this.logger.log(`[ThreatAnalysisJob] Status: ${error.response.status}`);
      }
      return [];
    }
  }

  private async groupEventsByPrivilegedUsers(events: any[]): Promise<Record<string, any[]>> {
    const grouped: Record<string, any[]> = {};

    this.logger.log(`[ThreatAnalysisJob] ========== ULTRA DEBUG START ==========`);
    this.logger.log(`[ThreatAnalysisJob] Grouping ${events.length} events by privileged users`);

    const eventsWithUserId = events.filter(e => e.userId);
    this.logger.log(`[ThreatAnalysisJob] Events with userId: ${eventsWithUserId.length} / ${events.length}`);
    
    if (eventsWithUserId.length > 0) {
      const firstEvent = eventsWithUserId[0];
      this.logger.log(`[ThreatAnalysisJob] First event:`);
      this.logger.log(`[ThreatAnalysisJob]   - ID: ${firstEvent.id}`);
      this.logger.log(`[ThreatAnalysisJob]   - userId: ${JSON.stringify(firstEvent.userId)}`);
      this.logger.log(`[ThreatAnalysisJob]   - userId type: ${typeof firstEvent.userId}`);
    }
    
    this.logger.log(`[ThreatAnalysisJob] Testing getUserByUserId('1')...`);
    try {
      const testUser = await this.userCacheService.getUserByUserId('1');
      if (testUser) {
        this.logger.log(`[ThreatAnalysisJob] ✓ getUserByUserId('1') SUCCESS!`);
        this.logger.log(`[ThreatAnalysisJob]   - user.id: ${testUser.id}`);
        this.logger.log(`[ThreatAnalysisJob]   - user.userId: ${JSON.stringify(testUser.userId)}`);
        this.logger.log(`[ThreatAnalysisJob]   - user.userId type: ${typeof testUser.userId}`);
        this.logger.log(`[ThreatAnalysisJob]   - user.username: ${testUser.username}`);
        this.logger.log(`[ThreatAnalysisJob]   - user.role: ${testUser.role}`);
      } else {
        this.logger.log(`[ThreatAnalysisJob] ✗ getUserByUserId('1') returned NULL!`);
      }
    } catch (error: any) {
      this.logger.log(`[ThreatAnalysisJob] ✗ getUserByUserId('1') ERROR: ${error.message}`);
    }
    
    this.logger.log(`[ThreatAnalysisJob] Testing getAllPrivilegedUsers()...`);
    try {
      const allPrivileged = await this.userCacheService.getAllPrivilegedUsers();
      this.logger.log(`[ThreatAnalysisJob] Total privileged users: ${allPrivileged.length}`);
      if (allPrivileged.length > 0) {
        allPrivileged.forEach((user, i) => {
          this.logger.log(`[ThreatAnalysisJob]   User ${i + 1}:`);
          this.logger.log(`[ThreatAnalysisJob]     - userId: ${JSON.stringify(user.userId)} (type: ${typeof user.userId})`);
          this.logger.log(`[ThreatAnalysisJob]     - username: ${user.username}`);
          this.logger.log(`[ThreatAnalysisJob]     - role: ${user.role}`);
        });
      } else {
        this.logger.log(`[ThreatAnalysisJob]   (No privileged users found in cache)`);
      }
    } catch (error: any) {
      this.logger.log(`[ThreatAnalysisJob] ✗ getAllPrivilegedUsers() ERROR: ${error.message}`);
    }
    
    this.logger.log(`[ThreatAnalysisJob] ========== ULTRA DEBUG END ==========`);

    for (const event of events) {
      const userId = event.userId;
      
      if (!userId) {
        continue;
      }

      const user = await this.userCacheService.getUserByUserId(userId);
      
      if (!user) {
        this.logger.log(`[ThreatAnalysisJob] User ${userId} not found in cache`);
        continue;
      }

      const isPrivileged = user.role === 0 || user.role === 1;
      
      if (!isPrivileged) {
        continue;
      }

      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      grouped[userId].push(event);
    }

    return grouped;
  }

  private async analyzeUserEvents(userId: string, events: any[]): Promise<void> {
    try {
      const userInfo = await this.userCacheService.getUserByUserId(userId);
      
      if (!userInfo) {
        this.logger.log(`[ThreatAnalysisJob] User ${userId} not found in cache`);
        return;
      }

      const eventIds = events.map(e => e.id);
      const username = userInfo.username;

      this.logger.log(`[ThreatAnalysisJob] Analyzing ${eventIds.length} events for user ${username} (ID: ${userId}, Role: ${userInfo.role})`);

      await this.detectMassDataRead(userId, username, eventIds);
      await this.detectOffHoursAccess(userId, username, eventIds);
      await this.detectPermissionChanges(userId, username, eventIds);
      await this.detectAuthCorrelations(userId, username, eventIds);

    } catch (error: any) {
      this.logger.log(`[ThreatAnalysisJob] Error analyzing events for user ${userId}: ${error.message}`);
    }
  }

  private async detectMassDataRead(
    userId: string,
    username: string,
    eventIds: number[]
  ): Promise<void> {
    const result = await this.detectionService.detectMassDataRead(userId, eventIds);
    
    if (result && result.isDetected) {
      const threat = await this.threatService.createThreat({
        userId,
        username,
        threatType: result.threatType,
        riskLevel: result.riskLevel,
        description: result.description,
        metadata: result.metadata || {},
        correlatedEventIds: result.correlatedEventIds,
        source: "ThreatAnalysisJob",
      });

      await this.riskService.updateUserRiskAfterThreat(userId, username, threat.id);
      this.logger.log(`[ThreatAnalysisJob] ✓ Created threat ${threat.id} for ${username}: ${result.threatType}`);
    }
  }

  private async detectOffHoursAccess(
    userId: string,
    username: string,
    eventIds: number[]
  ): Promise<void> {
    const result = await this.detectionService.detectOffHoursAccess(userId, eventIds);
    
    if (result && result.isDetected) {
      const threat = await this.threatService.createThreat({
        userId,
        username,
        threatType: result.threatType,
        riskLevel: result.riskLevel,
        description: result.description,
        metadata: result.metadata || {},
        correlatedEventIds: result.correlatedEventIds,
        source: "ThreatAnalysisJob",
      });

      await this.riskService.updateUserRiskAfterThreat(userId, username, threat.id);
      this.logger.log(`[ThreatAnalysisJob] ✓ Created threat ${threat.id} for ${username}: ${result.threatType}`);
    }
  }

  private async detectPermissionChanges(
    userId: string,
    username: string,
    eventIds: number[]
  ): Promise<void> {
    const result = await this.detectionService.detectPermissionChange(userId, eventIds);
    
    if (result && result.isDetected) {
      const threat = await this.threatService.createThreat({
        userId,
        username,
        threatType: result.threatType,
        riskLevel: result.riskLevel,
        description: result.description,
        metadata: result.metadata || {},
        correlatedEventIds: result.correlatedEventIds,
        source: "ThreatAnalysisJob",
      });

      await this.riskService.updateUserRiskAfterThreat(userId, username, threat.id);
      this.logger.log(`[ThreatAnalysisJob] ✓ Created threat ${threat.id} for ${username}: ${result.threatType}`);
    }
  }

  private async detectAuthCorrelations(
    userId: string,
    username: string,
    eventIds: number[]
  ): Promise<void> {
    const results = await this.detectionService.correlateWithAuthEvents(userId, eventIds);
    
    for (const result of results) {
      if (result.isDetected) {
        const threat = await this.threatService.createThreat({
          userId,
          username,
          threatType: result.threatType,
          riskLevel: result.riskLevel,
          description: result.description,
          metadata: result.metadata || {},
          correlatedEventIds: result.correlatedEventIds,
          source: "ThreatAnalysisJob",
        });

        await this.riskService.updateUserRiskAfterThreat(userId, username, threat.id);
        this.logger.log(`[ThreatAnalysisJob]  Created threat ${threat.id} for ${username}: ${result.threatType}`);
      }
    }
  }
}