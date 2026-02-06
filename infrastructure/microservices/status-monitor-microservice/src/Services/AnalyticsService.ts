import { Repository, MoreThan, Between, LessThanOrEqual, MoreThanOrEqual} from "typeorm";
import { ServiceCheck } from "../Domain/models/ServiceCheck";
import { ServiceStatus } from "../Domain/enums/ServiceStatusEnum";
import { ServiceIncident } from "../Domain/models/ServiceIncident";

export class AnalyticsService {
    constructor(
        private checkRepo: Repository<ServiceCheck>,
        private incidentRepo: Repository<ServiceIncident>
    ) {}

    async calculateStats(serviceName: string, hours: number = 24) {
        const timeLimit = new Date();
        timeLimit.setHours(timeLimit.getHours() - hours);

        const checks = await this.checkRepo.find({
            where: { 
                serviceName, 
                checkedAt: MoreThan(timeLimit) 
            }
        });

        if (checks.length === 0) return { uptime: 0, avgResponseTime: 0, errorRate: 0 };

        const total = checks.length;
        const upCount = checks.filter(c => c.status === ServiceStatus.UP).length;
        const totalResponseTime = checks.reduce((acc, c) => acc + (c.responseTimeMs || 0), 0);
        
        // Error rate su svi koji nisu UP ili imaju specifican errorType
        const errors = checks.filter(c => c.status === ServiceStatus.DOWN).length;

        return {
            uptime: (upCount / total) * 100, // Procentualno
            avgResponseTime: totalResponseTime / (upCount || 1), // Prosecno vreme za uspesne pingove
            errorRate: (errors / total) * 100
        };
    }

    async get30DayHistory(serviceName: string): Promise<Array<{ date: string; hasIncident: boolean; incidentCount: number }>> {
            const history = [];
            const today = new Date();

            // Vrtimo petlju 30 puta (od pre 29 dana do danas)
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(today.getDate() - i);
                date.setHours(0, 0, 0, 0); // Početak dana (ponoć)
                
                const nextDay = new Date(date);
                nextDay.setDate(date.getDate() + 1); // Početak sledećeg dana

                // Brojimo incidente koji su počeli u tom intervalu (date DO nextDay)
                const incidentCount = await this.incidentRepo.count({
                    where: {
                        serviceName: serviceName,
                        startTime: Between(date, nextDay)
                    }
                });

                history.push({
                    date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
                    hasIncident: incidentCount > 0,
                    incidentCount: incidentCount
                });
            }

        return history;
    }
}