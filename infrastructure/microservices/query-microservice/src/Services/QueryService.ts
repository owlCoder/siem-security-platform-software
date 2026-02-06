import { DistributionDTO } from "../Domain/DTOs/DistributionDTO";
import { IQueryService } from "../Domain/services/IQueryService";
import { IQueryRepositoryService } from "../Domain/services/IQueryRepositoryService";
import { parseQueryString } from "../Utils/ParseQuery";
import { EventDTO } from "../Domain/DTOs/EventDTO";
import { PdfGenerator } from "../Utils/PdfGenerator";
import { EventsResultDTO } from "../Domain/DTOs/EventsResultDTO";
import { EventsResult } from "../Domain/models/EventsResult";
import { Repository } from "typeorm";
import { Alert } from "../Domain/models/Alert";
import { AlertReportDTO } from "../Domain/DTOs/AlertReportDTO";
import { IQueryAlertRepositoryService } from "../Domain/services/IQueryAlertRepositoryService";


// princip pretrage:
// imamo recnik koji mapira reci iz eventa na event id-eve
// npr. "error" => [1, 5, 7]
// npr. "server1" => [2, 3, 6]
// prilikom pretrage se parsira query string i za svaku rec iz query stringa se dobijaju id-evi iz recnika
// kao rezultat pretrage se vracaju id-evi koji se pojavljuju u barem jednom skupu za svaku rec iz query stringa
// promenljiva lastProcessedId cuva id event-a koji je poslednji procesiran
// kada se pokrene pretraga, prvo se od EventCollector servisa trazi da vrati najveci id eventa koji je sacuvan
// ukoliko je veci od lastProcessedId, znaci da ima novih event-a
// onda se ti event-i uzimaju i azurira se recnik sa njihovim podacima
// na 15 minuta se brisu eventi koji su stariji od 72h, i tada se brisu i njihovi podaci iz recnika
// imamo i mapu koja mapira event id na reci iz eventa za lakse brisanje

export class QueryService implements IQueryService {
    constructor(
        private readonly queryRepositoryService: IQueryRepositoryService,
        private readonly queryAlertRepositoryService: IQueryAlertRepositoryService
    ) { }

    async searchEvents(query: string, page: number = 1, limit: number = 50): Promise<EventsResultDTO> {
        const cacheResult = await this.queryRepositoryService.findByKey(`${query}_p${page}_l${limit}`);
        const lastProcessedId = this.queryRepositoryService.getLastProcessedId();

        if (cacheResult.key !== "NOT_FOUND") {
            if (cacheResult.lastProcessedId === lastProcessedId) {
                return cacheResult.result as EventsResult;
            }
            this.queryRepositoryService.deleteByKey(query);
        }

        const filters = parseQueryString(query);
        const textQuery = filters["text"] || "";
        delete filters["text"];

        let matchingIds: Set<number>;
        const allEvents = await this.queryRepositoryService.getAllEvents();

        if (textQuery !== "") {
            matchingIds = this.queryRepositoryService.findEvents(textQuery.trim().toLowerCase());
        } else {
            matchingIds = new Set(allEvents.map(e => e.id));
        }

        const fullyFilteredEvents = allEvents.filter(event => {
            if (!matchingIds.has(event.id)) return false;
            if (filters.type && event.type.toLowerCase() !== filters.type.toLowerCase()) return false;
            if (filters.dateFrom) {
                const dateFrom = new Date(filters.dateFrom);
                if (new Date(event.timestamp) < dateFrom) return false;
            }
            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                if (new Date(event.timestamp) > dateTo) return false;
            }
            return true;
        });

        const totalResults = fullyFilteredEvents.length;
        const paginatedEvents = fullyFilteredEvents.slice((page - 1) * limit, page * limit);

        const data: EventDTO[] = paginatedEvents.map(e => ({
            id: e.id,
            source: e.source,
            type: e.type,
            description: e.description,
            timestamp: e.timestamp,
            ipAddress: e.ipAddress,
            userId: e.userId,
            userRole: e.userRole
        }));

        const response: EventsResultDTO = {
            total: totalResults,
            data: data,
            page,
            limit
        };

        this.queryRepositoryService.addEntry({
            key: `${query}_p${page}_l${limit}`,
            result: response as any,
            lastProcessedId: lastProcessedId,
        });

        return response;
    }

    public async generatePdfReport(dateFrom: string, dateTo: string, eventType: string): Promise<string> {
        const eventsToReport = await this.queryRepositoryService.getFilteredEvents(dateFrom, dateTo, eventType);

        if (!eventsToReport || eventsToReport.length === 0) {
            return '';
        }

        const data: EventDTO[] = eventsToReport.map(e => ({
            id: e.id,
            source: e.source,
            type: e.type,
            description: e.description,
            timestamp: e.timestamp,
            ipAddress: e.ipAddress,
            userId: e.userId,
            userRole: e.userRole
        }));

        return await PdfGenerator.createReport(data);
    }

    public async generateAlertsPdfReport(
        severity: string,
        status?: string,
        source?: string,
        dateFrom?: string,
        dateTo?: string
    ): Promise<string> {
        try {
            const alerts = await this.queryAlertRepositoryService.getFilteredAlerts(
                severity, status, source, dateFrom, dateTo
            );

            if (!alerts || alerts.length === 0) return "";

            const reportData: AlertReportDTO[] = alerts.map(a => ({
                source: a.source,
                severity: a.severity,
                status: a.status,
                createdAt: a.createdAt.toLocaleString(),
                description: a.source
            }));

            return await PdfGenerator.createAlertReport(reportData);
        } catch (error) {
            console.error("Error in generateAlertsPdfReport:", error);
            throw error;
        }
    }

    async getEventDistribution(): Promise<DistributionDTO> {
    const [infoCount, warningCount, errorCount] = await Promise.all([
      this.queryRepositoryService.getInfoCount(),
      this.queryRepositoryService.getWarningCount(),
      this.queryRepositoryService.getErrorCount(),
    ]);

    console.log("Event counts - Info:", infoCount, "Warning:", warningCount, "Error:", errorCount);
    const total = infoCount + warningCount + errorCount;

    if (total === 0) {
      return { notifications: 0, warnings: 0, errors: 0 };
    }

    const toPct = (x: number) =>
    Math.round((x / total) * 100 * 100) / 100;

    return {
      notifications: toPct(infoCount),
      warnings: toPct(warningCount),
      errors: toPct(errorCount),
    };
  }

}
