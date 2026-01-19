import { error } from "console";
import {
    AlertQueryDTO,
    PaginatedAlertsDTO,
} from "../Domain/DTOs/AlertQueryDTO";
import { IQueryAlertRepositoryService } from "../Domain/services/IQueryAlertRepositoryService";
import { IQueryAlertService } from "../Domain/services/IQueryAlertService";
import { alertQueryDTOToQuery } from "../Utils/AlertQueryDTOToKey";
import { AlertDTO } from "../Domain/DTOs/AlertDTO";

export class QueryAlertService implements IQueryAlertService {
    constructor(
        private readonly queryAlertRepositoryService: IQueryAlertRepositoryService
    ) { }
    async searchAlerts(
        alertQueryDTO: AlertQueryDTO
    ): Promise<PaginatedAlertsDTO> {
        const key: string = alertQueryDTOToQuery(alertQueryDTO);
        const cacheResult = await this.queryAlertRepositoryService.findByKey(key);
        const lastProcessedId =
            this.queryAlertRepositoryService.getLastProcessedId();

        if (cacheResult.key !== "NOT_FOUND") {
            if (cacheResult.lastProcessedId === lastProcessedId) {
                return cacheResult.result as PaginatedAlertsDTO;
            }
            this.queryAlertRepositoryService.deleteByKey(key);
        }
        let matchingIds: Set<number>;
        const allAlerts = await this.queryAlertRepositoryService.getAllAlerts();
        if (alertQueryDTO.source !== "" && alertQueryDTO.source !== undefined) {
            matchingIds = this.queryAlertRepositoryService.findAlerts(
                alertQueryDTO.source.trim().toLowerCase()
            );
        } else {
            matchingIds = new Set(allAlerts.map((e) => e.id));
        }

        const fullyFilteredAlerts = allAlerts.filter((alert) => {
            if (!matchingIds.has(alert.id)) return false;
            if (
                alertQueryDTO.severity &&
                alert.severity.toLowerCase() !== alertQueryDTO.severity.toLowerCase()
            )
                return false;
            if (
                alertQueryDTO.status &&
                alert.status.toLowerCase() !== alertQueryDTO.status.toLowerCase()
            )
                return false;
            return true;
        });
        const totalResults = fullyFilteredAlerts.length;
        const limit = alertQueryDTO.limit ?? 50;
        const page = alertQueryDTO.page ?? 1;
        const totalPages = Math.ceil(totalResults / limit);
        const paginatedAlerts = fullyFilteredAlerts.slice(
            (page - 1) * limit,
            page * limit
        );
        const data: AlertDTO[] = paginatedAlerts.map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            severity: a.severity,
            status: a.status,
            correlatedEvents: a.correlatedEvents,
            source: a.source,
            createdAt: a.createdAt,
            resolvedAt: a.resolvedAt,
            resolvedBy: a.resolvedBy,
            ipAddress: a.ipAddress,
        }));

        const response: PaginatedAlertsDTO = {
            data: data,
            pagination: {
                page: page,
                limit: limit,
                total: totalResults,
                totalPages: totalPages
            }
        };
        this.queryAlertRepositoryService.addEntry({
            key: key,
            result: response as any,
            lastProcessedId: lastProcessedId,
        });

        return response;
       
    }
}
