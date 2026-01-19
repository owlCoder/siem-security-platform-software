import { Between, Repository } from "typeorm";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { IQueryStatisticsService } from "../Domain/services/IQueryStatisticsService";
import { RiskEntityType } from "../Domain/enums/RiskEntityType";
import { Alert } from "../Domain/models/Alert";
import { Event } from "../Domain/models/Event";
import { EventType } from "../Domain/enums/EventType";
import { AlertSeverity } from "../Domain/enums/AlertSeverity";

export class QueryStatisticsService implements IQueryStatisticsService {
    constructor(private readonly loggerService: ILoggerService, 
                private readonly eventRepository: Repository<Event>,
                private readonly alertRepository: Repository<Alert>) {}

    async getTotalEventCount(entityType: RiskEntityType, entityId: string): Promise<number> {
        if (entityType === RiskEntityType.SERVICE) {
            return this.eventRepository.count({
                where: {
                    source: entityId
                }
            });
        }

        if (entityType === RiskEntityType.IP_ADDRESS) {
            return this.eventRepository.count({
                where: {
                    ipAddress: entityId
                }
            });
        }

        return 0;
    }

    async getErrorEventCount(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<number> {
        const where: any = {
            type: EventType.ERROR
        };

        if (entityType === RiskEntityType.SERVICE) {
            where.source = entityId;
        } else {
            where.ipAddress = entityId;
        }

        if (durationMinutes) {
            const now = new Date();
            const past = new Date(now.getTime() - durationMinutes * 60000);
            where.timestamp = Between(past, now);
        }

        return this.eventRepository.count({ where });
    }

    async getEventRate(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<number> {
        const now = new Date();
        const pastTime = new Date(now.getTime() - durationMinutes * 60000);

        let count: number = 0;
        if (entityType === RiskEntityType.SERVICE) {
            count = await this.eventRepository.count({
                where: {
                    source: entityId,
                    timestamp: Between(pastTime, now)
                }
            });
        } else if (entityType === RiskEntityType.IP_ADDRESS) {
            count = await this.eventRepository.count({
                where: {
                    ipAddress: entityId,
                    timestamp: Between(pastTime, now)
                }
            });
        }

        return count / durationMinutes;
    }

    async getAlertsCountBySeverity(entityType: RiskEntityType, entityId: string): Promise<Map<string, number>> {
        const qb = this.alertRepository
            .createQueryBuilder("alert")
            .select("alert.severity", "severity")
            .addSelect("COUNT(alert.id)", "count");

        if (entityType === RiskEntityType.SERVICE) {
            qb.where("alert.source = :entityId", { entityId });
        } else {
            qb.where("alert.ipAddress = :entityId", { entityId });
        }

        qb.groupBy("alert.severity");

        const raw = await qb.getRawMany();

        const result = new Map<string, number>();
        for (const row of raw) {
            result.set(row.severity, Number(row.count));
        }

        return result;
    }
    
    async getCriticalAlertsCount(entityType: RiskEntityType, entityId: string): Promise<number> {
        const severityMap = await this.getAlertsCountBySeverity(entityType, entityId);
        return severityMap.get(AlertSeverity.CRITICAL) ?? 0;
    }
    
    async getAnomalyRate(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<number> {
        const now = new Date();

        // poredimo aktivnost u poslednjih durationMinutes sa aktivnoscu u prethodnih 60 minuta
        const recentStart = new Date(now.getTime() - durationMinutes * 60000);
        const baselineStart = new Date(now.getTime() - 60 * 60000);

        const recentWhere: any = {
            timestamp: Between(recentStart, now)
        };

        const baselineWhere: any = {
            timestamp: Between(baselineStart, recentStart)
        };

        if (entityType === RiskEntityType.SERVICE) {
            recentWhere.source = entityId;
            baselineWhere.source = entityId;
        } else {
            recentWhere.ipAddress = entityId;
            baselineWhere.ipAddress = entityId;
        }

        const recentCount = await this.eventRepository.count({ where: recentWhere });
        const baselineCount = await this.eventRepository.count({ where: baselineWhere });

        const baselineRate = baselineCount / 60; // dogadjaji po minutu pre
        const recentRate = recentCount / durationMinutes; // dogadjaji po minutu sad

        if (baselineRate === 0) return recentRate > 0 ? 5 : 1;

        return recentRate / baselineRate;
    }
    
    async getBurstAnomaly(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<boolean> {
        const now = new Date();
        const start = new Date(now.getTime() - durationMinutes * 60000);

        const where: any = {
            timestamp: Between(start, now)
        };

        if (entityType === RiskEntityType.SERVICE) {
            where.source = entityId;
        } else {
            where.ipAddress = entityId;
        }

        const count = await this.eventRepository.count({ where });

        const threshold = 50 * durationMinutes; // gornja granica dogadjaja za burst anomaliju
        return count >= threshold;
    }
    
    async getUniqueServicesCount(ipAddress: string): Promise<number> {
        const raw = await this.eventRepository
            .createQueryBuilder("event")
            .select("COUNT(DISTINCT event.source)", "count")
            .where("event.ipAddress = :ipAddress", { ipAddress })
            .getRawOne();

        return Number(raw.count);
    }
    
    async getUniqueIpsCount(serviceName: string): Promise<number> {
        const raw = await this.eventRepository
            .createQueryBuilder("event")
            .select("COUNT(DISTINCT event.ipAddress)", "count")
            .where("event.source = :serviceName", { serviceName })
            .andWhere("event.ipAddress IS NOT NULL")
            .getRawOne();

        return Number(raw.count);
    }
}