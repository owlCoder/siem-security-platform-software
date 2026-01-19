import { AxiosInstance } from "axios";
import { RiskEntityType } from "../Domain/enums/RiskEntityType";
import { IRiskScoreService } from "../Domain/services/IRiskScoreService";
import { createAxiosClient } from "../Utils/Helpers/AxiosClient";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { Between, MoreThanOrEqual, Repository } from "typeorm";
import { SecurityMetrics } from "../Domain/models/SecurityMetrics";


export class RiskScoreService implements IRiskScoreService {
    private readonly queryClient: AxiosInstance;

    constructor(
        private readonly logger?: ILoggerService,
        private readonly metricsRepo?: Repository<SecurityMetrics>
    )
    {
        this.queryClient = createAxiosClient(process.env.QUERY_SERVICE_API ?? "");
    }

    public async calculateScore(entityType: RiskEntityType, entityId: string, durationMinutes: number): Promise<number> {
        if (!this.metricsRepo) return 0;    

        try {
            const [
                totalEventResp,
                errorEventResp,
                eventRateResp,
                alertsResp,
                anomalyResp,
                burstResp,
                uniqueServicesResp,
                uniqueIpsResp
            ] = await Promise.all([
                this.queryClient.get<number>("/query/statistics/totalEventCount", { params: { entityType, entityId } }),
                this.queryClient.get<number>("/query/statistics/errorEventCount", { params: { entityType, entityId, durationMinutes } }),
                this.queryClient.get<number>("/query/statistics/eventRate", { params: { entityType, entityId, durationMinutes } }),
                this.queryClient.get<Record<string, number>>("/query/statistics/alertsCountBySeverity", { params: { entityType, entityId } }),
                this.queryClient.get<number>("/query/statistics/anomalyRate", { params: { entityType, entityId, durationMinutes } }),
                this.queryClient.get<boolean>("/query/statistics/burstAnomaly", { params: { entityType, entityId, durationMinutes } }),
                this.queryClient.get<number>("/query/statistics/uniqueServicesCount", { params: { entityType, entityId } }),
                this.queryClient.get<number>("/query/statistics/uniqueIpsCount", { params: { entityType, entityId } })
            ]);

            const totalEventCount = totalEventResp.data;
            const errorEventCount = errorEventResp.data;
            const eventRate = eventRateResp.data;
            const alertsBySeverity = alertsResp.data;
            const anomalyRate = anomalyResp.data;
            const burstAnomaly = burstResp.data;
            const uniqueServiceCount = uniqueServicesResp.data;
            const uniqueIpCount = uniqueIpsResp.data;

            // maksimalni score je 100
            let score = 0;

            score += Math.min(totalEventCount / 100, 20);             // ukupni broj dogadjaja -> najvise 20 poena
            score += Math.min(errorEventCount / 5, 20);              // greske -> najvise 20 poena
            score += Math.min(eventRate * 5, 15);                    // event rate -> najvise 15 poena
            score += (alertsBySeverity.CRITICAL || 0) * 15;          // kritični alerti -> 15 poena svaki
            score += Math.min(anomalyRate * 10, 20);                 // anomaly rate -> najvise 20 poena
            score += burstAnomaly ? 5 : 0;                           // burst anomaly -> 5 poena
            score += Math.min(uniqueServiceCount || 0, 3);           // unique services -> najvise 3 poena
            score += Math.min(uniqueIpCount || 0, 2);                // unique IPs -> najvise 2 poena

            score = Math.min(score, 100); // ogranicavamo na 100


            // dodajemo u bazu
            const metric = this.metricsRepo.create({
                entityType,
                entityId,
                totalEventCount,
                errorEventCount,
                eventRate,
                alertsBySeverity: {
                    LOW: alertsBySeverity.LOW || 0,
                    MEDIUM: alertsBySeverity.MEDIUM || 0,
                    HIGH: alertsBySeverity.HIGH || 0,
                    CRITICAL: alertsBySeverity.CRITICAL || 0,
                },
                anomalyRate,
                burstAnomaly,
                uniqueServiceCount,
                uniqueIpCount,
                createdAt: new Date(),
                riskScore: score
            });

            await this.metricsRepo.save(metric);

            return score;
        } catch (err) {
            this.logger?.log(`Error while calculating risk score: ${err}`);
            return 0;
        }
    }

    public async getLatestScore(entityType: RiskEntityType, entityId: string): Promise<number | null> {
        if (!this.metricsRepo) return null;

        const latestMetric = await this.metricsRepo.findOne({
            where: { entityType, entityId },
            order: { createdAt: "DESC" }
        });

        return latestMetric?.riskScore ?? null;
    }

    public async getScoreHistory(entityType: RiskEntityType, entityId: string, hours: number): Promise<{ score: number, createdAt: Date }[]> {
        if (!this.metricsRepo) return [];

        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const history = await this.metricsRepo.find({
            where: {
                entityType,
                entityId,
                createdAt: MoreThanOrEqual(since),
            },
            order: { createdAt: "ASC" }
        });

        return history.map(h => ({ score: h.riskScore, createdAt: h.createdAt }));
    }   
}